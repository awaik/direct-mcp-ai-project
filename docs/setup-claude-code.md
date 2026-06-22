# Подключение direct-mcp к Claude Code (CLI)

## 1. Настройка MCP-сервера

В корне проекта уже есть файл `.mcp.json` с конфигурацией:

```json
{
  "mcpServers": {
    "lidfly": {
      "type": "http",
      "url": "https://lidfly.ru/mcp/v3",
      "headers": {
        "Authorization": "Bearer ${LIDFLY_TOKEN}"
      }
    }
  }
}
```

API-ключ из [личного кабинета direct-mcp](https://lidfly.ru) положите в `tokens.env`:

```bash
cp tokens.env.example tokens.env
# заполните LIDFLY_TOKEN в tokens.env
```

## 2. Запуск

Откройте терминал в папке проекта и запустите:

```bash
set -a
source tokens.env
set +a
claude
```

Claude Code автоматически подхватит `.mcp.json` из корня проекта.

## 3. Проверка подключения

В сессии Claude Code напишите:

```
покажи мои кампании
```

Если всё настроено правильно, Claude найдёт инструмент через v3 (`search_tools` → `call_tool`) и покажет список ваших кампаний.

## 4. Дополнительные настройки

### Автоматическое разрешение MCP-инструментов

Файл `.claude/settings.local.json` содержит список разрешённых MCP-инструментов. Благодаря ему Claude не будет спрашивать подтверждение на каждый вызов API.

### Команды (slash commands)

В папке `.claude/commands/` лежат готовые команды:

| Команда | Что делает |
|---------|-----------|
| `/create-campaign` | Создать кампанию из YAML-файла |
| `/create-campaign-text` | Создать кампанию из текстового описания |
| `/improve-campaign-id` | Анализ и план улучшения кампании по ID |
| `/update-claude-md` | Обновить CLAUDE.md после изменений |

Пример использования:

```
/create-campaign-text Рекламируем доставку пиццы в Москве, бюджет 500 руб/нед, лендинг https://pizza.example.com
```

### SEO-скилл

Встроенный навык SEO-оптимизации. Активируется фразами вроде "оптимизируй SEO", "сделай SEO-аудит".

## 5. Файлы проекта

| Файл | Назначение |
|------|-----------|
| `CLAUDE.md` | Главные инструкции для агента (правила работы с API) |
| `PROJECTS.md` | Настройки вашего бизнеса (KPI, бюджеты, особенности) |
| `.mcp.json` | Подключение к MCP-серверу |
| `.claude/settings.local.json` | Разрешения на вызов инструментов |
| `.claude/commands/` | Готовые slash-команды |
| `.claude/skills/seo/` | SEO-навык |
