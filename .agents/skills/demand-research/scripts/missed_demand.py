#!/usr/bin/env python3
"""
Анализ упущенного спроса из CSV-экспорта поисковых запросов Яндекс Директа.

Категоризирует поисковые запросы:
  OPPORTUNITIES — есть конверсии, но запрос не в текущих ключевых
  WASTE — значительный расход при 0 конверсиях
  INFORMATIONAL — информационный интент (кандидат в минус-слова)
  OK — покрыто ключевыми, есть конверсии

Использование:
  python missed_demand.py search_queries.csv
  python missed_demand.py search_queries.csv --keywords-file keywords.txt --min-cost 200
  cat search_queries.csv | python missed_demand.py -
"""

import argparse
import csv
import io
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


# Маппинг русских заголовков CSV на внутренние имена
HEADER_MAP = {
    # Английские
    "searchquery": "query",
    "query": "query",
    "search query": "query",
    "impressions": "impressions",
    "clicks": "clicks",
    "cost": "cost",
    "conversions": "conversions",
    # Русские
    "поисковый запрос": "query",
    "запрос": "query",
    "показы": "impressions",
    "клики": "clicks",
    "расход": "cost",
    "стоимость": "cost",
    "расход (руб.)": "cost",
    "конверсии": "conversions",
    "целевые действия": "conversions",
}

# Паттерны информационного интента
INFORMATIONAL_PATTERNS = [
    r"\bчто\s+такое\b",
    r"\bкак\s+",
    r"\bзачем\b",
    r"\bпочему\b",
    r"\bотзыв[ыа]?\b",
    r"\bрейтинг\b",
    r"\bсравнени[ея]\b",
    r"\bлучши[йех]\b",
    r"\bфорум\b",
    r"\bсвоими\s+руками\b",
    r"\bбесплатно\b",
    r"\bскачать\b",
    r"\bреферат\b",
    r"\bкурсовая\b",
    r"\bвикипедия\b",
    r"\bwiki\b",
    r"\bчем\s+отличается\b",
    r"\bвиды\b",
    r"\bтипы\b",
    r"\bклассификаци[яю]\b",
    r"\bистори[яю]\b",
    r"\bопределение\b",
    r"\bпримеры?\b",
    r"\bинструкци[яю]\b",
    r"\bсхема\b",
    r"\bчертеж\b",
    r"\bсвоими руками\b",
    r"\bсамостоятельно\b",
    r"\bdiy\b",
]

INFORMATIONAL_RE = re.compile("|".join(INFORMATIONAL_PATTERNS), re.IGNORECASE)


@dataclass
class QueryRecord:
    query: str
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    category: str = ""


def normalize_header(header: str) -> Optional[str]:
    """Нормализует заголовок CSV в внутреннее имя поля."""
    h = header.strip().lower().replace("_", " ")
    return HEADER_MAP.get(h)


def read_csv_data(source: str) -> list[QueryRecord]:
    """Читает CSV из файла или stdin. Поддерживает Windows-1251 и UTF-8."""
    records = []

    if source == "-":
        content = sys.stdin.read()
    else:
        path = Path(source)
        if not path.exists():
            print(f"Ошибка: файл '{source}' не найден", file=sys.stderr)
            sys.exit(1)

        # Пробуем UTF-8, потом Windows-1251 (стандарт экспорта Яндекса)
        content = None
        for encoding in ("utf-8-sig", "utf-8", "cp1251", "windows-1251"):
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

    # Маппинг заголовков
    if reader.fieldnames is None:
        print("Ошибка: не удалось прочитать заголовки CSV", file=sys.stderr)
        sys.exit(1)

    col_map = {}
    for original in reader.fieldnames:
        normalized = normalize_header(original)
        if normalized:
            col_map[normalized] = original

    required = {"query"}
    missing = required - set(col_map.keys())
    if missing:
        print(f"Ошибка: не найдены обязательные колонки: {missing}", file=sys.stderr)
        print(f"Найденные заголовки: {reader.fieldnames}", file=sys.stderr)
        sys.exit(1)

    for row in reader:
        try:
            query = row.get(col_map.get("query", ""), "").strip()
            if not query:
                continue

            def parse_num(key: str, default=0) -> float:
                col = col_map.get(key)
                if col is None:
                    return default
                val = row.get(col, "").strip().replace(",", ".").replace("\xa0", "").replace(" ", "")
                if not val or val == "--" or val == "-":
                    return default
                return float(val)

            records.append(QueryRecord(
                query=query,
                impressions=int(parse_num("impressions")),
                clicks=int(parse_num("clicks")),
                cost=parse_num("cost"),
                conversions=parse_num("conversions"),
            ))
        except (ValueError, KeyError):
            continue  # Пропускаем строки с ошибками

    return records


