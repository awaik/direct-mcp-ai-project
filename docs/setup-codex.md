# Подключение LidFly MCP к OpenAI Codex (Яндекс Директ, Метрика, Вордстат, Вебмастер, VK Реклама, ВКонтакте, Telegram, MAX, Авито)

Эта инструкция покажет, как подключить **OpenAI Codex** (десктопное приложение Codex, расширение Codex в VS Code и Codex CLI) к платформе **[LidFly](https://lidfly.ru/)** через единый MCP-сервер `https://lidfly.ru/mcp/v3`.

После подключения Codex получает доступ к вашим кампаниям в **Яндекс Директе**, **VK Рекламе (VK Ads)** и **Авито Рекламе**, отчётам **Яндекс Метрики** и **AppMetrica**, спросу в **Вордстате**, SEO-данным **Яндекс Вебмастера**, постингу и статистике в **Telegram**, **ВКонтакте** и мессенджере **MAX**, объявлениям и чатам **Авито**, сайтам LidFly и **Пространствам**. OAuth-токены остаются под управлением Codex — копировать API-ключи вручную не нужно.

> Интерактивная инструкция с видеороликами и кнопками загрузки также доступна на странице **[lidfly.ru/codex](https://lidfly.ru/codex/)**.

---

## Способ 1. Приложение Codex без терминала (macOS и Windows)

1. Откройте на компьютере страницу **[lidfly.ru/codex](https://lidfly.ru/codex/)** или скачайте установщик напрямую:
   - macOS (Apple Silicon и Intel): `https://lidfly.ru/downloads/codex-plugin/macos-universal.dmg`
   - Windows (64-bit): `https://lidfly.ru/downloads/codex-plugin/windows-x64-setup.exe`
   *(В версии 1.0.0 нет системной подписи Windows: если SmartScreen покажет «Неизвестный издатель», продолжайте, только если файл скачан с `lidfly.ru`.)*
2. Запустите приложение LidFly и нажмите **«Подготовить плагин»** — установщик подготовит локальный marketplace LidFly.
3. Нажмите **«Открыть в Codex»**, в открывшейся карточке плагина LidFly нажмите **`Install`** и пройдите вход в LidFly по email (OAuth).
4. Полностью перезапустите Codex и откройте новый чат.

Установщик не изменяет внутренний кеш или хранилище OAuth-токенов Codex. Если корпоративная политика организации запрещает персональные marketplaces, обратитесь к администратору или используйте проектное подключение ниже.

---

## Способ 2. Работа через этот проект в VS Code или Codex CLI (максимум возможностей)

При открытии этой папки проекта Codex автоматически подхватывает правила `AGENTS.md`, настройку `.codex/config.toml` и все 27 навыков в `.agents/skills/<name>/SKILL.md` (каталог `.codex/skills` сохранён для обратной совместимости; UI-метаданные лежат в `<skill>/agents/openai.yaml`).

1. Скачайте этот репозиторий (или компактный архив только для Codex — [`lidfly-codex.zip`](https://github.com/awaik/direct-mcp-ai-project/releases/latest/download/lidfly-codex.zip)) и распакуйте в удобную папку.
2. Откройте папку в **VS Code** (`File → Open Folder`). Если появится окно **Restricted Mode**, выберите **«Доверять авторам»** — без доверия Codex не загрузит проектный `.codex/config.toml`.
3. В терминале или в панели Codex выполните вход по OAuth:

```bash
codex mcp login lidfly
```

*(Или нажмите **`Login` / `Authenticate`** рядом с сервером `lidfly` в интерфейсе Codex. Если Codex попросит указать `resource`, введите `https://lidfly.ru`.)*

4. В открывшемся браузере введите email вашего аккаунта LidFly и код из письма. Токен Яндекс Директа или других площадок в Codex добавлять не нужно — все подключения хранятся в LidFly.

---

## Способ 3. Установка плагина через Codex CLI (macOS, Linux, Windows)

```bash
codex plugin marketplace add awaik/lidfly-plugins
codex plugin add lidfly@lidfly
```

После установки пройдите OAuth-вход в Codex, полностью перезапустите клиент и откройте новый чат. Проверить список установленных плагинов можно командой:

```bash
codex plugin list --json
```

---

## Ручной MCP-конфиг (`.codex/config.toml`)

Если вы настраиваете собственный проект вручную, проверьте или создайте файл `.codex/config.toml` в корне проекта:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
startup_timeout_sec = 45
tool_timeout_sec = 120
```

Не используйте JSON-конфиг для Codex и не смешивайте поля `command`/`args` с `url` в одном сервере. Если вы уже установили плагин LidFly, отключите дублирующую ручную запись сервера, чтобы подключение не отображалось дважды.

---

## Проверка и первые запросы в Codex

Проверьте статус сервера в терминале:

```bash
codex mcp list
```

Для сервера `lidfly` должен отображаться адрес `https://lidfly.ru/mcp/v3`. Затем напишите в чат Codex:

```text
Покажи мои доступные Пространства, рекламные кабинеты и подключённые площадки.
```

```text
Покажи мои кампании в Яндекс Директе и проанализируй статистику за последние 30 дней. Пока ничего не меняй.
```

```text
Проверь наше сообщество ВКонтакте и каналы в Telegram и MAX: какие посты вышли на этой неделе и какой у них охват.
```

Ожидаемое поведение: Codex видит v3 meta-layer, начинает с `get_provider_context` для определения нужного кабинета или проекта и выполняет любые изменения только через `call_write_tool` после вашего подтверждения.

---

## Подключение через API-ключ

Если вы предпочитаете статический ключ вместо OAuth, сначала [задайте переменную окружения `LIDFLY_TOKEN`](setup-api-key.md). В своём `.codex/config.toml` добавьте строку `bearer_token_env_var`:

```toml
[mcp_servers.lidfly]
url = "https://lidfly.ru/mcp/v3"
bearer_token_env_var = "LIDFLY_TOKEN"
startup_timeout_sec = 45
tool_timeout_sec = 120
```

Сохраните остальные настройки конфига. Поле `bearer_token_env_var` содержит только **имя переменной**, а не сам секретный ключ. Если LidFly уже подключён через OAuth-плагин, временно отключите плагин, чтобы не было двух активных подключений одновременно.

Запустите `codex` из терминала, в котором экспортирована переменная `LIDFLY_TOKEN` (`codex mcp login lidfly` в этом режиме не нужен).

Для возврата к OAuth удалите `bearer_token_env_var` из блока `mcp_servers.lidfly`, перезапустите Codex и выполните `codex mcp login lidfly`. Формат поля описан в [официальной документации Codex MCP](https://developers.openai.com/codex/mcp#streamable-http-servers).

Основной source of truth для публичных snippets — `public/js/guides.js` в основном репозитории LidFly.
