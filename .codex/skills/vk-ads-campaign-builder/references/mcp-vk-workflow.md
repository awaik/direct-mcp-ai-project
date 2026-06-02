# MCP VK Workflow

Этот reference описывает практический порядок работы с нашим MCP VK Ads и держит механику инструментов, которую не надо раздувать в `SKILL.md`. Для точной схемы конкретного инструмента всегда вызови `get_tool_schema`.

Работаем с новым VK Ads (трёхуровневая структура: кампания -> группа -> объявление), а не со старым myTarget как основным сценарием. `subscription_status` не вызывай для обычных задач - только диагностика подключения/подписки по явной просьбе или после auth-ошибки.

## Discovery

В lite-режиме:

1. `mcp__vk_ads.search_tools({ query })` — найти инструменты по задаче.
2. `mcp__vk_ads.get_tool_schema({ tool_name })` — получить схему перед первым вызовом.
3. `mcp__vk_ads.call_tool({ tool_name, arguments })` — вызвать инструмент.

## Базовые инструменты

| Задача | Инструменты |
|---|---|
| Статус и кабинет | `vk_status`, `vk_get_user`, `vk_get_agency_clients` |
| Кампании | `vk_get_campaigns`, `vk_get_campaign`, `vk_create_campaign`, `vk_update_campaign`, `vk_manage_campaigns` |
| Группы | `vk_get_ad_groups`, `vk_get_ad_group`, `vk_create_ad_group`, `vk_update_ad_group`, `vk_manage_ad_groups` |
| Объявления | `vk_get_banners`, `vk_get_banner`, `vk_create_banner`, `vk_update_banner`, `vk_manage_banners`, `vk_remoderate_banners` |
| URL и медиа | `vk_resolve_url`, `vk_create_url`, `vk_get_urls`, `vk_upload_image`, `vk_upload_video`, `request_upload`, `list_media` |
| Пакеты и плейсменты | `vk_get_packages`, `vk_get_package`, `vk_get_banner_fields`, `vk_get_banner_patterns`, `vk_get_packages_pads`, `vk_get_pads_tree`, `vk_get_projection` |
| Цели и пиксель | `vk_get_goals`, `vk_get_remarketing_counters`, `vk_get_counter_goals`, `vk_create_remarketing_counter`, `vk_create_counter_goal` |
| Аудитории | `vk_get_segments`, `vk_create_segment`, `vk_manage_segment_relations`, `vk_get_remarketing_lists`, `vk_create_remarketing_list`, `vk_get_vk_groups`, `vk_add_vk_group` |
| Контекстные фразы | `vk_create_search_phrases`, `vk_get_search_phrases`, `vk_update_search_phrases`, `vk_delete_search_phrases` |
| Mini Apps / приложения | `vk_get_mobile_apps`, `vk_get_inapp_events`, `vk_get_inapp_event_categories`, `vk_update_inapp_event_category`, `vk_get_inapp_stats` |
| Лид-формы | `vk_get_lead_forms`, `vk_get_leads` |
| Статистика | `vk_get_statistics`, `vk_get_goal_statistics`, `vk_get_community_stats`, `vk_get_video_report`, `vk_get_offline_conversions`, `vk_get_realtime_stats` |

## Создание кампании

Read-only:

1. Проверить кабинет: `vk_status`, `vk_get_user`; для агентства выбрать `client_id` через `vk_get_agency_clients`.
2. Проверить дубли и историю: `vk_get_campaigns(fields: "id,name,status,budget_limit,budget_limit_day,objective,priced_goal")`.
3. Выбрать пакет: `vk_get_packages(fields: "id,name,objective,paid_event_type,priced_event_type,status,package_request")`, затем `vk_get_package(id)`.
4. Получить цели:
   - сайт: `vk_get_goals`, `vk_get_remarketing_counters`, `vk_get_counter_goals`;
   - Mini Apps: `vk_get_mobile_apps`, `vk_get_inapp_events`;
   - лид-форма: `vk_get_lead_forms`;
   - сообщество: `vk_resolve_url`, затем при аудиториях `vk_get_vk_groups`.
5. Получить справочники таргетинга: `vk_get_regions`, `vk_get_targetings_tree`, `vk_get_segments`, при необходимости `vk_create_search_phrases` после подтверждения.

Write после подтверждения:

1. Загрузить медиа: `vk_upload_image`/`vk_upload_video` по публичному URL. Для локальных файлов сначала `request_upload`, затем upload URL.
2. Зарегистрировать ссылку: `vk_create_url` или использовать удобный `url` в `vk_create_banner`.
3. Создать кампанию через `vk_create_campaign`; VK API требует минимум одну `ad_groups`.
4. Если баннеры не создавались вложенно, создать их через `vk_create_banner`.
5. Перечитать: `vk_get_campaign`, `vk_get_ad_groups`, `vk_get_banners`.