def load_keywords(keywords_file: Optional[str]) -> set[str]:
    """Загружает список текущих ключевых слов из файла."""
    if not keywords_file:
        return set()

    path = Path(keywords_file)
    if not path.exists():
        print(f"Предупреждение: файл ключевых '{keywords_file}' не найден, "
              f"категория OPPORTUNITIES будет неточной", file=sys.stderr)
        return set()

    keywords = set()
    content = path.read_text(encoding="utf-8")
    for line in content.strip().split("\n"):
        kw = line.strip().lower()
        # Убираем операторы Wordstat
        kw = re.sub(r'["\[\]!+]', "", kw).strip()
        if kw and not kw.startswith("#"):
            keywords.add(kw)

    return keywords


def is_informational(query: str) -> bool:
    """Проверяет, является ли запрос информационным по паттернам."""
    return bool(INFORMATIONAL_RE.search(query))


def query_matches_keyword(query: str, keywords: set[str]) -> bool:
    """Проверяет, покрыт ли запрос одним из ключевых слов."""
    query_lower = query.lower().strip()
    if query_lower in keywords:
        return True
    # Проверяем, содержит ли запрос ключевое слово как подстроку
    query_words = set(query_lower.split())
    for kw in keywords:
        kw_words = set(kw.split())
        if kw_words and kw_words.issubset(query_words):
            return True
    return False


def categorize(records: list[QueryRecord], keywords: set[str],
               min_cost: float, min_conversions: float) -> list[QueryRecord]:
    """Категоризирует запросы."""
    for rec in records:
        if is_informational(rec.query):
            rec.category = "INFORMATIONAL"
        elif rec.conversions >= min_conversions:
            if keywords and not query_matches_keyword(rec.query, keywords):
                rec.category = "OPPORTUNITY"
            else:
                rec.category = "OK"
        elif rec.cost >= min_cost and rec.conversions == 0:
            rec.category = "WASTE"
        else:
            rec.category = "OK"

    return records


def format_cost(cost: float) -> str:
    """Форматирует стоимость в рубли."""
    if cost >= 1_000_000:
        # Если данные в микроюнитах — конвертируем
        cost = cost / 1_000_000
    return f"{cost:,.0f}".replace(",", " ")


def truncate(text: str, max_len: int = 50) -> str:
    """Обрезает текст до max_len символов."""
    if len(text) <= max_len:
        return text
    return text[:max_len - 3] + "..."


