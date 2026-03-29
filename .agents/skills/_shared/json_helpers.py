#!/usr/bin/env python3
"""JSON-хелперы для скиллов: парсинг, таблицы, извлечение данных из PROJECTS.md."""

import json
import sys
import re


def extract(data, path):
    """Извлечение значения по JSON-пути: 'key1.key2[0].key3'."""
    for part in re.split(r'\.|\[(\d+)\]', path):
        if part is None or part == '':
            continue
        if part.isdigit():
            data = data[int(part)]
        else:
            data = data[part]
    return data


def format_table(headers, rows, align=None):
    """Форматирование данных в markdown-таблицу."""
    if not rows:
        return "Нет данных"

    widths = [len(str(h)) for h in headers]
    str_rows = []
    for row in rows:
        str_row = [str(v) if v is not None else '—' for v in row]
        str_rows.append(str_row)
        for i, v in enumerate(str_row):
            if i < len(widths):
                widths[i] = max(widths[i], len(v))

    if align is None:
        align = ['l'] * len(headers)

    def pad(val, width, a):
        return val.rjust(width) if a == 'r' else val.ljust(width)

    header_line = '| ' + ' | '.join(
        pad(str(h), widths[i], align[i]) for i, h in enumerate(headers)
    ) + ' |'

    sep_parts = []
    for i, w in enumerate(widths):
        if align[i] == 'r':
            sep_parts.append('-' * (w + 1) + ':|')
        else:
            sep_parts.append('-' * (w + 2) + '|')
    sep_line = '|' + ''.join(sep_parts)

    lines = [header_line, sep_line]
    for row in str_rows:
        line = '| ' + ' | '.join(
            pad(row[i] if i < len(row) else '—', widths[i], align[i])
            for i in range(len(headers))
        ) + ' |'
        lines.append(line)

    return '\n'.join(lines)


def format_number(n, decimals=0):
    """1234567 → 1 234 567"""
    if n is None:
        return '—'
    if isinstance(n, float):
        formatted = f"{n:,.{decimals}f}"
    else:
        formatted = f"{n:,}"
    return formatted.replace(',', ' ')


def format_currency(n, decimals=0):
    """1234.5 → 1 235₽"""
    return format_number(n, decimals) + '₽'


def format_percent(n, decimals=1):
    """15.6 → 15.6% (вход уже в процентах)"""
    if n is None:
        return '—'
    return f"{n:.{decimals}f}%"


def health_status(value, good_threshold, bad_threshold, lower_is_better=True):
    """Оценка здоровья метрики."""
    if value is None:
        return '❓ НЕТ ДАННЫХ'
    if lower_is_better:
        if value <= good_threshold:
            return '🟢 GOOD'
        elif value <= bad_threshold:
            return '🟡 ATTENTION'
        else:
            return '🔴 CRITICAL'
    else:
        if value >= good_threshold:
            return '🟢 GOOD'
        elif value >= bad_threshold:
            return '🟡 ATTENTION'
        else:
            return '🔴 CRITICAL'


def extract_project_value(key, text):
    """Извлечение значений из PROJECTS.md."""
    patterns = {
        'counter_id': r'\*\*ID:\*\*\s*`(\d+)`',
        'goal_id': r'ID цели.*?\|\s*(\d+)',
        'cpa_good': r'CPA\s*<\s*([\d\s]+?)₽',
        'cpa_bad': r'CPA\s*>\s*([\d\s]+?)₽',
        'domain': r'https?://([^\s/]+)',
    }
    pattern = patterns.get(key)
    if not pattern:
        return None

    match = re.search(pattern, text)
    if not match:
        return None

    result = match.group(1).replace(' ', '').strip()
    return result


def parse_metrika_response(data):
    """Парсинг ответа Metrika Stat API в таблицу."""
    query = data.get('query', {})
    dim_names = query.get('dimensions', [])
    metric_names = query.get('metrics', [])

    headers = [d.split(':')[-1] for d in dim_names] + [m.split(':')[-1] for m in metric_names]

    rows = []
    for item in data.get('data', []):
        row = [d.get('name', d.get('id', '')) for d in item.get('dimensions', [])]
        row += item.get('metrics', [])
        rows.append(row)

    totals = data.get('totals', [])
    if totals:
        total_row = ['ИТОГО'] + [''] * (len(dim_names) - 1) + totals
        rows.append(total_row)

    return headers, rows


