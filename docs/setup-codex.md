# Подключение LidFly MCP к OpenAI Codex

Codex CLI, приложение Codex и расширение Codex в VS Code используют `.codex/config.toml`.

## Настройка

Создайте или проверьте файл `.codex/config.toml` в корне проекта:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
startup_timeout_sec = 45
tool_timeout_sec = 120
```

Не используйте проектный Codex JSON-конфиг и не смешивайте `command`/`args` с `url` в одном сервере. Старый путь через `npx mcp-remote` нужен только как fallback для старых версий клиента без remote HTTP MCP.

## Авторизация

После сохранения выполните:

```bash
codex mcp login lidfly
```

Или нажмите `Login` / `Authenticate` рядом с сервером `lidfly` в UI Codex. Откроется браузерный вход LidFly по email. API-ключ вручную копировать не нужно.

Если Codex просит `resource`, укажите:

```text
https://lidfly.ru
```

## Проверка

```bash
codex mcp list
```

Для сервера `lidfly` должен быть URL `https://lidfly.ru/mcp/v3`.

В чате:

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Ожидаемо: Codex видит v3 meta-layer, начинает с `get_provider_context` для provider scope и не вызывает provider tools напрямую.

## Legacy Fallback

Если клиент не поддерживает remote MCP OAuth, используйте ручной Bearer header только локально и не коммитьте его:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
headers = { Authorization = "Bearer YOUR_API_KEY" }
```

Основной source of truth для публичных snippets - `public/js/guides.js` в основном репозитории LidFly.
