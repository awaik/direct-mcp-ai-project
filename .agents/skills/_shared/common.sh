#!/usr/bin/env bash
# _shared/common.sh — общая инфраструктура для скиллов
# Загрузка конфига, HTTP с retry/429, кеш с SHA256 + TTL, actionable ошибки

set -euo pipefail

# ─── Пути ──────────────────────────────────────────────

SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$SKILLS_DIR/../../.." && pwd)"
CACHE_DIR="${PROJECT_ROOT}/.cache/skills"
CACHE_TTL=21600  # 6 часов в секундах

# ─── Конфиг ────────────────────────────────────────────

load_config() {
  local config_file="${PROJECT_ROOT}/tokens.env"
  if [[ ! -f "$config_file" ]]; then
    echo "ERROR: Файл tokens.env не найден в корне проекта" >&2
    echo "  → Скопируйте tokens.env.example в tokens.env и заполните токены:" >&2
    echo "  → cp tokens.env.example tokens.env" >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$config_file"
  set +a
}

# Извлечение значений из PROJECTS.md (counter_id, goal_id, CPA-пороги)
get_project_value() {
  local key="$1"
  local projects_file="${PROJECT_ROOT}/PROJECTS.md"
  if [[ ! -f "$projects_file" ]]; then
    echo "" # пустая строка если файла нет
    return 0
  fi
  python3 "${SKILLS_DIR}/_shared/json_helpers.py" extract_project_value "$key" < "$projects_file" 2>/dev/null || echo ""
}

# ─── HTTP ──────────────────────────────────────────────

# HTTP GET с retry и обработкой 429
# Использование: http_get URL [HEADER...]
http_get() {
  local url="$1"; shift
  local headers=("$@")
  local max_retries=3
  local retry_delay=5

  local curl_args=(-s -S --max-time 30)
  for h in "${headers[@]}"; do
    curl_args+=(-H "$h")
  done

  for attempt in $(seq 1 "$max_retries"); do
    local http_code body tmpfile
    tmpfile=$(mktemp)

    http_code=$(curl "${curl_args[@]}" -o "$tmpfile" -w "%{http_code}" "$url" 2>/dev/null) || {
      rm -f "$tmpfile"
      echo "ERROR: Не удалось выполнить запрос к $url" >&2
      echo "  → Проверьте интернет-соединение" >&2
      return 1
    }

    body=$(cat "$tmpfile")
    rm -f "$tmpfile"

    case "$http_code" in
      200|201)
        echo "$body"
        return 0
        ;;
      401|403)
        echo "ERROR: Ошибка авторизации (HTTP $http_code)" >&2
        echo "  → Токен просрочен или невалиден" >&2
        echo "  → Получите новый токен (см. config/README.md в папке скилла)" >&2
        return 1
        ;;
      429)
        if [[ $attempt -lt $max_retries ]]; then
          echo "WARN: Превышена квота API (429), повтор через ${retry_delay}с (попытка $attempt/$max_retries)..." >&2
          sleep "$retry_delay"
          retry_delay=$((retry_delay * 2))
        else
          echo "ERROR: Квота API исчерпана после $max_retries попыток" >&2
          echo "  → Подождите несколько минут и повторите запрос" >&2
          return 1
        fi
        ;;
      *)
        echo "ERROR: HTTP $http_code" >&2
        [[ -n "$body" ]] && echo "$body" >&2
        return 1
        ;;
    esac
  done
}

