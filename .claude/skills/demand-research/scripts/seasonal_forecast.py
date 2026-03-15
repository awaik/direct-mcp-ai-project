#!/usr/bin/env python3
"""
Сезонный прогноз бюджета на основе данных частотности из Wordstat.

Анализирует 12-месячные данные и выдаёт рекомендации по распределению бюджета.

Использование:
  # Из JSON (вывод MCP get_search_volume_history)
  echo '{"data": [...]}' | python seasonal_forecast.py

  # Из CSV с колонками Month, Volume
  python seasonal_forecast.py --csv history.csv

  # С указанием текущего бюджета
  python seasonal_forecast.py --csv history.csv --budget 50000
"""

import argparse
import csv
import io
import json
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

# Названия месяцев на русском
MONTH_NAMES = {
    1: "Январь",
    2: "Февраль",
    3: "Март",
    4: "Апрель",
    5: "Май",
    6: "Июнь",
    7: "Июль",
    8: "Август",
    9: "Сентябрь",
    10: "Октябрь",
    11: "Ноябрь",
    12: "Декабрь",
}

# Русские названия месяцев для парсинга
MONTH_PARSE = {
    "январь": 1, "янв": 1, "january": 1, "jan": 1,
    "февраль": 2, "фев": 2, "february": 2, "feb": 2,
    "март": 3, "мар": 3, "march": 3, "mar": 3,
    "апрель": 4, "апр": 4, "april": 4, "apr": 4,
    "май": 5, "may": 5,
    "июнь": 6, "июн": 6, "june": 6, "jun": 6,
    "июль": 7, "июл": 7, "july": 7, "jul": 7,
    "август": 8, "авг": 8, "august": 8, "aug": 8,
    "сентябрь": 9, "сен": 9, "september": 9, "sep": 9,
    "октябрь": 10, "окт": 10, "october": 10, "oct": 10,
    "ноябрь": 11, "ноя": 11, "november": 11, "nov": 11,
    "декабрь": 12, "дек": 12, "december": 12, "dec": 12,
}


@dataclass
class MonthData:
    month: int  # 1-12
    year: Optional[int]
    volume: int
    index: float = 0.0
    budget_multiplier: float = 1.0
    classification: str = "normal"  # high, normal, low


def parse_month(value: str) -> tuple[int, Optional[int]]:
    """Парсит месяц из строки. Возвращает (month_number, year_or_None)."""
    value = value.strip().lower()

    # Формат: "2025-03" или "2025-3"
    if "-" in value:
        parts = value.split("-")
        if len(parts) == 2:
            try:
                year = int(parts[0])
                month = int(parts[1])
                if 1 <= month <= 12:
                    return month, year
            except ValueError:
                pass

    # Формат: "Март 2025" или "March 2025"
    parts = value.split()
    if len(parts) >= 1:
        month_str = parts[0].lower()
        if month_str in MONTH_PARSE:
            month = MONTH_PARSE[month_str]
            year = int(parts[1]) if len(parts) > 1 else None
            return month, year

    # Формат: число от 1 до 12
    try:
        month = int(value)
        if 1 <= month <= 12:
            return month, None
    except ValueError:
        pass

    raise ValueError(f"Не удалось определить месяц из '{value}'")


def read_json_data(content: str) -> list[MonthData]:
    """Читает данные из JSON (формат MCP get_search_volume_history)."""
    data = json.loads(content)

    records = []

    # Формат: {"data": [{"period": "2025-01", "value": 12345}, ...]}
    items = data if isinstance(data, list) else data.get("data", data.get("items", []))

    if isinstance(items, dict):
        # Формат: {"2025-01": 12345, "2025-02": 23456, ...}
        for key, value in items.items():
            month, year = parse_month(key)
            records.append(MonthData(month=month, year=year, volume=int(value)))
    elif isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                # Ищем поле с месяцем
                period = item.get("period", item.get("month", item.get("date", "")))
                volume = item.get("value", item.get("volume", item.get("shows", 0)))
                month, year = parse_month(str(period))
                records.append(MonthData(month=month, year=year, volume=int(volume)))
            elif isinstance(item, (list, tuple)) and len(item) >= 2:
                month, year = parse_month(str(item[0]))
                records.append(MonthData(month=month, year=year, volume=int(item[1])))

    return records