Минимальные поля группы:

- `name`
- `package_id`
- `targetings`, чаще `{"geo": {"regions": [REGION_ID]}}`
- `age_restrictions`, например `"0+"`, `"18+"`
- бюджет: `budget_limit_day` или `budget_limit` + `date_end`
- `priced_goal` для `site_conversions`, engagement и Mini Apps/in-app пакетов.

## Редактирование

1. Прочитай текущие поля объекта:
   - кампания: `vk_get_campaign(id)`
   - группа: `vk_get_ad_group(id)`
   - объявление: `vk_get_banner(id)`
2. Прочитай родителей, если меняешь бюджет, цель, пакет, ссылку или статус.
3. Если меняешь бюджет:
   - `autobidding_mode` на кампании задан — бюджет обычно менять через `vk_update_campaign`;
   - `autobidding_mode` пустой — бюджет менять на уровне групп через `vk_update_ad_group`.
4. Перед бюджетом/ставкой/таргетингом вызови `vk_get_package(package_id)` и проверь `options.settings`.
5. Для `vk_update_banner` секции `content`, `textblocks`, `urls` полностью замещаются. Сначала получи текущий баннер и передай полную новую секцию.
6. Для массовых изменений используй `vk_manage_campaigns`, `vk_manage_ad_groups`, `vk_manage_banners`. MCP max 200 за вызов; для риска и читаемости лучше меньшие пачки.
7. После записи перечитай объект.

## Таргетинги

Используй реальные поля из `vk_get_package` и `vk_get_targetings_tree`.

Частые структуры:

```json
{"geo": {"regions": [188]}}
```

```json
{"age": {"age_list": [25,26,27,28,29,30,31,32,33,34]}, "sex": ["female"]}
```

```json
{"segments": [123456]}
```

Локальное гео:

```json
{
  "geo": {
    "local_geo": {
      "visit_type": "usual",
      "loc_type": ["home", "work"],
      "locations": [{"lat": 55.75583, "lng": 37.6173, "radius": 3000}]
    }
  }
}
```

Контекстные фразы: `vk_create_search_phrases` возвращает `segment_id`; передавай именно его в `targetings.segments`.

Сообщества: `vk_get_vk_groups` возвращает `object_id`; для relation `remarketing_vk_group` `params.source_id = object_id`, не внутренний `id`.

## Объявления

Перед созданием:

1. `vk_get_ad_group(fields: "id,name,package_id")`.
2. `vk_get_package(package_id)` — посмотреть `banner_fields`, `url_types`, `options`.
3. `vk_get_banner_fields` или `vk_get_banner_patterns`, если неочевидны слоты.
4. Загрузить каждый required content slot.

Формат MCP:

```json
{
  "content": {"image_600x600": {"id": 12345}},
  "textblocks": {"title_40_vkads": {"text": "Заголовок"}},
  "url": "https://example.com/?utm_source=vk_ads"
}
```

Если VK вернул ошибку `At least one pattern must be in package's settings`, вызови `vk_get_banner_patterns(id__in: "...")` по ID из ошибки и пересобери баннер по одному допустимому паттерну.

## Статистика и диагностика

База:

- `vk_get_statistics(entity: "ad_plans" | "ad_groups" | "banners", period: "day", metrics: "base,events,custom_event,social_network,uniques,video,romi")`
- `vk_get_goal_statistics` для целей конверсий.
- `vk_get_community_stats` для вступлений, сообщений, CPJ/CPS.
- `vk_get_inapp_stats` для Mini Apps/in-app.
- `vk_get_video_report` для видео.
- `vk_get_offline_conversions` для CRM/offline.

Диагностика:

- Нет показов: статус, баланс, бюджет/дата, модерация, пакет, аудитория слишком узкая, `max_price` слишком низкий, недоступные плейсменты.
- Есть показы, нет кликов: креатив, оффер, релевантность аудитории, частота, плейсменты.
- Есть клики, нет конверсий: посадочная, форма, пиксель/цель, UTM, скорость загрузки, несоответствие обещания и страницы.
- Есть лиды, нет продаж: качество формы, вопросы, скорость обработки, CRM, оффер, холодность аудитории.

## UTM

Базовый шаблон для сайта:

```text
utm_source=vk_ads&utm_medium=cpc&utm_campaign={campaign_slug}&utm_content={ad_id}&utm_term={audience_slug}
```

Если используешь `enable_utm`/`utm` на группе, проверь, какие макросы поддерживает текущий пакет и объект рекламы. Для внешней аналитики фиксируй модель атрибуции в финальном ответе.
