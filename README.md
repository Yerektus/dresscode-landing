# AI Try-On Next.js

Next.js версия клиента `ai_tryon` с полным переносом ключевой логики Flutter:
- auth (email/password + Google id_token)
- JWT + refresh
- AI try-on multipart flow
- billing packages + checkout + payment polling
- локальный профиль и гардероб

## Стек

- Next.js App Router + TypeScript
- Tailwind CSS
- Zustand
- React Query
- Axios
- React Hook Form + Zod
- Sonner

## Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

## Роуты

- `/` — hero-лендинг
- `/auth/sign-in` — авторизация
- `/app` — рабочий экран примерки
- `/app/try-on` — legacy-редирект на `/app`
- `/payment/success` — callback успешной оплаты
- `/payment/cancel` — callback отмены оплаты

## Backend интеграция

Ожидаемые endpoint’ы backend (`aitryon-core-api`):

- `POST /api/v1/auth/register|login|google|refresh|logout`
- `GET /api/v1/me`
- `POST /api/v1/try-on/analyze`
- `GET /api/v1/billing/packages|balance|payments/{id}`
- `POST /api/v1/billing/checkout`

## Ограничения localStorage

Фото пользователя и вещей хранятся в data-uri, поэтому при большом количестве/размере изображений возможно переполнение localStorage (`QuotaExceededError`).

В клиенте есть обработка этой ошибки с уведомлением пользователю, но рекомендуется:
- использовать оптимизированные изображения,
- удалять старые элементы гардероба при необходимости.

## Тесты

```bash
npm run test
```

Покрываются:
- unit: профиль, data mapping, single-flight helper
- component: auth form, profile form
- integration: сценарий обработки 402 в try-on store