def cmd_campaign_report():
    """Обработка ответа для campaign_report: трафик + расходы + CPA."""
    data = json.load(sys.stdin)

    traffic = data.get('traffic', {})
    costs = data.get('costs', {})
    cpa_good = data.get('cpa_good')
    cpa_bad = data.get('cpa_bad')
    goal_name = data.get('goal_name', 'цель')

    # Трафик
    t_data = traffic.get('data', [{}])
    t_row = t_data[0] if t_data else {}
    t_metrics = t_row.get('metrics', [0, 0, 0, 0])

    visits = t_metrics[0] if len(t_metrics) > 0 else 0
    bounce = t_metrics[1] if len(t_metrics) > 1 else 0
    depth = t_metrics[2] if len(t_metrics) > 2 else 0
    conversions = t_metrics[3] if len(t_metrics) > 3 else 0

    # Расходы
    c_data = costs.get('data', [{}])
    c_row = c_data[0] if c_data else {}
    c_metrics = c_row.get('metrics', [0, 0])

    ad_cost = c_metrics[0] if len(c_metrics) > 0 else 0
    ad_clicks = c_metrics[1] if len(c_metrics) > 1 else 0

    # CPA
    cpa = ad_cost / conversions if conversions > 0 else None

    # Здоровье
    cpa_status = '—'
    cpa_advice = ''
    if cpa is not None and cpa_good and cpa_bad:
        cpa_g = float(cpa_good)
        cpa_b = float(cpa_bad)
        cpa_status = health_status(cpa, cpa_g, cpa_b, lower_is_better=True)
        if cpa > cpa_b:
            cpa_advice = f'CPA {format_currency(cpa)} > порог {format_currency(cpa_b)} → проверь поисковые запросы через get_search_queries'
        elif cpa > cpa_g:
            cpa_advice = f'CPA {format_currency(cpa)} в зоне внимания — наблюдаем'

    # Вывод
    print(f"## Отчёт по кампании\n")
    print(f"| Метрика | Значение |")
    print(f"|---------|----------|")
    print(f"| Визиты | {format_number(visits)} |")
    print(f"| Отказы | {format_percent(bounce)} |")
    print(f"| Глубина просмотра | {format_number(depth, 1)} |")
    print(f"| Конверсии ({goal_name}) | {format_number(conversions)} |")
    print(f"| Расход на рекламу | {format_currency(ad_cost, 2)} |")
    print(f"| Клики (реклама) | {format_number(ad_clicks)} |")
    print(f"| **CPA** | **{format_currency(cpa, 2) if cpa else '—'}** |")
    print(f"| Здоровье CPA | {cpa_status} |")

    if cpa_advice:
        print(f"\n### Рекомендация\n{cpa_advice}")


# ─── CLI ───────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Использование: json_helpers.py <команда> [аргументы]", file=sys.stderr)
        print("Команды: extract, table, parse_metrika, campaign_report, extract_project_value", file=sys.stderr)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == 'extract':
        path = sys.argv[2] if len(sys.argv) > 2 else ''
        data = json.load(sys.stdin)
        result = extract(data, path) if path else data
        if isinstance(result, (dict, list)):
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(result)

    elif cmd == 'table':
        data = json.load(sys.stdin)
        headers = data.get('headers', [])
        rows = data.get('rows', [])
        align = data.get('align')
        print(format_table(headers, rows, align))

    elif cmd == 'extract_project_value':
        key = sys.argv[2]
        text = sys.stdin.read()
        result = extract_project_value(key, text)
        if result:
            print(result)
        else:
            sys.exit(1)

    elif cmd == 'parse_metrika':
        data = json.load(sys.stdin)
        headers, rows = parse_metrika_response(data)
        print(format_table(headers, rows))

    elif cmd == 'campaign_report':
        cmd_campaign_report()

    elif cmd == 'format_number':
        n = float(sys.stdin.read().strip())
        decimals = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        print(format_number(n, decimals))

    else:
        print(f"Неизвестная команда: {cmd}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
