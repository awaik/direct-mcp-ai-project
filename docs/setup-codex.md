# Подключение direct-mcp к OpenAI Codex

## 1. Настройка MCP-сервера (проектный конфиг)

Создайте или проверьте файл `.codex/mcp.json` в корне проекта:

```json
{
  "mcpServers": {
    "yandex-direct": {
      "url": "https://direct-mcp.aatex.ru/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Замените `YOUR_API_KEY` на ваш API-ключ из [личного кабинета direct-mcp](https://direct-mcp.aatex.ru).

## 2. Альтернатива — глобальный конфиг через CLI

Если проектный `.codex/mcp.json` не подхватывается (известная проблема в ранних версиях `codex-cli`), добавьте сервер глобально:

```bash
codex mcp add yandex-direct -- \
  npx -y mcp-remote https://direct-mcp.aatex.ru/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

Проверка:

```bash
codex mcp list --json
codex mcp get yandex-direct --json
```

## 3. Запуск

```bash
codex -C /path/to/your/project
```

Или откройте папку проекта в Codex App.

## 4. Проверка подключения

В сессии напишите:

```
проверь MCP и покажи список tools
```

Ожидаемо:
- Сервер `yandex-direct` виден
- Доступны tools: `get_campaigns`, `get_adgroups`, `get_ads`, `get_keywords`, `update_campaign` и др.

## 5. Инструкции для агента

Codex читает `AGENTS.md` из корня проекта, который ссылается на `CLAUDE.md` с правилами работы с API.

Ваши бизнес-настройки — в `PROJECTS.md`.

## 6. Навыки (Skills)

В папке `.codex/skills/` лежат готовые навыки:

| Навык | Описание |
|-------|---------|
| `seo-optimizer` | SEO-аудит и оптимизация страниц |

Навыки активируются автоматически по контексту запроса.
