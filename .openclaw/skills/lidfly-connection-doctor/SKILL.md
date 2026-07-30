---
name: lidfly-connection-doctor
description: "Диагностировать подключение LidFly MCP v3 в Claude Code, Claude Desktop, Codex, Cursor, OpenCode и VS Code: неверный config, timeout транспорта, незавершённый MCP OAuth, конфликт статического Authorization с OAuth, отсутствие provider-подключения и устаревшие skills. Использовать при Failed, Authenticate/Login, Authentication failed, SSE 405 и недоступных инструментах."
---

# LidFly Connection Doctor

Определи слой сбоя и дай минимальное действие для восстановления. Не смешивай настройку AI-клиента, MCP OAuth, provider OAuth и skills.

## Определи клиент

Используй доступный контекст, не угадывай:

- Claude Code: команда `claude`, проектный `.mcp.json`, `CLAUDE.md`, `.claude/`.
- Claude Desktop: интерфейс Connectors/Integrations и кнопки `Authenticate`/`Login`.
- Codex CLI/app/extension: `AGENTS.md`, `.codex/config.toml`, `.agents/skills/`.
- Cursor: `.cursor/mcp.json`, `AGENTS.md`, `.agents/skills/`.
- OpenCode: `opencode.json`/`opencode.jsonc`, команда `opencode`, `AGENTS.md`, сгенерированные этим репозиторием `.agents/skills/`; `.opencode/skills/` проверяй только при явно подтверждённой ручной установке.
- VS Code: только оболочка. Сначала определи, работает внутри Claude Code или Codex, и применяй инструкцию этого клиента.

Не предлагай `.cursor/mcp.json` пользователю Claude. Не создавай параллельный config другого клиента.

## Диагностируй по порядку

1. Проверь, настроен ли удалённый Streamable HTTP endpoint `https://lidfly.ru/mcp/v3` в формате текущего клиента.
2. Проверь состояние MCP OAuth.
3. Только после успешного MCP OAuth проверь доступность верхнеуровневых LidFly tools.
4. Только после успешного MCP соединения проверяй provider-подключения через `get_provider_context`.
5. После рабочего MCP проверь наличие и свежесть skills.

Не привязывай исправность к фиксированному числу tools или meta-tools.

## Классифицируй состояние

### Ожидается MCP OAuth

Если UI показывает `Failed` и доступна кнопка `Authenticate` или `Login`, выдай ровно одно действие:

> Нажмите `Authenticate`/`Login`, завершите вход в открывшемся браузере и затем повторите проверку подключения.

На этом остановись. Не называй это timeout, не предлагай менять config и не обсуждай Яндекс, VK, Авито или другие provider tools до завершения MCP OAuth.

### Config отсутствует или неверен

Исправляй только config обнаруженного клиента:

- Claude Code: проектный `.mcp.json` или `claude mcp add` для remote HTTP OAuth.
- Codex: `.codex/config.toml` и `codex mcp login lidfly`.
- Cursor: `.cursor/mcp.json` с HTTP endpoint.
- OpenCode: `opencode.json`/`opencode.jsonc`, `"type": "remote"`, URL `https://lidfly.ru/mcp/v3` и `opencode mcp auth lidfly`.
- Claude Desktop: native Connector/Integration, без `.cursor/mcp.json`.
- VS Code: config Claude Code или Codex, который реально работает внутри VS Code.

Транспорт должен быть HTTP/Streamable HTTP, не SSE.

### Машиночитаемая ошибка аутентификации

Если ответ LidFly содержит `credential_type`, используй его до разбора текста ошибки:

- `legacy_or_unknown_bearer`: сервер не получил OAuth access token и не признал Bearer действующим API-ключом. Если для подключения ожидался OAuth, это слой `config`: безопасно проверь конфигурацию текущего клиента на статический `Authorization`, но не утверждай, что заголовок есть, пока не увидел его или серверная диагностика не доказала повторную отправку прежнего ключа.
- `oauth_access_token`: до сервера дошёл OAuth-токен, но он истёк, отозван или больше не принимается. Это слой `mcp_oauth`: обнови токен или повтори вход. Не удаляй статический заголовок без отдельного доказательства.