def print_report(records: list[QueryRecord]) -> None:
    """Выводит отчёт в формате markdown."""
    opportunities = sorted(
        [r for r in records if r.category == "OPPORTUNITY"],
        key=lambda r: r.conversions, reverse=True,
    )
    waste = sorted(
        [r for r in records if r.category == "WASTE"],
        key=lambda r: r.cost, reverse=True,
    )
    informational = sorted(
        [r for r in records if r.category == "INFORMATIONAL"],
        key=lambda r: r.cost, reverse=True,
    )
    ok = [r for r in records if r.category == "OK"]

    total = len(records)
    total_cost = sum(r.cost for r in records)
    waste_cost = sum(r.cost for r in waste)
    info_cost = sum(r.cost for r in informational)
    opp_conversions = sum(r.conversions for r in opportunities)

    print("# Анализ упущенного спроса\n")
    print(f"**Всего запросов:** {total}")
    print(f"**Общий расход:** {format_cost(total_cost)} руб.")
    print()

    # Сводка
    print("## Сводка\n")
    print(f"| Категория | Кол-во | Расход | Конверсии |")
    print(f"|-----------|--------|--------|-----------|")
    for label, group in [
        ("OPPORTUNITY", opportunities),
        ("WASTE", waste),
        ("INFORMATIONAL", informational),
        ("OK", ok),
    ]:
        g_cost = sum(r.cost for r in group)
        g_conv = sum(r.conversions for r in group)
        print(f"| {label} | {len(group)} | {format_cost(g_cost)} | {g_conv:.0f} |")
    print()

    # Opportunities
    if opportunities:
        print("## OPPORTUNITIES — Добавить как ключевые слова\n")
        print("Запросы с конверсиями, которые не покрыты текущими ключевыми.\n")
        print(f"| Запрос | Показы | Клики | Расход | Конверсии |")
        print(f"|--------|--------|-------|--------|-----------|")
        for r in opportunities[:30]:
            print(f"| {truncate(r.query)} | {r.impressions} | {r.clicks} "
                  f"| {format_cost(r.cost)} | {r.conversions:.0f} |")
        if len(opportunities) > 30:
            print(f"\n_...и ещё {len(opportunities) - 30} запросов_")
        print()

    # Waste
    if waste:
        print("## WASTE — Кандидаты в минус-слова\n")
        print("Запросы с расходом, но без конверсий.\n")
        print(f"| Запрос | Показы | Клики | Расход |")
        print(f"|--------|--------|-------|--------|")
        for r in waste[:30]:
            print(f"| {truncate(r.query)} | {r.impressions} | {r.clicks} "
                  f"| {format_cost(r.cost)} |")
        if len(waste) > 30:
            print(f"\n_...и ещё {len(waste) - 30} запросов_")
        print()

    # Informational
    if informational:
        print("## INFORMATIONAL — Информационные запросы\n")
        print("Запросы с информационным интентом (вероятные негативы).\n")
        print(f"| Запрос | Показы | Клики | Расход | Конверсии |")
        print(f"|--------|--------|-------|--------|-----------|")
        for r in informational[:20]:
            print(f"| {truncate(r.query)} | {r.impressions} | {r.clicks} "
                  f"| {format_cost(r.cost)} | {r.conversions:.0f} |")
        if len(informational) > 20:
            print(f"\n_...и ещё {len(informational) - 20} запросов_")
        print()

    # Итог
    print("---\n")
    print("## Итог\n")

    savings = waste_cost + info_cost
    print(f"- **Экономия ~{format_cost(savings)} руб./мес** от добавления негативов "
          f"({len(waste)} waste + {len(informational)} informational)")
    if opportunities:
        print(f"- **+{opp_conversions:.0f} конверсий** от добавления новых ключевых "
              f"({len(opportunities)} запросов)")
    print()
    print("### Рекомендуемые действия\n")
    print("1. Добавить OPPORTUNITIES как ключевые слова в соответствующие группы")
    print("2. Добавить WASTE в минус-слова на уровне кампании")
    print("3. Добавить INFORMATIONAL в минус-слова (информационные паттерны)")
    print("4. Повторить анализ через 2-4 недели")


def main():
    parser = argparse.ArgumentParser(
        description="Анализ упущенного спроса из CSV поисковых запросов Яндекс Директа",
    )
    parser.add_argument(
        "csv_file",
        help="Путь к CSV-файлу с поисковыми запросами (или '-' для stdin)",
    )
    parser.add_argument(
        "--keywords-file",
        help="Файл с текущими ключевыми словами (одно на строку)",
        default=None,
    )
    parser.add_argument(
        "--min-cost",
        type=float,
        default=100,
        help="Минимальный расход для категории WASTE (руб., по умолчанию 100)",
    )
    parser.add_argument(
        "--min-conversions",
        type=float,
        default=1,
        help="Минимум конверсий для категории OPPORTUNITY (по умолчанию 1)",
    )

    args = parser.parse_args()

    records = read_csv_data(args.csv_file)
    if not records:
        print("Ошибка: не удалось прочитать данные из CSV", file=sys.stderr)
        sys.exit(1)

    keywords = load_keywords(args.keywords_file)
    categorize(records, keywords, args.min_cost, args.min_conversions)
    print_report(records)


if __name__ == "__main__":
    main()
