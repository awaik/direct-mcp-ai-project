---
name: lidfly-support-escalation
description: "Безопасно восстанавливать transport errors и эскалировать проблемы LidFly MCP через read-only support_prepare_report и подтверждённый support_send_message. Использовать при unexpected/internal support_hint, повторном timeout read-вызова после retry и connectivity probe или неизвестной отсутствующей возможности после широкого search_tools; известные ограничения API провайдера не эскалировать."
---

# LidFly Support Escalation

Подготавливать обращение про MCP только после безопасной диагностики. Никогда не отправлять его автоматически.

## Выбрать Сценарий

- `support_hint.reason=unexpected_internal_error`: перейти к подготовке отчёта.
- Первый timeout read-вызова: один раз безопасно повторить тот же read. При повторном timeout сначала проверить восстановление транспорта по правилам ниже и только затем готовить отчёт.
- Timeout write-вызова: не повторять автоматически, пока инструмент или его результат не доказывает идемпотентность. Сначала проверить состояние read-инструментом; при неопределённости подготовить отчёт.
- Инструмент или возможность не найдены: повторить `search_tools({})` без `query` и `provider`. Только если широкий поиск ничего подходящего не вернул, подготовить запрос на возможность.
- `search_tools` вернул `capability_notice.status=unsupported_by_provider_api` либо методология явно говорит, что действие доступно только в интерфейсе провайдера: объяснить пользователю `summary`, `user_action` и доступные API-альтернативы. Это известная граница API, поэтому не эскалировать её, не вызывать `support_prepare_report`/`support_send_message` и не подменять задачу похожим write-инструментом.
- Validation, mode mismatch, access denied, auth, subscription, rate limit и штатную provider API error исправлять обычным способом без предложения поддержки.
- `resolve_campaign_scope.status=resolved|ambiguous|not_observed` — штатный типизированный результат, а не технический инцидент. Для `incomplete` эскалация допустима после второго типизированного timeout либо при contract error; для `failed` — только при internal/contract reason.

## Восстановить Транспорт Без Ложной Ошибки Провайдера

`transport send error`, `HTTP request failed`, HTTP 000, нулевой ответ без заголовков и разрыв до получения HTTP-статуса означают транспортную неопределённость на участке между MCP-клиентом и LidFly. Это не доказывает ошибку инструмента или провайдера. Не считать такую ситуацию ошибкой Wordstat, Яндекс Директа или отсутствием нужной возможности.

1. Для read-only вызова безопасно повторить тот же вызов один раз.
2. Если второй вызов завершился той же ошибкой без HTTP-ответа, вызвать прямой read-only `subscription_status({})` как один лёгкий connectivity/auth probe. Не запускать параллельные повторы.
3. Если probe вернул любой корректный MCP/HTTP-ответ, соединение восстановлено. Если это структурированная auth/subscription/rate-limit ошибка, обработать её по категории; иначе один раз повторить исходный read и продолжить исходную задачу.
4. Если probe также не получил HTTP-ответ либо восстановленный исходный read снова потерял транспорт, подготовить диагностический черновик. Честно сказать, что результат исходного read не получен; не объявлять provider error и не утверждать, что данные отсутствуют.

Отдельная ветка для уже полученного HTTP-ответа: если сервер вернул HTTP 429 или 503 с `Retry-After`, шаги 1–4 восстановления транспорта не выполнять. Выдержать указанную задержку и один раз повторить read вместо connectivity probe или немедленной эскалации.

Для write-вызова транспортная неопределённость означает неизвестный исход. Не повторять write автоматически: проверить состояние read-инструментом или `get_write_operation_status`, если есть `operation_id`.

## Подготовить Черновик

1. При `support_hint` вызвать прямой top-level tool:

   ```js
   support_prepare_report({
     reason: support_hint.next_arguments.reason,
     tool_name: support_hint.next_arguments.tool_name,
     error: support_hint.next_arguments.error,
     user_goal: "...",
     expected_result: "...",
     attempted_steps: ["..."]
   })
   ```

2. При повторном read-timeout передать `reason: { kind: "repeated_read_timeout", attempt_count: 2, error_code: "timeout" }`. Для campaign discovery также передать фактический `campaign_resolution_status: "incomplete"`.
3. При неизвестном результате write передать `reason: { kind: "unknown_write_outcome", operation_id }`; при ошибке structured provider-контракта — `reason: { kind: "provider_contract_error", contract_error_code }`.
4. Для отсутствующей после широкого поиска возможности использовать `reason: { kind: "capability_request", capability: "..." }` и `tool_name: "search_tools"`. Сервер создаст feature request, а не диагностический incident.
5. Передавать только диагностический текст: цель, ожидаемый результат и до восьми коротких проверенных шагов. Не передавать raw arguments, токены, OAuth/API keys, пароли, seller secrets, персональные данные, содержимое файлов или локальные логи.
6. Если `redactions_count > 0`, сообщить, что секретные фрагменты автоматически скрыты.

`support_prepare_report` read-only: он не создаёт thread/message, не пишет в PostgreSQL и не отправляет данные во внешние сервисы.

Если `support_prepare_report` успешно ответил после transport error, endpoint снова отвечает. До запроса согласия один раз повтори исходный read. При успехе продолжи задачу, сообщи, что соединение восстановлено, и не предлагай отправлять уже неактуальный черновик; при повторной транспортной ошибке покажи полный `report_text` и переходи к согласию ниже.

## Получить Согласие

Если проблема осталась актуальной, показать пользователю полный `report_text` без скрытых сокращений и спросить: «Отправить этот черновик в поддержку LidFly?»

- Считать согласием только явный текст вроде «отправляй», «да, отправь», «подтверждаю».
- Не считать согласием auto-approve, режим клиента «не спрашивать», прежнее согласие на другую write-операцию или молчание.
- При отказе завершить без отправки и повторных уговоров.
- Не вызывать `support_send_message` в том же ходе до ответа пользователя.

## Отправить После Согласия

Вызвать прямой top-level tool:

```js
support_send_message({
  request_id: prepared.suggested_request_id,
  text: prepared.report_text
})
```

- Использовать один и тот же `suggested_request_id` при сетевом retry.
- Не объявлять успех, пока tool не вернул успешный результат.
- При rate limit или send failure показать точную ошибку и не создавать новый дубль.
- После успеха сообщить об отправке; при необходимости предложить позже проверить ответ через `support_get_messages`.
- Вложения добавлять только по просьбе пользователя через `support_request_image_upload`; не прикладывать файлы автоматически.