def read_csv_data(csv_path: str) -> list[MonthData]:
    """Читает данные из CSV файла."""
    path = Path(csv_path)
    if not path.exists():
        print(f"Ошибка: файл '{csv_path}' не найден", file=sys.stderr)
        sys.exit(1)

    content = None
    for encoding in ("utf-8-sig", "utf-8", "cp1251"):
        try:
            content = path.read_text(encoding=encoding)
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    if content is None:
        print("Ошибка: не удалось определить кодировку файла", file=sys.stderr)
        sys.exit(1)

    # Определяем разделитель
    first_line = content.split("\n")[0]
    if "\t" in first_line:
        delimiter = "\t"
    elif ";" in first_line:
        delimiter = ";"
    else:
        delimiter = ","

    reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
    records = []

    for row in reader:
        # Ищем колонку с месяцем
        month_val = None
        volume_val = None

        for key, value in row.items():
            key_lower = key.strip().lower()
            if key_lower in ("month", "месяц", "period", "период", "date", "дата"):
                month_val = value
            elif key_lower in ("volume", "частотность", "показы", "value", "значение", "shows"):
                volume_val = value

        if month_val and volume_val:
            try:
                month, year = parse_month(month_val)
                vol = int(
                    volume_val.strip()
                    .replace(",", "")
                    .replace("\xa0", "")
                    .replace(" ", "")
                )
                records.append(MonthData(month=month, year=year, volume=vol))
            except (ValueError, AttributeError):
                continue

    return records


def calculate_forecast(records: list[MonthData]) -> list[MonthData]:
    """Рассчитывает сезонные индексы и множители бюджета."""
    if not records:
        return records

    # Средний объём
    total_volume = sum(r.volume for r in records)
    avg_volume = total_volume / len(records)

    if avg_volume == 0:
        print("Предупреждение: средний объём равен 0", file=sys.stderr)
        return records

    for rec in records:
        # Сезонный индекс
        rec.index = rec.volume / avg_volume

        # Классификация
        if rec.index > 1.2:
            rec.classification = "high"
        elif rec.index < 0.8:
            rec.classification = "low"
        else:
            rec.classification = "normal"

        # Множитель бюджета — пропорционален индексу, но сглажен
        # Не уменьшаем ниже 0.5 и не увеличиваем выше 2.0
        rec.budget_multiplier = max(0.5, min(2.0, rec.index))

    return records


def format_number(n: float) -> str:
    """Форматирует число с разделителями тысяч."""
    return f"{n:,.0f}".replace(",", " ")


def classification_emoji(classification: str) -> str:
    """Текстовая метка для классификации."""
    return {
        "high": "[ВЫСОКИЙ]",
        "normal": "[НОРМА]",
        "low": "[НИЗКИЙ]",
    }.get(classification, "")


