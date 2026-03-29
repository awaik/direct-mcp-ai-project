---
name: vk-ads
description: "Управление рекламой VK Ads: создание кампаний, таргетинг, ретаргетинг, контекстные фразы, статистика, look-alike."
---

# VK Ads — управление рекламными кампаниями

Workflow-гайд для управления рекламой через MCP-сервер `vk-ads`.

**MCP-сервер:** `vk-ads` — отдельный от `yandex-direct`. 76 инструментов с префиксом `vk_`. Включает задачи (`vk_add_tasks`, `vk_get_tasks`, `vk_complete_task`).

**Правила API:** всегда сверяйся с `VK-ADS-RULES.md` — запрещённые символы, лимиты текстов, бюджеты, форматы.

---

## Справочник ключевых инструментов

### Кампании и структура

| Инструмент | Описание |
|---|---|
| `vk_get_campaigns` | Список кампаний с фильтрами и пагинацией |
| `vk_create_campaign` | Создать кампанию с бюджетом, целью, группами |
| `vk_update_campaign` | Изменить настройки кампании |
| `vk_manage_campaigns` | Массовое изменение статуса/бюджета (до 200) |
| `vk_get_ad_groups` | Группы объявлений с таргетингами |
| `vk_create_ad_group` | Создать группу с таргетингом и бюджетом |
| `vk_update_ad_group` | Изменить настройки группы |
| `vk_manage_ad_groups` | Массовое управление группами (до 200) |

### Объявления и контент

| Инструмент | Описание |
|---|---|
| `vk_get_banners` | Список объявлений с модерацией и контентом |
| `vk_create_banner` | Создать объявление в группе |
| `vk_update_banner` | Изменить контент и настройки объявления |
| `vk_manage_banners` | Массовое изменение статуса (до 200) |
| `vk_create_url` | Зарегистрировать URL — получить ID для баннера |
| `vk_upload_image` | Загрузить изображение по URL — content ID |
| `vk_remoderate_banners` | Повторная модерация отклонённых |

### Аудитории и ретаргетинг

| Инструмент | Описание |
|---|---|
| `vk_create_remarketing_counter` | Создать счётчик (пиксель) |
| `vk_create_counter_goal` | Создать цель для счётчика |
| `vk_create_remarketing_list` | Создать список пользователей |
| `vk_create_segment` | Создать аудиторный сегмент |
| `vk_manage_segment_relations` | Связи сегментов с источниками |
| `vk_add_vk_group` | Добавить VK-сообщество как источник |
| `vk_create_search_phrases` | Контекстные фразы — сегмент |

### Аналитика и справочники

| Инструмент | Описание |
|---|---|
| `vk_get_statistics` | Статистика по кампаниям/группам/баннерам |
| `vk_get_goal_statistics` | Статистика по целям конверсий |
| `vk_get_packages` | Пакеты размещения (форматы рекламы) |
| `vk_get_regions` | Справочник регионов для геотаргетинга |
| `vk_get_targetings_tree` | Дерево интересов и таргетингов |
| `vk_get_projection` | Прогноз охвата при разных ставках |

---

## Workflow 1: Создание кампании

### Чеклист

1. **Подготовить URL:**
   ```
   vk_create_url(url: "https://example.com/landing?utm_source=vk&utm_medium=cpc&utm_campaign=slug")
   ```
   Запомнить числовой `id` ссылки.

2. **Загрузить изображения (минимум для мультиформата):**
   ```
   vk_upload_image(url: "https://example.com/icon.png", width: 256, height: 256)
   vk_upload_image(url: "https://example.com/square.jpg", width: 600, height: 600)
   ```
   Рекомендуется добавить `1080x1350` (вертикальное, выше CTR).
   Запомнить content ID каждого изображения.

3. **Создать кампанию с группой:**
   ```
   vk_create_campaign(
     name: "Название кампании",
     objective: "site_conversions",
     budget_limit_day: "300",
     ad_groups: [{
       name: "Группа — аудитория",
       package_id: 3858,
       priced_goal: {
         source_id: <ID счётчика VK>,
         name: "uss:example.com"   // формат condition:substr
       }
     }]
   )
   ```
   - `priced_goal.name` — формат `condition:substr` (пример выше: `uss:example.com`)
   - Минимальный дневной бюджет на группу: **300 руб**
   - Бюджеты в рублях (строкой), НЕ в микроюнитах

4. **Создать объявление (баннер):**
   ```
   vk_create_banner(
     ad_group_id: <id группы>,
     url_id: <id ссылки>,
     content: {
       title_40_vkads: "Заголовок до 40 символов",
       text_90: "Описание до 90 символов",
       text_long: "Длинное описание до 220 символов",
       title_30_additional: "Кнопка до 30 символов",
       icon_256x256: <content_id>,
       image_600x600: <content_id>,
       about_company_115: "Юр. информация до 115 символов"
     }
   )
   ```

   **Лимиты текстов:**
   | Блок | Макс. символов |
   |------|---------------|
   | `title_40_vkads` | 40 |
   | `text_90` | 90 |
   | `text_long` | ~220 |
   | `title_30_additional` | 30 |
   | `about_company_115` | 115 |

   **Запрещённые символы:** `→` (стрелка). Используй `—`, `,`, `.`, `+`.

