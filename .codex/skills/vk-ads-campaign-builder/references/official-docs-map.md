# Official VK Docs Map

Используй этот файл как карту, а не как замену документации. Перед live-write сверяй конкретные поля и ограничения в локальных docs.

## Обязательные локальные источники

- Репозиторный справочник MCP: `docs/CLAUDE-VK.md`.
- Покрытие инструментов: `docs/VK-ADS-TOOLS.md`.
- Официальная справка VK Рекламы: `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/INDEX.md`.
- Официальная API-документация: `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk-ads-api/INDEX.md`.

## Создание и редактирование

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/start_creating.md` — структура кампания → группа → объявление, цели, бюджеты, таргетинги, URL-параметры, универсальные объявления.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/start_budget_limits.md` — бюджет обязателен, минимум 300 руб. для дневного и общего лимита, для Дзена 10 000 руб.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/start_ad_limits.md` — новые аккаунты до 300 объявлений, дневной лимит создания 200 объявлений.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/start_campaign_status.md` — черновик, модерация, активна, остановлена, лимит, баланс, завершена, удалена, отклонена.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/start_edit_campaign.md` — редактирование кампаний, групп, объявлений; массовая правка в кабинете до 50 объектов.

## Сайты, пиксель, события

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/sites_sites.md` — запуск рекламы сайта, требования к лендингу, выбор кликов или событий пикселя, рекомендация бюджета на 5-10 событий в день.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/sites_pixel.md` — создание/установка пикселя, события, автонайденные события, Data Layer, доступы.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/sites_visual_event.md` — визуальный конструктор событий, до 4 отслеживаемых элементов в одном событии, события нельзя удалить, можно менять категорию/название/ценность.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/sites_site_attribution.md` — PostClick, PostView, total; PostView для событий пикселя, выбранных целевым действием, окно 7 дней.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/sites_audience_tags.md` — аудиторные теги для сбора аудиторий, не для оптимизации как целевое действие.

## Лид-формы

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/lead_forms_lead_forms.md` — типы форм, поля, вопросы, результат, юридические данные, уведомления, интеграции, оценка лидов.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/lead_forms_lead_ads_tips.md` — меньше полей и вопросов, быстрый оффер, бонус/скидка, скорость обработки заявок.
- API docs для реализованного чтения: `resource_LeadForms.md`, `resource_Leads.md`, `object_LeadForm.md`, `object_LeadsListElement.md`.

## Ecommerce, каталоги, динамический ретаргетинг

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/ecomm_feed_campaign.md` — реклама товаров сайта/приложения, типы "привлечение" и "динамический ретаргетинг", связь каталога с источником событий.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/ecomm_feed_catalog_ecomm_catalog.md` — создание, редактирование, доступы, источники событий, обновление каталога.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/ecomm_feed_catalog_ecomm_catalog_requirements.md` — фид по ссылке без редиректов, файл до 8 ГБ по ссылке или 100 МБ upload, до 4 млн товаров, UTF-8/Windows-1251, без HTML-тегов.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/ecomm_dyn_ret_ecomm_web_dynrem.md` — обязательные события: просмотр карточки товара, корзина/add_to_cart, покупка; `product_id` должен совпадать с фидом, `value` передаёт стоимость.

## Mini Apps, Senler, сообщества

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/network_mini_app.md` — объект "Вконтакте, ОК, Mini Apps, Дзен" → "Mini Apps и игры"; результат равен выбранному целевому действию.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/network_vkwebapptrackevent.md` — `VKWebAppTrackEvent`, типовые события `subscribe`, `lead`, `purchase`, `add_to_cart`, `registration`, `login` и др.
- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/community_engagement.md` — цели сообщества: подписка, сообщение, продвижение поста; требования к постам и креативам.
- В `docs/CLAUDE-VK.md` для Mini Apps source of truth: `Package.priced_event_type = 43`, `priced_goal.source_id = tracker.id`, `priced_goal.name = event.name`.

## Агентства

- `/Users/mavbook/projects/direct-mcp/scraper-firecrawl/vk/agency_agency_clients.md` — клиенты агентства, списания с клиента, требования подтверждённых реквизитов для присоединения существующих клиентов.
- В `docs/CLAUDE-VK.md` агентский режим работает через `client_id`; агентские инструменты сами без `client_id`.

## API-страницы для проверки полей

- Кампании: `resource_AdPlans.md`, `resource_AdPlan.md`, `object_AdPlan.md`.
- Группы: `resource_AdGroups.md`, `resource_AdGroup.md`, `object_AdGroup.md`, `object_Targetings.md`.
- Объявления: `resource_Banner.md`, `resource_Banners.md`, `resource_BannerFields.md`, `resource_BannerPatterns.md`, `object_Banner.md`, `object_BannerContent.md`.
- Контент: `resource_Content.md`, `object_Content.md`, `object_ContentVariant.md`.
- Пакеты и плейсменты: `resource_Packages.md`, `resource_PackagesPads.md`, `resource_PadsTree.md`, `object_Package.md`.
- Аудитории: `resource_RemarketingCounters.md`, `resource_CounterGoals.md`, `resource_Segments.md`, `resource_SegmentRelations.md`, `resource_RemarketingVkGroups.md`, `info_SegmentParams.md`.
- Статистика: `info_Statistics.md` и профильные MCP tools.
