# API Reference

See Swagger at `/api/docs` for complete endpoint schemas.

Core endpoints:
- `POST /auth/login`, `POST /auth/refresh`
- `GET|POST|PATCH|DELETE /ratepayers`
- `POST /ratepayers/import`, `GET /ratepayers/export`
- `POST /billing/generate`
- `GET /bills`, `GET /bills/:id`, `POST /bills/:id/cancel`
- `POST /payments`, `POST /payments/:id/reverse`
- `GET /reports/collections`, `/reports/arrears`, `/reports/officer-performance`
- `POST /sync/pull`, `POST /sync/push`
- `POST /notifications/test-sms`, `POST /notifications/test-email`
