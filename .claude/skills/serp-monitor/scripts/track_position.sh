#!/usr/bin/env bash
# track_position.sh — отслеживание позиций по ключевому запросу
# Использование:
#   track_position.sh --query "доставка цветов москва"
#   track_position.sh --query "доставка цветов" --region 2
#   track_position.sh --query "купить цветы" --domain mysite.ru
#
# Сохраняет позицию в CSV (data/serp-history/) и показывает тренд.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../_shared/common.sh"

load_config

# ─── Параметры ────────────────────────────────────────

QUERY=""
REGION="213"
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

if [[ -z "$DOMAIN" ]]; then
  echo "ERROR: Домен не задан" >&2
  echo "  → Укажите --domain mysite.ru или SITE_DOMAIN в tokens.env" >&2
  exit 1
fi

# ─── Получить текущую позицию через search.sh ────────

SEARCH_OUTPUT=$("${SCRIPT_DIR}/search.sh" --query "$QUERY" --region "$REGION" --domain "$DOMAIN") || {
  echo "ERROR: Не удалось выполнить поиск" >&2
  exit 1
}

# Извлечь позицию и количество конкурентов выше нас
POSITION_DATA=$(echo "$SEARCH_OUTPUT" | python3 -c "
import sys
import re

lines = sys.stdin.read()

# Ищем строку с нашей позицией: '★ domain — #N в результатах'
match = re.search(r'★\s+\S+\s+—\s+#(\d+)\s+в результатах', lines)
if match:
    position = int(match.group(1))
    competitors_above = position - 1
    print(f'{position},{competitors_above}')
else:
    # Не найден в результатах
    print('-1,0')
")

POSITION=$(echo "$POSITION_DATA" | cut -d',' -f1)
COMPETITORS_ABOVE=$(echo "$POSITION_DATA" | cut -d',' -f2)

# ─── Записать в CSV ──────────────────────────────────

# Slug для имени файла: lowercase, пробелы → подчёркивания
KEYWORD_SLUG=$(echo "$QUERY" | python3 -c "
import sys, re
q = sys.stdin.read().strip().lower()
q = re.sub(r'[^a-zA-Zа-яА-ЯёЁ0-9]+', '_', q)
q = q.strip('_')
print(q)
")

HISTORY_DIR="${SCRIPT_DIR}/../data/serp-history"
mkdir -p "$HISTORY_DIR"

CSV_FILE="${HISTORY_DIR}/${KEYWORD_SLUG}.csv"
TODAY=$(today)

# Создать CSV с заголовком если его нет
if [[ ! -f "$CSV_FILE" ]]; then
  echo "date,query,region,position,competitors_above" > "$CSV_FILE"
fi

# Проверить, есть ли уже запись за сегодня
if grep -q "^${TODAY}," "$CSV_FILE" 2>/dev/null; then
  # Обновить существующую запись за сегодня
  # Используем временный файл для замены
  TMPFILE=$(mktemp)
  python3 -c "
import sys
today = '${TODAY}'
new_line = '${TODAY},${QUERY},${REGION},${POSITION},${COMPETITORS_ABOVE}'
with open('${CSV_FILE}', 'r') as f:
    lines = f.readlines()
with open('${TMPFILE}', 'w') as f:
    for line in lines:
        if line.startswith(today + ','):
            f.write(new_line + '\n')
        else:
            f.write(line)
"
  mv "$TMPFILE" "$CSV_FILE"
else
  # Добавить новую запись
  echo "${TODAY},${QUERY},${REGION},${POSITION},${COMPETITORS_ABOVE}" >> "$CSV_FILE"
fi

# ─── Вывод результата ────────────────────────────────

OUR_CLEAN=$(echo "$DOMAIN" | sed 's/^www\.//')

echo "## Отслеживание позиции: \"${QUERY}\""
echo ""

if [[ "$POSITION" == "-1" ]]; then
  echo "**${OUR_CLEAN}** — не найден в результатах (регион: lr=${REGION})"
  echo ""
  echo "Возможные причины:"
  echo "- Реклама не показывается по этому запросу"
  echo "- Кампания приостановлена или бюджет исчерпан"
  echo "- Запрос не соответствует ключевым словам кампании"
else
  ZONE=""
  if [[ "$POSITION" -le 4 ]]; then
    ZONE=" (Premium)"
  elif [[ "$POSITION" -le 8 ]]; then
    ZONE=" (верх выдачи)"
  fi

  echo "**${OUR_CLEAN}** — позиция **#${POSITION}**${ZONE} (конкурентов выше: ${COMPETITORS_ABOVE})"
fi

echo ""
echo "Записано в: \`${CSV_FILE}\`"
echo ""

# ─── Тренд (если 7+ записей) ─────────────────────────

ENTRY_COUNT=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')

if [[ "$ENTRY_COUNT" -ge 2 ]]; then
  echo "### Динамика позиции"
  echo ""

  python3 -c "
import csv
import sys

rows = []
with open('${CSV_FILE}', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

if len(rows) < 2:
    sys.exit(0)

# Последние записи (до 10)
recent = rows[-10:]

# Таблица истории
print('| Дата | Позиция | Конкурентов выше |')
print('|------|---------|-----------------|')
for r in recent:
    pos = r['position']
    pos_display = f'#{pos}' if pos != '-1' else 'не найден'
    print(f'| {r[\"date\"]} | {pos_display} | {r[\"competitors_above\"]} |')

print()

# Тренд
if len(rows) >= 7:
    positions = [int(r['position']) for r in rows if r['position'] != '-1']
    if len(positions) >= 2:
        first_week = positions[:len(positions)//2]
        second_week = positions[len(positions)//2:]
        avg_first = sum(first_week) / len(first_week)
        avg_second = sum(second_week) / len(second_week)

        first_pos = positions[0]
        last_pos = positions[-1]

        if last_pos < first_pos:
            print(f'**Тренд: улучшение** с #{first_pos} до #{last_pos} (средняя: {avg_first:.1f} -> {avg_second:.1f})')
        elif last_pos > first_pos:
            print(f'**Тренд: ухудшение** с #{first_pos} до #{last_pos} (средняя: {avg_first:.1f} -> {avg_second:.1f})')
        else:
            print(f'**Тренд: стабильно** #{last_pos} (средняя: {avg_second:.1f})')
    else:
        print('Недостаточно данных для тренда (позиция не найдена в большинстве замеров)')
elif len(rows) >= 2:
    valid = [r for r in rows if r['position'] != '-1']
    if len(valid) >= 2:
        first = int(valid[0]['position'])
        last = int(valid[-1]['position'])
        if last < first:
            print(f'Тенденция: улучшение #{first} -> #{last} (нужно 7+ замеров для надёжного тренда)')
        elif last > first:
            print(f'Тенденция: ухудшение #{first} -> #{last} (нужно 7+ замеров для надёжного тренда)')
        else:
            print(f'Тенденция: стабильно #{last} (нужно 7+ замеров для надёжного тренда)')
"
fi

# ─── Вывод полных результатов поиска ──────────────────

echo ""
echo "---"
echo ""
echo "$SEARCH_OUTPUT"