# HTTP POST с JSON-телом
# Использование: http_post URL JSON_BODY [HEADER...]
http_post() {
  local url="$1"; shift
  local json_body="$1"; shift
  local headers=("$@")
  local max_retries=3
  local retry_delay=5

  local curl_args=(-s -S --max-time 30 -X POST -H "Content-Type: application/json" -d "$json_body")
  for h in "${headers[@]}"; do
    curl_args+=(-H "$h")
  done

  for attempt in $(seq 1 "$max_retries"); do
    local http_code body tmpfile
    tmpfile=$(mktemp)

    http_code=$(curl "${curl_args[@]}" -o "$tmpfile" -w "%{http_code}" "$url" 2>/dev/null) || {
      rm -f "$tmpfile"
      echo "ERROR: Не удалось выполнить запрос" >&2
      return 1
    }

    body=$(cat "$tmpfile")
    rm -f "$tmpfile"

    case "$http_code" in
      200|201)
        echo "$body"
        return 0
        ;;
      401|403)
        echo "ERROR: Ошибка авторизации (HTTP $http_code)" >&2
        echo "  → Токен просрочен или невалиден" >&2
        return 1
        ;;
      429)
        if [[ $attempt -lt $max_retries ]]; then
          echo "WARN: Превышена квота (429), повтор через ${retry_delay}с..." >&2
          sleep "$retry_delay"
          retry_delay=$((retry_delay * 2))
        else
          echo "ERROR: Квота API исчерпана" >&2
          return 1
        fi
        ;;
      *)
        echo "ERROR: HTTP $http_code" >&2
        [[ -n "$body" ]] && echo "$body" >&2
        return 1
        ;;
    esac
  done
}

# ─── Кеш ──────────────────────────────────────────────

# SHA256-хеш для ключа кеша
cache_key() {
  echo -n "$*" | shasum -a 256 | cut -d' ' -f1
}

# Проверка: включает ли период сегодняшний день
period_includes_today() {
  local date2="${1:-}"
  [[ -z "$date2" ]] && return 0
  local today
  today=$(date +%Y-%m-%d)
  [[ ! "$date2" < "$today" ]]
}

# Получить из кеша (вернёт 1 если нет/просрочен)
cache_get() {
  local key
  key=$(cache_key "$@")
  local cache_file="${CACHE_DIR}/${key}"

  [[ -f "$cache_file" ]] || return 1

  local file_age
  if [[ "$(uname)" == "Darwin" ]]; then
    file_age=$(( $(date +%s) - $(stat -f %m "$cache_file") ))
  else
    file_age=$(( $(date +%s) - $(stat -c %Y "$cache_file") ))
  fi

  if [[ $file_age -gt $CACHE_TTL ]]; then
    rm -f "$cache_file"
    return 1
  fi

  cat "$cache_file"
}

# Записать в кеш
cache_set() {
  local cache_id="$1"; shift
  local key
  key=$(cache_key "$cache_id")
  mkdir -p "$CACHE_DIR"
  echo "$*" > "${CACHE_DIR}/${key}"
}

# Кешированный HTTP GET (пропускает кеш если период включает сегодня)
# Использование: cached_get CACHE_ID END_DATE URL [HEADER...]
cached_get() {
  local cache_id="$1"; shift
  local date2="${1:-}"; shift
  local url="$1"; shift
  local headers=("$@")

  # Пропускаем кеш если период включает сегодня
  if ! period_includes_today "$date2"; then
    local cached
    if cached=$(cache_get "$cache_id"); then
      echo "$cached"
      return 0
    fi
  fi

  local result
  result=$(http_get "$url" "${headers[@]}") || return 1
  cache_set "$cache_id" "$result"
  echo "$result"
}

# ─── Вспомогательные ──────────────────────────────────

# Форматирование через json_helpers.py
json_format() {
  python3 "${SKILLS_DIR}/_shared/json_helpers.py" "$@"
}

# Парсинг даты: "7d" → дата 7 дней назад, "2025-01-01" → как есть
parse_date() {
  local input="$1"
  if [[ "$input" =~ ^[0-9]+d$ ]]; then
    local days="${input%d}"
    if [[ "$(uname)" == "Darwin" ]]; then
      date -v-"${days}d" +%Y-%m-%d
    else
      date -d "-${days} days" +%Y-%m-%d
    fi
  else
    echo "$input"
  fi
}

today() { date +%Y-%m-%d; }

yesterday() {
  if [[ "$(uname)" == "Darwin" ]]; then
    date -v-1d +%Y-%m-%d
  else
    date -d "-1 day" +%Y-%m-%d
  fi
}

# Проверка обязательного параметра
require_param() {
  local name="$1" value="$2"
  if [[ -z "$value" ]]; then
    echo "ERROR: Обязательный параметр --$name не указан" >&2
    return 1
  fi
}

# Yandex Metrika auth header
metrika_auth() {
  echo "Authorization: OAuth ${YANDEX_METRIKA_TOKEN}"
}

# Базовый URL Metrika API
METRIKA_API="https://api-metrika.yandex.net"
