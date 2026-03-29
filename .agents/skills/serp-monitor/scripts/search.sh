#!/usr/bin/env bash
# search.sh — поиск в Яндексе через XML API
# Использование:
#   search.sh --query "доставка цветов москва"
#   search.sh --query "доставка цветов" --region 2          # Санкт-Петербург
#   search.sh --query "купить цветы" --domain mysite.ru     # свой домен
#
# Выдаёт таблицу результатов с позициями. Ваш домен помечен ★.
# На коммерческих запросах позиции 1-4 обычно рекламные (premium).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../_shared/common.sh"

load_config

# ─── Параметры ────────────────────────────────────────

QUERY=""
REGION="213"   # Москва по умолчанию
DOMAIN="${SITE_DOMAIN:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --query)  QUERY="$2";  shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    *) echo "ERROR: Неизвестный параметр: $1" >&2; exit 1 ;;
  esac
done

require_param "query" "$QUERY"

if [[ -z "${YANDEX_XML_USER:-}" ]]; then
  echo "ERROR: YANDEX_XML_USER не задан в tokens.env" >&2
  echo "  → Зарегистрируйтесь на https://xml.yandex.ru/" >&2
  echo "  → Добавьте в tokens.env: YANDEX_XML_USER=ваш_логин" >&2
  exit 1
fi

if [[ -z "${YANDEX_XML_KEY:-}" ]]; then
  echo "ERROR: YANDEX_XML_KEY не задан в tokens.env" >&2
  echo "  → Получите ключ на https://xml.yandex.ru/" >&2
  echo "  → Добавьте в tokens.env: YANDEX_XML_KEY=ваш_ключ" >&2
  exit 1
fi

# ─── Запрос к Yandex XML API ─────────────────────────

# URL-encode запроса
ENCODED_QUERY=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''${QUERY}'''))")

URL="https://yandex.ru/search/xml?user=${YANDEX_XML_USER}&key=${YANDEX_XML_KEY}&query=${ENCODED_QUERY}&lr=${REGION}&groupby=attr%3Dd.mode%3Ddeep.groups-on-page%3D50.docs-in-group%3D1"

# Кешируем на стандартный TTL (6 часов)
CACHE_ID="serp_search_${QUERY}_${REGION}"

RESPONSE=$(cached_get "$CACHE_ID" "" "$URL") || {
  echo "ERROR: Не удалось выполнить поиск" >&2
  echo "  → Проверьте YANDEX_XML_USER и YANDEX_XML_KEY в tokens.env" >&2
  echo "  → Квота: 10 запросов/день на бесплатном тарифе" >&2
  exit 1
}

# ─── Парсинг XML и вывод ─────────────────────────────

echo "$RESPONSE" | python3 -c "
import xml.etree.ElementTree as ET
import sys
import re

# Читаем XML из stdin
xml_data = sys.stdin.read()

# Домен для подсветки
our_domain = '${DOMAIN}'.lower().strip()

# Регион
region = '${REGION}'
region_names = {
    '213': 'Москва', '2': 'Санкт-Петербург', '54': 'Екатеринбург',
    '43': 'Казань', '66': 'Нижний Новгород', '56': 'Новосибирск',
    '35': 'Краснодар', '37': 'Ростов-на-Дону', '47': 'Красноярск',
    '65': 'Самара', '172': 'Уфа', '10000': 'Россия',
    '159': 'Казахстан', '149': 'Беларусь',
}
region_name = region_names.get(region, f'lr={region}')

try:
    root = ET.fromstring(xml_data)
except ET.ParseError as e:
    print(f'ERROR: Не удалось разобрать XML ответ: {e}', file=sys.stderr)
    # Проверяем на ошибки в тексте ответа
    if 'error' in xml_data.lower():
        print(f'Ответ сервера: {xml_data[:500]}', file=sys.stderr)
    sys.exit(1)

# Проверяем на ошибку API
error = root.find('.//error')
if error is not None:
    error_code = error.get('code', '?')
    error_text = error.text or 'Неизвестная ошибка'
    print(f'ERROR: Yandex XML API ошибка {error_code}: {error_text}', file=sys.stderr)
    if error_code == '15':
        print('  -> Квота исчерпана на сегодня (бесплатный лимит 10 запросов/день)', file=sys.stderr)
    elif error_code == '18':
        print('  -> Неверный ключ или пользователь. Проверьте YANDEX_XML_USER и YANDEX_XML_KEY', file=sys.stderr)
    sys.exit(1)

# Извлекаем результаты
results = []
groups = root.findall('.//group')

for i, group in enumerate(groups, 1):
    doc = group.find('doc')
    if doc is None:
        continue

    url_el = doc.find('url')
    domain_el = doc.find('domain')
    title_el = doc.find('title')
    passages = doc.find('passages')

    url = url_el.text if url_el is not None else '—'
    domain = domain_el.text if domain_el is not None else '—'

    # Заголовок может содержать вложенные теги (hlword)
    title = ''
    if title_el is not None:
        title = ''.join(title_el.itertext()).strip()
    title = title or '—'

    # Сниппет
    snippet = ''
    if passages is not None:
        passage = passages.find('passage')
        if passage is not None:
            snippet = ''.join(passage.itertext()).strip()

    results.append({
        'position': i,
        'url': url,
        'domain': domain.lower().replace('www.', ''),
        'domain_raw': domain,
        'title': title[:80] + ('...' if len(title) > 80 else ''),
        'snippet': snippet[:120] + ('...' if len(snippet) > 120 else ''),
    })

query = '''${QUERY}'''
print(f'## Результаты поиска: \"{query}\" (регион: {region_name})')
print()

if not results:
    print('Результаты не найдены.')
    sys.exit(0)

# Таблица результатов
print(f'| # | Домен | Заголовок | Тип |')
print(f'|---|-------|-----------|-----|')

our_position = None
our_clean = our_domain.replace('www.', '') if our_domain else ''

for r in results:
    pos = r['position']
    domain_display = r['domain_raw']

    # Подсветка нашего домена
    is_ours = our_clean and (our_clean in r['domain'])
    if is_ours:
        domain_display = f\"{domain_display} ★\"
        our_position = pos

    # Тип позиции (на коммерческих запросах 1-4 обычно premium)
    pos_type = '—'

    print(f'| {pos} | {domain_display} | {r[\"title\"]} | {pos_type} |')

    # Показываем только топ-20 для читабельности
    if pos >= 20:
        remaining = len(results) - 20
        if remaining > 0:
            print(f'| ... | ещё {remaining} результатов | | |')
        break

print()

# Итог по нашей позиции
print('### Ваша позиция')
if not our_clean:
    print('Домен не задан. Укажите --domain или SITE_DOMAIN в tokens.env')
elif our_position:
    zone = ''
    if our_position <= 4:
        zone = ' (зона Premium — рекламный блок над результатами)'
    elif our_position <= 8:
        zone = ' (верхняя часть выдачи)'
    print(f'★ {our_clean} — #{our_position} в результатах{zone}')
else:
    print(f'{our_clean} — не найден в результатах (проверьте, показывается ли реклама по этому запросу)')
"
