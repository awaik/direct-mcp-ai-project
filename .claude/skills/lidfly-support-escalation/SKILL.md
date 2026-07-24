---
name: lidfly-support-escalation
description: "Безопасно диагностировать и эскалировать проблемы LidFly MCP через read-only support_prepare_report и подтверждённый support_send_message. Использовать при unexpected/internal support_hint, повторном timeout read-вызова после одного retry или отсутствии нужной возможности после широкого search_tools."
---

# LidFly Support Escalation

Подготавливать обращение про MCP только после безопасной диагностики. Никогда не отправлять его автоматически.

## Выбрать Сценарий

- `support_hint.reason=unexpected_internal_error`: перейти к подготовке отчёта.
- Первый timeout read-вызова: один раз безопасно повторить тот же read. При повторном timeout подготовить отчёт с новым incident ID.
- Timeout write-вызова: не повторять автоматически, пока инструмент или его результат не доказывает идемпотентность. Сначала проверить состояние read-инструментом; при неопределённости подготовить отчёт.
- Инструмент или возможность не найдены: повторить `search_tools({})` без `query` и `provider`. Только если широкий поиск ничего подходящего не вернул, подготовить запрос на возможность.
- Validation, mode mismatch, access denied, auth, subscription, rate limit и штатную provider API error исправлять обычным способом без предложения поддержки.

## Подготовить Черновик

1. При `support_hint` вызвать прямой top-level tool:

   ```js
   support_prepare_report({
     incident_id: support_hint.incident_id,
     tool_name: support_hint.next_arguments.tool_name,
     error: support_hint.next_arguments.error,
     user_goal: "...",
     expected_result: "...",
     attempted_steps: ["..."]
   })
   ```

2. При повторном timeout или отсутствующей возможности вызвать тот же tool без `incident_id`; сервер создаст UUID. Для отсутствующей возможности использовать `tool_name: "search_tools"` и кратко описать широкий поиск в `attempted_steps`.
3. Передавать только диагностический текст: цель, ожидаемый результат и до восьми коротких проверенных шагов. Не передавать raw arguments, токены, OAuth/API keys, пароли, seller secrets, персональные данные, содержимое файлов или локальные логи.
4. Если `redactions_count > 0`, сообщить, что секретные фрагменты автоматически скрыты.

`support_prepare_report` read-only: он не создаёт thread/message, не пишет в PostgreSQL и не отправляет данные во внешние сервисы.

## Получить Согласие

Показать пользователю полный `report_text` без скрытых сокращений и спросить: «Отправить этот черновик в поддержку LidFly?»

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
