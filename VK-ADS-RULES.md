# Правила создания кампаний VK Ads

## Unified MCP v3

VK Ads вызывается через `https://lidfly.ru/mcp/v3`: сначала `search_tools`, затем `get_tool_schema`, потом `call_tool` для чтения или `call_write_tool` для изменений.

Если неясен кабинет, клиент или Пространство, сначала вызывай `get_provider_context({ provider: "vk" })`. Если пользователь назвал кампанию, вызывай `resolve_campaign_scope({ provider: "vk", query })` и используй возвращённые `connection_id`, `client_id`, `workspace_project_id` и `scope_arguments`.

Manual VK user-filter используй только когда он уже сохранён в LidFly и вернулся в provider context; произвольный id не подставляй.

## Запрещённые символы в текстах объявлений

**ВАЖНО:** VK Ads API НЕ принимает символ `→` (стрелка) в текстовых блоках баннеров.

Используй вместо `→`:
- `—` (тире)
- `,` (запятая)
- `.` (точка)
- `+` (плюс)

Пример:
- **Нельзя:** `Заявка → консультация → договор → результат`
- **Можно:** `Заявка — консультация — договор — результат`
- **Можно:** `Заявка, консультация, договор, результат`

## Лимиты текстовых блоков

| Блок | Макс. символов | Описание |
|---|---|---|
| `title_40_vkads` | 40 | Заголовок |
| `text_90` | 90 | Короткое описание |
| `text_long` | ~220 | Длинное описание |
| `title_30_additional` | 30 | Текст кнопки |
| `cta_sites_full` | — | CTA: `try`, `buy`, `more` и др. |
| `about_company_115` | 115 | Юридическая информация о рекламодателе |

## Обязательные изображения для мультиформата

Минимум для создания баннера (пакет 3858):
- **icon_256x256** — иконка/логотип
- **image_600x600** — квадратное изображение

Рекомендуется добавить:
- **image_1080x1350** — вертикальное (для ленты, выше CTR)

Изображения загружаются через `vk_upload_image(url, width, height)` — возвращает числовой ID для `content`.

## Контекстный таргетинг (ключевые фразы)

Порядок действий:
1. `vk_create_search_phrases(name, phrases, stop_phrases)` — создаёт список фраз И сегмент
2. Получить `segment_id` из ответа
3. Передать в `targetings: {"segments": [SEGMENT_ID]}`

**НЕ передавай `search_phrases_id` или `context_phrases` в targetings — таких полей НЕТ!**

## Создание кампании

VK API требует создать кампанию вместе с минимум одной группой объявлений:

```
vk_prepare_campaign(
  name,
  objective,
  ad_groups: [{name, package_id}]
)

# priced_goal добавляется только если checked_packages[].goal_mode == "required"
vk_create_campaign(
  name,
  objective: "site_conversions",
  budget_limit_day: "300",
  ad_groups: [{
    name,
    package_id: PACKAGE_ID
  }]
)
```

- Всегда читай `checked_packages[].paid_event_type`, `priced_event_type`, `goal_mode` и `goal_reason`.
- `goal_mode=required` — передай валидную цель группы или кампании: положительный `source_id` и непустой `name`.
- При `goal_mode=required` получи цель через `vk_get_goals` / `vk_get_counter_goals`: для цели счётчика `priced_goal.name` имеет формат `condition:substr` (например, `uss:example.com`), а `source_id` — ID счётчика; для VK Mini Apps при `priced_event_type=43` используй `vk_get_inapp_events`, где `name=event.name`, а `source_id=tracker.id`.
- `goal_mode=forbidden` — не передавай именованную цель. Не удаляй уже выбранную цель автоматически: согласуй CPC/CPM без цели либо другой goal/oCPM-пакет.
- `goal_mode=unsupported` — остановись до POST; не угадывай правило нового provider event type.
- Не требуй `priced_goal` только из-за `site_conversions` и не делай вывод из `options.settings.priced_goal`.
- Пустой `priced_goal.name` из provider-read не является наследуемой целью.
- Пакет 3509 имеет `priced_event_type=0` и не подходит для именованной goal-оптимизации.
- При `provider_goal_package_mismatch` / `inconsistent_priced_goal` не повторяй тот же payload.

## Бюджеты

- Минимальный дневной бюджет на группу: **300 руб** (150 руб не принимается)
- Бюджет кампании ограничивает суммарный расход всех групп
- Бюджеты передаются строкой в рублях

## Стратегии

| Режим | Описание |
|---|---|
| `max_goals` | Максимизация конверсий — для старта без данных |

## Статусы управления

| Действие | Статус |
|---|---|
| Запустить | `active` |
| Остановить | `blocked` |
| Удалить | `deleted` |
