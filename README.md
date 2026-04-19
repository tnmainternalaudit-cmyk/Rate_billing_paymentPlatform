# TNMA Revenue Billing & Payment Platform

Production-grade monorepo scaffold for **Tano North Municipal Assembly** revenue operations across Property Rate, Business Operating Permit, and Market Store Rent.

## Architecture

```text
┌───────────────────────────────────────────────────────────┐
│ Desktop (Electron + React)   Mobile (React Native)       │
│ - Staff workflows             - Field offline collection  │
└───────────────┬───────────────────────────────┬───────────┘
                │ JWT/REST                       │ Sync API
                └───────────────┬────────────────┘
                        Backend API (NestJS)
                 Auth | Ratepayers | Billing | Payments
             Notifications | Reports | Sync | Audit | PDF
                                │
                            Prisma ORM
                                │
                           PostgreSQL 15
```

Swagger: `http://localhost:3000/api/docs`

## Quick Start

### 1) Infrastructure

```bash
docker compose up -d postgres pgadmin
cp .env.example .env
```

### 2) Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run start:dev
```

### 3) Desktop (Windows .exe app)

```bash
cd desktop
npm install
npm run dev
npm run dist:win
```

Installer output: `desktop/release/TNMA-Revenue-Setup-x.y.z.exe`

### 4) Mobile (Android)

```bash
cd mobile
npm install
npx react-native run-android
# or
cd android && ./gradlew assembleDebug
```

## Environment Variables

See `.env.example` for full list. Core values:

- `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `SMS_PROVIDER`, `MNOTIFY_*`, `HUBTEL_*`, `ARKESEL_*`
- `SMTP_*`
- `MOMO_*`, `TELECEL_CASH_*`, `AIRTELTIGO_MONEY_*`

## Dev credentials (development only)

- Email: `admin@tnma.gov.gh`
- Password: `Admin@123`

## Screenshots

- Desktop Login: _placeholder_
- Desktop Dashboard: _placeholder_
- Mobile Sync Screen: _placeholder_

## Docs

- `docs/architecture.md`
- `docs/api.md`
- `docs/database-schema.md`
- `docs/deployment.md`
- `docs/user-guide.md`
