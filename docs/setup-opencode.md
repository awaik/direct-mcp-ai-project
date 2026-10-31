# Подключение LidFly MCP к OpenCode (Яндекс Директ, Метрика, Вордстат, Вебмастер, VK Реклама, ВКонтакте, Telegram, MAX, Авито)

Эта инструкция покажет, как подключить **OpenCode** к платформе **[LidFly](https://lidfly.ru/)** через единый MCP-сервер `https://lidfly.ru/mcp/v3`.

После подключения OpenCode сможет анализировать и вести рекламу в **Яндекс Директе**, **VK Рекламе (VK Ads)** и **Авито Рекламе**, проверять цели и конверсии в **Яндекс Метрике** и **AppMetrica**, собирать ключевые фразы в **Вордстате**, проводить SEO-аудит в **Яндекс Вебмастере**, выпускать и планировать посты в **Telegram**, **ВКонтакте** и мессенджере **MAX**, управлять объявлениями и чатами **Авито**, создавать сайты на LidFly и писать статьи из больших видео.

---

## OAuth — рекомендуемый способ

Откройте папку этого проекта в OpenCode. В корне уже настроен файл `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lidfly": {
      "type": "remote",
      "url": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

Если вы настраиваете другой проект, добавьте блок `mcp.lidfly` в его `opencode.json` или `opencode.jsonc`, сохранив остальные настройки.

В терминале из папки проекта выполните:

```bash
opencode mcp auth lidfly
opencode mcp list
```

Первая команда открывает браузерный вход LidFly по email. Вторая показывает состояние подключения. OpenCode автоматически поддерживает OAuth для remote MCP; отдельное поле `oauth` для этого не требуется, копировать API-ключ вручную не нужно.

---

## Проверка и первые запросы в OpenCode

Запустите `opencode` в папке проекта и напишите:

```text
Покажи мои доступные Пространства, рекламные кабинеты и подключённые площадки (Директ, Метрика, VK, Telegram, MAX, Авито).
```

```text
Проверь активные кампании в Яндекс Директе за последние 30 дней, сравни расход с конверсиями в Метрике и ничего не меняй без отдельного плана.
```

OpenCode читает `AGENTS.md` и навыки из `.agents/skills`. Для определения нужного кабинета или проекта ожидается вызов `get_provider_context`, затем поиск инструментов через `search_tools` и `get_tool_schema`. Read-вызовы идут через `call_tool`, любые изменения — через `call_write_tool` после вашего согласия.

---

## Подключение через API-ключ

Если вы предпочитаете статический ключ вместо OAuth, сначала [задайте переменную окружения `LIDFLY_TOKEN`](setup-api-key.md). В своём `opencode.json` или `opencode.jsonc` настройте блок `mcp.lidfly`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lidfly": {
      "type": "remote",
      "url": "https://lidfly.ru/mcp/v3",
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:LIDFLY_TOKEN}"
      }
    }
  }
}
```

Сохраните остальные настройки файла. Поле `oauth: false` явно выбирает режим API-ключа; команда `opencode mcp auth lidfly` в этом режиме не требуется. Запустите `opencode` из терминала с заданной переменной, проверьте `opencode mcp list` и выполните запрос из раздела «Проверка».

Для возврата к OAuth удалите `headers.Authorization` и `oauth: false` из подключения `lidfly`, перезапустите OpenCode и выполните `opencode mcp auth lidfly`.

---

## Если подключение не работает

```bash
opencode mcp debug lidfly
```

Если в OAuth-режиме после входа появляются `Authentication failed` и `SSE error: 405`, проверьте блок `mcp.lidfly`. Старое поле `headers.Authorization` перекрывает OAuth-токен, а `oauth: false` отключает OAuth. Удалите только эти настройки, если хотите войти через OAuth, затем выполните:

```bash
opencode mcp logout lidfly
opencode mcp auth lidfly
```

Ошибка SSE является вторичной: LidFly использует Streamable HTTP, менять транспорт на SSE не нужно.

Source of truth для публичного OAuth-примера — `public/js/guides.js` основного репозитория LidFly. Справка клиента: [OpenCode MCP](https://opencode.ai/docs/mcp-servers/).