5. **Настроить таргетинг группы** (если не задан при создании):
   ```
   vk_update_ad_group(
     ad_group_id: <id>,
     targetings: {
       geo: { regions: [<id регионов>] },
       age: { age_list: ["25-34", "35-44"] },
       sex: "male",
       interests: [<id интересов из vk_get_targetings_tree>],
       segments: [<id сегментов>]
     }
   )
   ```

6. **Создать файл кампании:** `campaigns/<utm_slug>.md` по шаблону.

---

## Workflow 2: Настройка ретаргетинга

### Счётчик и цели

1. **Создать счётчик (пиксель):**
   ```
   vk_create_remarketing_counter(name: "Счётчик сайта example.com")
   ```

2. **Создать цель:**
   ```
   vk_create_counter_goal(
     counter_id: <id>,
     name: "Заявка",
     goal_type: "url_substring",
     value: "thank-you"
   )
   ```

### Списки и сегменты

3. **Создать список пользователей:**
   ```
   vk_create_remarketing_list(
     counter_id: <id>,
     name: "Посетители за 30 дней",
     type: "positive"
   )
   ```

4. **Создать сегмент:**
   ```
   vk_create_segment(
     name: "Ретаргетинг — посетители",
     pass_condition: 1,
     relations: [{
       object_type: "remarketing_player",
       params: { source_id: <list_id>, type: "positive" }
     }]
   )
   ```

5. **Использовать сегмент** в `targetings.segments` группы объявлений.

### Таргетинг на подписчиков VK-сообщества

1. `vk_resolve_url(url: "https://vk.com/community")` — получить `url_object_id`
2. `vk_get_vk_groups(search: "community")` — проверить, зарегистрировано ли
3. Если нет — `vk_add_vk_group(object_id: <url_object_id>)` — добавить
4. Из ответа взять `object_id` — это **source_id** для сегмента
5. Создать сегмент:
   ```
   vk_create_segment(
     name: "Подписчики VK Community",
     relations: [{
       object_type: "remarketing_vk_group",
       params: { source_id: <object_id>, type: "positive" }
     }]
   )
   ```

**Важно — 3 разных ID VK-групп:**
| Поле | Что это | Для чего |
|------|---------|----------|
| `id` | Внутренний ID VK Ads | Только для API vk_groups, НЕ для source_id |
| `object_id` | VK community ID | **source_id для remarketing_vk_group** |
| `url_object_id` | VK community ID (из resolve) | Совпадает с object_id |

---

## Workflow 3: Контекстный таргетинг

Контекстный таргетинг в VK = показ рекламы людям, которые недавно искали определённые фразы.

### Шаги

1. **Создать список фраз:**
   ```
   vk_create_search_phrases(
     name: "Фразы — тематика",
     phrases: ["купить X", "заказать X", "X цена"],
     stop_phrases: ["бесплатно", "отзывы", "своими руками"]
   )
   ```
   Возвращает `segment_id` — ID автоматически созданного сегмента.

2. **Передать сегмент в таргетинг группы:**
   ```
   vk_update_ad_group(
     ad_group_id: <id>,
     targetings: { segments: [<segment_id>] }
   )
   ```

**ВАЖНО:** передавай `segment_id` в `targetings.segments`. НЕ передавай `search_phrases_id` или `context_phrases` — таких полей в targetings НЕТ.

---

## Workflow 4: Анализ и оптимизация

### Шаги

1. **Получить статистику:**
   ```
   vk_get_statistics(
     object_type: "campaign",
     object_ids: [<id>],
     date_from: "YYYY-MM-DD",
     date_to: "YYYY-MM-DD",
     metrics: ["shows", "clicks", "spent", "goals"]
   )
   ```

2. **Статистика по группам** (найти неэффективные):
   ```
   vk_get_statistics(
     object_type: "ad_group",
     object_ids: [<id1>, <id2>],
     ...
   )
   ```

3. **Анализ KPI:**
   - CTR < 0.5% — пересмотреть креативы или таргетинг
   - CPA выше порога — проверить конверсии на лендинге
   - Расход без конверсий — остановить группу

4. **Действия:**
   - Отключить неэффективные группы: `vk_manage_ad_groups(ids: [...], status: "blocked")`
   - Перераспределить бюджет на работающие группы
   - Обновить креативы: `vk_update_banner`
   - Обновить файл кампании `campaigns/<utm>.md`

---

## Workflow 5: Масштабирование

### Бюджет

- Увеличивать не более **+20-30% за раз**
- Только после стабильных 1-2 недель с хорошим CPA
- Следить за CTR — при масштабировании может падать

### Look-alike из работающих сегментов

1. Определить сегменты с лучшими конверсиями
2. Использовать их как seed для look-alike аудиторий
3. Тестировать на отдельной группе с ограниченным бюджетом

### Расширение

- **Гео:** добавить новые регионы в отдельных группах
- **Форматы:** протестировать другие пакеты размещения (`vk_get_packages`)
- **Аудитории:** новые интересы, сообщества, контекстные фразы

---

## Кросс-ссылки

| Задача | Скилл / файл |
|--------|--------------|
| Правила VK API (символы, лимиты, форматы) | `VK-ADS-RULES.md` |
| Юридическая проверка текстов | `LEGAL.md` |
| Бизнес-правила, CPA-пороги | `PROJECTS.md` |
| Яндекс Директ (если ведётся параллельно) | скилл `yandex-direct` |
| Аналитика Яндекс Метрики | скилл `yandex-metrika` |
