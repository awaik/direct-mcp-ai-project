# Креативы, разметка, интеграции

Проверено 26.09.2026. Это правила **кабинета**, если не указано иное. **API:** создание креативов не поддержано — [справочник](https://www.avito.ru/developers/api-catalog/ads/documentation). Подготовка материала не означает его публикацию.

## Форматы

Правовая информация — до 800 символов в шести форматах: [нативный](https://ads-help.avito.com/formats/native), [премиум](https://ads-help.avito.com/formats/premium), [стандарт](https://ads-help.avito.com/formats/media), [главная](https://ads-help.avito.com/formats/mainpage), [профиль продавца](https://ads-help.avito.com/formats/seller-profile), [видео](https://ads-help.avito.com/formats/video). В [HTML5](https://ads-help.avito.com/formats/html5) лимит остаётся 150. Дата всех источников — 26.09.2026.

Нативный баннер 8:3: рекомендовано 1372×512, минимум 1029×384, файл до 2 МБ. [Источник](https://ads-help.avito.com/formats/native), 26.09.2026.

Для HTML5 справка запрещает теги `clippath`, `lineargradient`, `rect`, `use`. Проверяй экспорт редактора, а не только картинку. [Источник](https://ads-help.avito.com/formats/html5), 26.09.2026.

Для главной страницы минимальный бюджет одной группы **для запуска** — 200 000 ₽ с НДС. Не применять этот порог как запрет изменения бюджета уже работающей группы: такого правила и проверяемого API-признака формата не подтверждено. [Источник](https://ads-help.avito.com/formats/mainpage), 26.09.2026.

## UTM

Макросы записываются в нижнем регистре. Рекомендованная разметка:

| Параметр | Значение |
|---|---|
| utm_source | avito-ads |
| utm_referrer | avito-ads |
| utm_medium | {price_model} |
| utm_campaign | {campaign_id} |
| utm_term | {adgroup_id} |
| utm_content | {ad_id} |

`{rnd}` — случайное число, не ID группы. Пример:

```text
https://example.org/?utm_source=avito-ads&utm_medium={price_model}&utm_campaign={campaign_id}&utm_term={adgroup_id}&utm_content={ad_id}
```

[Ссылки и UTM](https://ads-help.avito.com/creative/links), официальный сайт сверён 26.09.2026. Не переносить синтаксис других интеграторов в эту таблицу.

## Интеграции

- **Adserving:** отдельный синтаксис `ord=$${rnd}$$&LineID=$${erid}$$`. Не заменять его обычными UTM-макросами. [Источник](https://ads-help.avito.com/external/adserving), 26.09.2026.
- **AppsFlyer:** пример источника повреждён: `clickid={clickid {{age}}`. Не копировать его в рабочую ссылку и не «чинить» догадкой. Сообщить о дефекте справки и запросить актуальный шаблон у интегратора/Авито. [Источник](https://ads-help.avito.com/external/appsflyer), 26.09.2026.
- **Smartis:** рекомендуемый порядок имени — агентство, рекламодатель, объект, продукт, дата. Это рекомендация интегратора для сопоставления данных, не ограничение API Авито. [Источник](https://ads-help.avito.com/external/smartis), 26.09.2026.