Не смешивай эти ветки: одинаковый HTTP `401` не означает одинаковую причину.

### OpenCode: статический Authorization перекрывает OAuth

Если OpenCode после завершённого входа пишет `Authentication failed`, затем `SSE error: Non-200 status code (405)`, не делай вывод, что LidFly требует SSE. OpenCode сначала пробует Streamable HTTP, а SSE запускает как fallback после ошибки первого транспорта; `405` в этой последовательности вторичен.

Классифицируй сбой как `config`, когда подтверждено хотя бы одно из следующего:

- в блоке LidFly в `opencode.json`/`opencode.jsonc` есть `headers.Authorization` или другой статический Bearer API key;
- в блоке LidFly стоит `"oauth": false`: этот флаг отключает OAuth, поэтому `logout`/`auth` не восстановят OAuth-доступ, пока флаг не удалён или не изменён;
- серверная диагностика показывает один и тот же невалидный API key до и после успешной выдачи OAuth-токенов.

Одно действие восстановления для подтверждённого OAuth-режима: удали только статический `headers.Authorization` и, если задан, `"oauth": false` из блока LidFly, не показывая значение заголовка, затем выполни `opencode mcp logout lidfly` и `opencode mcp auth lidfly`. Статический заголовок перекрывает OAuth-токен, поэтому новый API-ключ не создавай и LidFly на SSE не переключай. Если пользователь попросил исправить доступный локальный config, можешь удалить эти поля сам, сохранив остальные настройки.

После входа сначала выполни `opencode mcp debug lidfly`: команда проверяет HTTP-соединение и OAuth discovery flow. Затем проверь `opencode mcp list` и доступность верхнеуровневых LidFly tools. Только после этого переходи к provider connections и skills.

### Connection timeout

Ставь этот диагноз только после того, как config корректен и MCP OAuth не ожидает действия пользователя. Проверь доступность endpoint и повтори один безопасный connect/read. Не советуй повторять provider write.

В OpenCode сначала выполни `opencode mcp debug lidfly`. Если HTTP/OAuth исправны, а получение списка tools завершается по timeout, проверь `timeout` в блоке LidFly: для remote MCP OpenCode по умолчанию ждёт 5000 мс. Увеличь только этот timeout до обоснованного значения, например `30000`, затем один раз повтори read-only проверку. Не маскируй увеличением timeout ошибки аутентификации или неверный endpoint.

Если timeout повторяется, кратко зафиксируй клиент, endpoint и безопасный текст ошибки. Предложи `$lidfly-support-escalation`; не передавай токены, raw config с секретами или provider payload.

### MCP работает, provider не подключён

Вызови напрямую `get_provider_context({ provider: ... })`. Если нужного подключения нет, объясни, какое подключение нужно добавить в LidFly. Не меняй MCP config: транспорт и MCP OAuth уже исправны.

### Skills отсутствуют или устарели

Сначала докажи, что MCP tools доступны. Затем сравни project skills с текущим клиентским набором:

- Claude Code: `.claude/skills`;
- Codex: `.agents/skills` (legacy `.codex/skills` не считать основным);
- Cursor: `.agents/skills`.
- OpenCode: используй сгенерированные репозиторием `.agents/skills`; `.opencode/skills` проверяй только при явно подтверждённой ручной установке — sync этого репозитория туда не пишет.

Предлагай обновить только skills текущего клиента. Отсутствие skills не выдавай за ошибку OAuth или транспорта.

## Формат ответа

Сообщи:

1. обнаруженный клиент;
2. слой сбоя: `config`, `mcp_oauth`, `transport`, `provider_connection` или `skills`;
3. одно следующее действие;
4. что проверять после него.

Для `Failed + Authenticate/Login` оставь только одно действие из раздела MCP OAuth.
