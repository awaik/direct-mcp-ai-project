#!/usr/bin/env bash
# iam_token.sh — получение IAM-токена Yandex Cloud
# Использование:
#   iam_token.sh    # выводит IAM-токен (кешируется на 11 часов)
#
# Нужен для Yandex Cloud Search API (платный, больше квоты).
# Для бесплатного Yandex XML API этот скрипт не требуется.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../_shared/common.sh"

load_config

# ─── Проверка конфига ────────────────────────────────

if [[ -z "${YANDEX_CLOUD_OAUTH_TOKEN:-}" ]]; then
  echo "ERROR: YANDEX_CLOUD_OAUTH_TOKEN не задан в tokens.env" >&2
  echo "  → Получите OAuth-токен в Yandex Cloud Console" >&2
  echo "  → Добавьте в tokens.env: YANDEX_CLOUD_OAUTH_TOKEN=ваш_токен" >&2
  exit 1
fi

# ─── Кеш (IAM-токен живёт 12 часов, кешируем на 11) ─

CACHE_ID="yc_iam_token"
IAM_CACHE_TTL=39600  # 11 часов в секундах

# Попробовать достать из кеша
IAM_CACHE_KEY=$(cache_key "$CACHE_ID")
IAM_CACHE_FILE="${CACHE_DIR}/${IAM_CACHE_KEY}"

if [[ -f "$IAM_CACHE_FILE" ]]; then
  if [[ "$(uname)" == "Darwin" ]]; then
    FILE_AGE=$(( $(date +%s) - $(stat -f %m "$IAM_CACHE_FILE") ))
  else
    FILE_AGE=$(( $(date +%s) - $(stat -c %Y "$IAM_CACHE_FILE") ))
  fi

  if [[ $FILE_AGE -lt $IAM_CACHE_TTL ]]; then
    cat "$IAM_CACHE_FILE"
    exit 0
  fi
fi

# ─── Запрос нового токена ────────────────────────────

IAM_URL="https://iam.api.cloud.yandex.net/iam/v1/tokens"
JSON_BODY="{\"yandexPassportOauthToken\": \"${YANDEX_CLOUD_OAUTH_TOKEN}\"}"

RESPONSE=$(http_post "$IAM_URL" "$JSON_BODY") || {
  echo "ERROR: Не удалось получить IAM-токен" >&2
  echo "  → Проверьте YANDEX_CLOUD_OAUTH_TOKEN в tokens.env" >&2
  echo "  → Токен мог истечь — получите новый: https://oauth.yandex.ru/authorize?response_type=token&client_id=1a6990aa636648e9b2ef855fa7bec2fb" >&2
  exit 1
}

# Извлечь iamToken из ответа
IAM_TOKEN=$(echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
token = data.get('iamToken', '')
if not token:
    print('ERROR: В ответе нет iamToken', file=sys.stderr)
    sys.exit(1)
print(token)
") || exit 1

# ─── Сохранить в кеш ────────────────────────────────

cache_set "$CACHE_ID" "$IAM_TOKEN"

echo "$IAM_TOKEN"
