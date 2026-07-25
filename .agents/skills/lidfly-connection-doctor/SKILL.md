---
name: lidfly-connection-doctor
description: "Диагностировать подключение LidFly MCP v3 в Claude Code, Claude Desktop, Codex, Cursor и VS Code: неверный config, timeout транспорта, незавершённый MCP OAuth, отсутствие provider-подключения и отсутствующие или устаревшие skills. Использовать при Failed, Authenticate/Login, недоступных инструментах, ошибках подключения или непонятной настройке клиента."
---

# LidFly Connection Doctor

Определи слой сбоя и дай минимальное действие для восстановления. Не смешивай настройку AI-клиента, MCP OAuth, provider OAuth и skills.

## Определи клиент

Используй доступный контекст, не угадывай:

- Claude Code: команда `claude`, проектный `.mcp.json`, `CLAUDE.md`, `.claude/`.
- Claude Desktop: интерфейс Connectors/Integrations и кнопки `Authenticate`/`Login`.
- Codex CLI/app/extension: `AGENTS.md`, `.codex/config.toml`, `.agents/skills/`.
- Cursor: `.cursor/mcp.json`, `AGENTS.md`, `.agents/skills/`.
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
- Claude Desktop: native Connector/Integration, без `.cursor/mcp.json`.
- VS Code: config Claude Code или Codex, который реально работает внутри VS Code.

Транспорт должен быть HTTP/Streamable HTTP, не SSE.

### Connection timeout

Ставь этот диагноз только после того, как config корректен и MCP OAuth не ожидает действия пользователя. Проверь доступность endpoint и повтори один безопасный connect/read. Не советуй повторять provider write.

Если timeout повторяется, кратко зафиксируй клиент, endpoint и безопасный текст ошибки. Предложи `$lidfly-support-escalation`; не передавай токены, raw config с секретами или provider payload.

### MCP работает, provider не подключён

Вызови напрямую `get_provider_context({ provider: ... })`. Если нужного подключения нет, объясни, какое подключение нужно добавить в LidFly. Не меняй MCP config: транспорт и MCP OAuth уже исправны.

### Skills отсутствуют или устарели

Сначала докажи, что MCP tools доступны. Затем сравни project skills с текущим клиентским набором:

- Claude Code: `.claude/skills`;
- Codex: `.agents/skills` (legacy `.codex/skills` не считать основным);
- Cursor: `.agents/skills`.

Предлагай обновить только skills текущего клиента. Отсутствие skills не выдавай за ошибку OAuth или транспорта.

## Формат ответа

Сообщи:

1. обнаруженный клиент;
2. слой сбоя: `config`, `mcp_oauth`, `transport`, `provider_connection` или `skills`;
3. одно следующее действие;
4. что проверять после него.

Для `Failed + Authenticate/Login` оставь только одно действие из раздела MCP OAuth.