def print_report(records: list[MonthData], budget: Optional[float]) -> None:
    """Выводит отчёт в формате markdown."""
    if not records:
        print("Нет данных для анализа", file=sys.stderr)
        sys.exit(1)

    avg_volume = sum(r.volume for r in records) / len(records)
    now = datetime.now()
    current_month = now.month

    print("# Сезонный прогноз бюджета\n")
    print(f"**Период анализа:** {len(records)} месяцев")
    print(f"**Средняя частотность:** {format_number(avg_volume)}")
    if budget:
        print(f"**Базовый месячный бюджет:** {format_number(budget)} руб.")
    print()

    # Основная таблица
    header = "| Месяц | Частотность | Индекс | Сезон | Множитель |"
    if budget:
        header += " Бюджет |"
    header_sep = "|-------|------------|--------|-------|-----------|"
    if budget:
        header_sep += "--------|"

    print(header)
    print(header_sep)

    for rec in records:
        month_name = MONTH_NAMES.get(rec.month, str(rec.month))
        if rec.year:
            month_name = f"{month_name} {rec.year}"

        marker = " <--" if rec.month == current_month and rec.year is None else ""

        row = (
            f"| {month_name}{marker} "
            f"| {format_number(rec.volume)} "
            f"| {rec.index:.2f} "
            f"| {classification_emoji(rec.classification)} "
            f"| x{rec.budget_multiplier:.2f} |"
        )
        if budget:
            rec_budget = budget * rec.budget_multiplier
            row += f" {format_number(rec_budget)} руб. |"

        print(row)

    print()

    # Текущий месяц
    current_rec = None
    for rec in records:
        if rec.month == current_month:
            current_rec = rec
            break

    if current_rec:
        print("## Текущий месяц\n")
        print(f"- **Месяц:** {MONTH_NAMES.get(current_month, current_month)}")
        print(f"- **Сезонный индекс:** {current_rec.index:.2f}")
        print(f"- **Классификация:** {classification_emoji(current_rec.classification)}")
        if budget:
            rec_budget = budget * current_rec.budget_multiplier
            print(f"- **Рекомендуемый бюджет:** {format_number(rec_budget)} руб. "
                  f"({current_rec.budget_multiplier:.0%} от нормы)")
        print()

    # Рекомендации
    high_months = [r for r in records if r.classification == "high"]
    low_months = [r for r in records if r.classification == "low"]

    print("## Рекомендации\n")

    if high_months:
        names = ", ".join(MONTH_NAMES.get(r.month, str(r.month)) for r in high_months)
        print(f"**Пиковые месяцы ({names}):**")
        print("- Увеличить бюджет для максимального охвата")
        print("- Повысить ставки — конкуренция растёт")
        print("- Подготовить объявления и посадочные заранее")
        print()

    if low_months:
        names = ", ".join(MONTH_NAMES.get(r.month, str(r.month)) for r in low_months)
        print(f"**Низкий сезон ({names}):**")
        print("- Снизить бюджет, перераспределить на пиковые месяцы")
        print("- Сосредоточиться на высококонверсионных запросах")
        print("- Использовать время для A/B-тестов объявлений")
        print()

    if budget:
        total_year = sum(budget * r.budget_multiplier for r in records)
        total_flat = budget * 12
        diff = total_year - total_flat
        print(f"**Годовой бюджет (равномерный):** {format_number(total_flat)} руб.")
        print(f"**Годовой бюджет (сезонный):** {format_number(total_year)} руб.")
        if abs(diff) > 1:
            print(f"**Разница:** {format_number(abs(diff))} руб. "
                  f"({'больше' if diff > 0 else 'меньше'})")
        print()
        print("_Сезонное распределение того же годового бюджета даёт лучший ROI: "
              "больше показов в пик спроса, меньше расхода в мёртвый сезон._")


def main():
    parser = argparse.ArgumentParser(
        description="Сезонный прогноз бюджета из данных Wordstat",
    )
    parser.add_argument(
        "--csv",
        help="Путь к CSV-файлу (колонки: Month, Volume)",
        default=None,
    )
    parser.add_argument(
        "--budget",
        type=float,
        help="Текущий месячный бюджет (руб.) для абсолютных рекомендаций",
        default=None,
    )

    args = parser.parse_args()

    if args.csv:
        records = read_csv_data(args.csv)
    else:
        # Читаем JSON из stdin
        content = sys.stdin.read().strip()
        if not content:
            print("Ошибка: нет данных. Укажите --csv или передайте JSON в stdin",
                  file=sys.stderr)
            sys.exit(1)
        records = read_json_data(content)

    if not records:
        print("Ошибка: не удалось прочитать данные", file=sys.stderr)
        sys.exit(1)

    # Сортируем по месяцу
    records.sort(key=lambda r: (r.year or 0, r.month))

    calculate_forecast(records)
    print_report(records, args.budget)


if __name__ == "__main__":
    main()
