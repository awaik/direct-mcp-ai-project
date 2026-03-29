#!/usr/bin/env bash
# search_region.sh — справочник регионов Яндекса (коды lr)
# Использование:
#   search_region.sh                    # все регионы
#   search_region.sh --search "Петер"   # поиск по имени

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../_shared/common.sh"

# Конфиг не нужен — данные захардкожены

# ─── Параметры ────────────────────────────────────────

SEARCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --search) SEARCH="$2"; shift 2 ;;
    *) echo "ERROR: Неизвестный параметр: $1" >&2; exit 1 ;;
  esac
done

# ─── Справочник регионов ─────────────────────────────

python3 -c "
import sys

regions = [
    ('213', 'Москва'),
    ('2', 'Санкт-Петербург'),
    ('54', 'Екатеринбург'),
    ('43', 'Казань'),
    ('66', 'Нижний Новгород'),
    ('56', 'Новосибирск'),
    ('35', 'Краснодар'),
    ('37', 'Ростов-на-Дону'),
    ('47', 'Красноярск'),
    ('65', 'Самара'),
    ('172', 'Уфа'),
    ('159', 'Казахстан'),
    ('149', 'Беларусь'),
    ('169', 'Грузия'),
    ('181', 'Израиль'),
    ('96', 'Германия'),
    ('983', 'Турция'),
    ('210', 'ОАЭ'),
    ('225', 'США'),
    ('10000', 'Россия (вся)'),
]

search = '''${SEARCH}'''.strip().lower()

if search:
    filtered = [(lr, name) for lr, name in regions if search in name.lower() or search in lr]
else:
    filtered = regions

if not filtered:
    print(f'Регион \"{search}\" не найден в справочнике.')
    print('Полный список кодов: https://yandex.ru/dev/xml/doc/dg/reference/regions.html')
    sys.exit(0)

print('## Коды регионов Яндекса (lr)')
print()
print('| lr | Регион |')
print('|----|--------|')
for lr, name in filtered:
    print(f'| {lr} | {name} |')

print()
print('Использование: \`search.sh --query \"запрос\" --region 213\`')
print()
print('Полный список: https://yandex.ru/dev/xml/doc/dg/reference/regions.html')
"
