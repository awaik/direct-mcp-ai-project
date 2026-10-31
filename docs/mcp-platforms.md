# Каталог площадок LidFly MCP: Яндекс Директ, Метрика, Вордстат, Вебмастер, Аудитории, AppMetrica, VK Ads, ВКонтакте, Telegram, MAX, Авито и Сайты (RU / EN)

Этот справочник описывает все сервисы, подключённые к единому MCP-серверу **[LidFly](https://lidfly.ru/)** (`https://lidfly.ru/mcp/v3`), их идентификаторы контекста (`provider`, `scope`), поисковые запросы для `search_tools` и профильные навыки (`skills`) для **Claude Code, Claude Desktop (Cowork), ChatGPT, OpenAI Codex, Cursor, VS Code (Copilot), Windsurf, Gemini CLI, OpenCode, Cline и OpenClaw**.

---

## Быстрая таблица всех MCP-интеграций

| Площадка (RU / EN) | `provider` в MCP v3 | Ключевой ID объекта | Поиск в `search_tools` | Профильные `skills` |
|---|---|---|---|---|
| **Яндекс Директ MCP** (`Yandex Direct MCP`) | `yandex` | `connection_id`, `client_login` | `query: "campaigns"`, `"direct"`, `"keywords"`, `"bids"` | `yandex-direct-campaign-builder`, `export-ad-reports` |
| **Яндекс Метрика MCP** (`Yandex Metrika MCP`) | `yandex` | `counter_id` (без `client_login`) | `query: "metrika"` | `yandex-metrika`, `export-ad-reports` |
| **AppMetrica MCP** (`Yandex AppMetrica MCP`) | `yandex` | `application_id` (без `client_login`) | `query: "appmetrica"` | `yandex-metrika` |
| **Яндекс Вордстат MCP** (`Yandex Wordstat MCP`) | `yandex` | не требует кабинета Директа | `query: "wordstat"` | `demand-research`, `semantic-core` |
| **Яндекс Вебмастер MCP** (`Yandex Webmaster MCP`) | `yandex` | `host_id` (без `client_login`) | `query: "webmaster"` | `yandex-webmaster`, `seo-optimizer`, `serp-monitor` |
| **Яндекс Аудитории MCP** (`Yandex Audience MCP`) | `yandex` | `audience_connection_id` | `query: "audience"` | `yandex-direct-campaign-builder`, `yandex-metrika` |
| **VK Реклама MCP** (`VK Ads MCP`) | `vk` | `connection_id`, `client_id` | `provider: "vk"`, `query: "vk"` | `vk-ads-campaign-builder`, `export-ad-reports` |
| **ВКонтакте MCP (сообщества)** (`VKontakte MCP`) | `vk_social` | `connection_id`, `group_id` | `provider: "vk_social"`, `query: "vk_social"` | `vk-social-community` |
| **Telegram MCP (каналы и группы)** (`Telegram MCP`) | `telegram` | `connection_id`, `chat_binding_id` | `provider: "telegram"`, `query: "telegram"` | `telegram-posting` |
| **Мессенджер MAX MCP (каналы)** (`MAX Messenger MCP`) | `max` | `connection_id`, `chat_binding_id` | `provider: "max"`, `query: "max"` | `max-posting` |
| **Авито MCP (профиль бизнеса)** (`Avito MCP`) | `avito` | `connection_id`, `avito_user_id` | `provider: "avito"`, `query: "avito"` | `avito-business` |
| **Авито Реклама MCP** (`Avito Ads MCP`) | `avito_ads` | `connection_id`, `account_id` (9 цифр) | `provider: "avito_ads"`, `query: "avito_ads"` | `avito-ads`, `export-ad-reports` |
| **Сайты, Магазины и Базы знаний LidFly MCP** | `lidfly` | `subdomain`, `workspace_project_id` | `provider: "lidfly"`, `query: "lidfly"` | `lidfly-site-commerce`, `lidfly-page-migration`, `lidfly-knowledge-maintainer`, `restaurant-yandex` |
| **ИИ-консультант и Договоры Word MCP** | `lidfly` | `workspace_project_id` | `query: "ermiy"`, `query: "business_docs"` | `lidfly-knowledge-maintainer` |
| **Видео → Статья, YouTube SEO и Редактура** | `lidfly` | `transcription_id` | `query: "audio"` | `video-article-writer`, `youtube-video-seo`, `article-writer`, `article-reviser`, `human-editorial-polish` |
| **Пространства и Память проектов (`Workspace`)** | `workspace` | `workspace_project_id` | `provider: "workspace"`, `query: "workspace"` | `workspace-project-manager`, `mcp-v3-provider-context` |
| **Бухгалтерия УСН «Доходы» MCP** | отдельный endpoint | `workspace_project_id`, `accounting_entity_id` | endpoint `https://lidfly.ru/mcp/accounting` | встроенная методология `accounting_get_methodology` |

---

## 1. Яндекс Директ MCP (`Yandex Direct MCP`)

- **Что умеет:** аудит рекламного кабинета, сборка современных Единых перфоманс-кампаний (ЕПК, `add_unified_campaign` → `add_adgroup` → `add_keywords_batch` → `add_responsive_ad`), управление ставками, дневными и недельными бюджетами, минус-фразами, быстрыми ссылками, уточнениями и автотаргетингом, анализ поисковых запросов и срезов Reports API.
- **Как определяется контекст:** `get_provider_context({ provider: "yandex", client_login? })` или `resolve_campaign_scope({ provider: "yandex", query })`.
- **Документация на сайте:** [lidfly.ru/docs/yandex-direct](https://lidfly.ru/docs/yandex-direct)

---

## 2. Яндекс Метрика MCP и AppMetrica MCP (`Yandex Metrika & AppMetrica MCP`)

- **Что умеет:** список счётчиков (`metrika_get_counters`), проверка и создание целей, отчёты посещаемости, конверсий, источников трафика, UTM-меток, поисковых фраз и электронной коммерции; в **AppMetrica** (`appmetrica_list_applications`) — установки, активные пользователи (DAU/MAU), события и когорты мобильных приложений.
- **Важное правило:** инструменты Метрики работают по `counter_id`, а AppMetrica — по `application_id` (передавать `client_login` Директа в них не нужно).
- **Документация на сайте:** [lidfly.ru/docs/yandex-direct](https://lidfly.ru/docs/yandex-direct), [lidfly.ru/docs/yandex-appmetrica](https://lidfly.ru/docs/yandex-appmetrica)

---

## 3. Яндекс Вордстат MCP (`Yandex Wordstat MCP`)

- **Что умеет:** проверка частотности ключевых фраз (`wordstat_top_requests`), динамика спроса и сезонность по месяцам/неделям (`wordstat_dynamics`), распределение спроса по городам и регионам (`wordstat_regions`, `wordstat_find_region`), сбор семантического ядра и минус-слов.
- **Важное правило:** работает сразу через серверный API LidFly и **не требует** подключённого кабинета Яндекс Директа.
- **Документация на сайте:** [lidfly.ru/docs/wordstat](https://lidfly.ru/docs/wordstat)

---

## 4. Яндекс Вебмастер MCP (`Yandex Webmaster MCP`)

- **Что умеет:** список подтверждённых сайтов (`webmaster_get_hosts`), сводка ИКС и индексации (`webmaster_get_host_summary`), популярные поисковые запросы, показы, клики, CTR и средние позиции (`webmaster_get_popular_queries`), диагностика ошибок сайта, управление файлами `sitemap` и отправка URL на переобход.
- **Важное правило:** начинает работу с `webmaster_get_hosts` и использует точный `host_id` (не `client_login`).
- **Документация на сайте:** [lidfly.ru/docs/yandex-webmaster](https://lidfly.ru/docs/yandex-webmaster)

---

## 5. Яндекс Аудитории MCP (`Yandex Audience MCP`)

- **Что умеет:** загрузка клиентских баз из CRM (телефоны, email в CSV через `audience_request_csv_upload`), создание сегментов на основе данных Метрики, AppMetrica и геолокации, построение похожих аудиторий (`look-alike`) и выдача доступов рекламным кабинетам Директа.
- **Документация на сайте:** [lidfly.ru/docs/yandex-audience](https://lidfly.ru/docs/yandex-audience)

---

## 6. VK Реклама MCP (`VK Ads MCP`)

- **Что умеет:** аудит и создание кампаний (`vk_prepare_campaign` → `vk_create_campaign`), управление группами, баннерами, медиафайлами, лид-формами и аудиториями ретаргетинга, проверка совместимости целей (`checked_packages.goal_mode`), детальная статистика по кампаниям, группам, объявлениям и лидам.
- **Документация на сайте:** [lidfly.ru/docs/vk-ads](https://lidfly.ru/docs/vk-ads)

---

## 7. ВКонтакте MCP для сообществ (`VKontakte Communities MCP`, `vk_social`)

- **Что умеет:** ведение групп и пабликов ВКонтакте (`provider: "vk_social"`, отдельно от рекламного кабинета VK Ads):
  - мгновенные и отложенные посты на стену (до 10 вложений: фото, видео, опросы, ссылки), редактирование, закрепление, репосты и разбор предложенных записей («предложки»);
  - публикация фото и видео в истории (`stories`) со ссылками и статистика просмотров;
  - чтение и ответы на комментарии от имени сообщества, модерация обсуждений;
  - чтение диалогов и ответы клиентам в сообщениях сообщества;
  - управление карточками и подборками товаров ВК;
  - аналитика охвата, ER, прироста подписчиков и разбор постов конкурентов.
- **Документация на сайте:** [lidfly.ru/docs/vkontakte](https://lidfly.ru/docs/vkontakte)

---

## 8. Telegram MCP (`Telegram Channels & Groups MCP`, `telegram`)

- **Что умеет:** публикация и отложенное планирование постов в подключённые Telegram-каналы и группы (`provider: "telegram"`), фото и медиа-альбомы до 10 вложений, спойлеры, inline-кнопки со ссылками, редактирование, закрепление и удаление собственных постов, а также безопасный предпросмотр в личном чате с ботом (`telegram_preview_post`) до выхода в канал.
- **Документация на сайте:** [lidfly.ru/docs/telegram](https://lidfly.ru/docs/telegram)

---

## 9. Мессенджер MAX MCP (`MAX Messenger Channels MCP`, `max`)

- **Что умеет:** ведение каналов в мессенджере MAX (`provider: "max"`): мгновенная и отложенная публикация постов (до 12 фото/видео, файлы до 250 МБ), inline-кнопки со ссылками и копированием промокода, автоматический и ручной предпросмотр в диалоге с ботом (`max_preview_post`), чтение всей истории ленты канала с просмотрами каждого поста (`max_get_channel_history`), чтение и ответы на комментарии, кросс-постинг из Telegram и ВКонтакте.
- **Документация на сайте:** [lidfly.ru/docs/max](https://lidfly.ru/docs/max)

---

## 10. Авито MCP и Авито Реклама MCP (`Avito & Avito Ads MCP`)

- **Профиль продавца Авито (`provider: "avito"`, навык `avito-business`):** объявления, цены, остатки, автозагрузка фидов (`Autoload`), ответы покупателям в чатах Авито Мессенджера, работа с отзывами и рейтингом, заказы, генерация карточек и ИИ-фотографий товаров, услуги продвижения `Avito Promo`.
- **Авито Реклама (`provider: "avito_ads"`, навык `avito-ads`):** управление рекламными кампаниями, группами, ставками, бюджетами, балансом и агентскими кабинетами.
- **Документация на сайте:** [lidfly.ru/docs/avito](https://lidfly.ru/docs/avito), [lidfly.ru/docs/avito-ads](https://lidfly.ru/docs/avito-ads)

---

## 11. Сайты, Магазины (Commerce), Базы знаний, ИИ-консультант и Договоры Word (`lidfly`, `ermiy`, `business_docs`)

- **Сайты и интернет-магазины LidFly (`lidfly_*`):** создание и редизайн лендингов и многостраничных сайтов, перенос страниц 1:1 (`lidfly-page-migration`), каталог товаров, остатки, заказы, приём оплаты (ЮKassa), SEO/GEO-метаданные, Schema.org, RSS и товарные YML-фиды (включая меню ресторанов для Яндекс Бизнеса).
- **Самообновляемые базы знаний и ИИ-консультант (`lidfly-knowledge-maintainer`, `ermiy_*`):** сбор источников (тексты, URL, файлы), синтез связанных вики-статей, ревизии и обучение ИИ-помощника.
- **Генерация документов Word (`business_docs_*`):** загрузка ваших `.docx`-шаблонов с плейсхолдерами и автоматическая генерация договоров, счетов, актов и КП по реквизитам клиента.
- **Документация на сайте:** [lidfly.ru/docs/lidfly](https://lidfly.ru/docs/lidfly), [lidfly.ru/docs/ermiy-knowledge](https://lidfly.ru/docs/ermiy-knowledge)

---

## 12. Бесплатная расшифровка видео и аудио, YouTube SEO и редактура статей (Хабр, VC.ru, блог)

- **Видео и аудио до 3 ГБ → статья (`video-article-writer`):** локальное извлечение аудиодорожки в лёгкий моно-MP3 (`ffmpeg`), бесплатная серверная транскрибация в LidFly (`request_upload_audio`, `transcribe_audio_url`, `get_transcription`) и превращение записи в структурированную статью.
- **YouTube SEO (`youtube-video-seo`):** 3–5 вариантов названий с проверкой спроса в Вордстате, описание, точные таймкоды (главы), теги, закреплённый комментарий и текст для обложки.
- **Написание, ревизия и гуманизация статей (`article-writer`, `article-reviser`, `human-editorial-polish`):** полный цикл подготовки материалов по редакционному профилю [`.styles/awaik.md`](../.styles/awaik.md) с удалением нейросетевых штампов и 100% сохранением фактов и цифр.
