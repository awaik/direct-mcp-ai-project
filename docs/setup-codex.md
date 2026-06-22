# Подключение direct-mcp к OpenAI Codex

## 1. Настройка MCP-сервера

В корне проекта уже есть файл `.codex/config.toml` с MCP-конфигурацией:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
bearer_token_env_var = "LIDFLY_TOKEN"
startup_timeout_sec = 45
tool_timeout_sec = 120
```

API-ключ из [личного кабинета direct-mcp](https://lidfly.ru) положите в `tokens.env`:

```bash
cp tokens.env.example tokens.env
# заполните LIDFLY_TOKEN в tokens.env
```

## 2. Альтернатива — глобальный конфиг через CLI

Если проектный `.codex/config.toml` не подхватывается, добавьте сервер глобально:

```bash
codex mcp add lidfly \
  --url https://lidfly.ru/mcp/v3 \
  --bearer-token-env-var LIDFLY_TOKEN
```

Проверка:

```bash
codex mcp list --json
codex mcp get lidfly --json
```

## 3. Запуск

```bash
set -a
source tokens.env
set +a
codex -C /path/to/your/project
```

Или откройте папку проекта в Codex App.

## 4. Проверка подключения

В сессии напишите:

```
проверь MCP и покажи список tools
```

Ожидаемо:
- Сервер `lidfly` виден
- Доступны 6 meta-инструментов v3: `search_tools`, `get_tool_schema`, `call_tool`, `call_write_tool`, `get_methodology`, `subscription_status`
- Провайдерский каталог (`get_campaigns`, `vk_get_campaigns`, `wordstat_top_requests`, `workspace_get_context` и др.) в списке не виден — AI находит инструменты через `search_tools` и вызывает через `call_tool` / `call_write_tool`

## 5. Инструкции для агента

Codex читает `AGENTS.md` из корня проекта, который ссылается на `CLAUDE.md` с правилами работы с API.

Ваши бизнес-настройки — в `PROJECTS.md`.

## 6. Навыки (Skills)

В папке `.codex/skills/` лежат готовые навыки:

| Навык | Описание |
|-------|---------|
| `seo-optimizer` | SEO-аудит и оптимизация страниц |

Навыки активируются автоматически по контексту запроса.
