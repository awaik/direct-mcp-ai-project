# Подключение LidFly к OpenAI Codex

Основной desktop-путь — MCP-only плагин LidFly через персональный marketplace Codex. Плагин подключает `https://lidfly.ru/mcp/v3`; OAuth-токены остаются под управлением Codex, API-ключ вручную копировать не нужно.

## Приложение Codex без терминала

1. Откройте на компьютере инструкцию LidFly и скачайте подписанный установщик для macOS или Windows:
   - `https://lidfly.ru/downloads/codex-plugin/macos-universal.dmg`
   - `https://lidfly.ru/downloads/codex-plugin/windows-x64-setup.exe`
2. Нажмите «Установить». Установщик добавит только локальный marketplace LidFly и откроет карточку плагина в Codex.
3. В Codex нажмите **Install** и пройдите OAuth LidFly по email.
4. Полностью перезапустите Codex и откройте новый чат.

Установщик не изменяет внутренний cache, installed-state или OAuth-хранилище Codex. Если политика организации запрещает персональные marketplaces, обратитесь к администратору Workspace: установщик не обходит managed requirements.

В плагин v1 не входят skills, prompts или локальные API-ключи. Их source of truth остаётся в этом AI-проекте.

Для проектной установки актуальный Codex обнаруживает skills в `.agents/skills/<name>/SKILL.md`. Каталог `.codex/skills` в шаблоне сохранён только для совместимости со старыми клиентами. UI-метаданные каждого skill лежат в `<skill>/agents/openai.yaml`.

## Codex CLI и Linux

```bash
codex plugin marketplace add awaik/lidfly-plugins
codex plugin add lidfly@lidfly
```

После установки пройдите OAuth в Codex, полностью перезапустите клиент и откройте новый чат. Проверка:

```bash
codex plugin list --json
```

## Ручной MCP fallback

Если плагин недоступен, Codex CLI, приложение Codex и расширение Codex в VS Code можно подключить напрямую через `.codex/config.toml`.

Создайте или проверьте файл `.codex/config.toml` в корне проекта:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
startup_timeout_sec = 45
tool_timeout_sec = 120
```

Не используйте проектный Codex JSON-конфиг и не смешивайте `command`/`args` с `url` в одном сервере. Установщик не удаляет и не изменяет прежние custom MCP записи: после проверки плагина отключите дублирующий сервер вручную.

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

## Legacy Bearer fallback

Если клиент не поддерживает remote MCP OAuth, используйте ручной Bearer header только локально и не коммитьте его:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
headers = { Authorization = "Bearer YOUR_API_KEY" }
```

Основной source of truth для публичных snippets - `public/js/guides.js` в основном репозитории LidFly.
