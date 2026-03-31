# Architecture

## System Overview

```
Browser
  │
  ├── Vercel (Angular SPA)
  │     └── https://autobody-shop-p9ci.vercel.app
  │
  └── Railway (NestJS API)
        └── https://autobody-shop-production.up.railway.app
              │
              ├── PostgreSQL (Railway internal)
              │     └── postgres.railway.internal:5432
              │
              └── AWS S3
                    └── Photo + PDF storage
```

---

## Database Schema

Tables: `users`, `customers`, `vehicles`, `jobs`, `photos`, `invoices`, `invoice_line_items`

### Key design decisions
- UUIDs as primary keys throughout
- `jobs.portal_token` — auto-generated UUID for public portal link
- `photos.visible_to_customer` — shop controls what customers see
- `invoice_line_items.line_total` — generated column (quantity × unit_price)
- `updated_at` — auto-updated via Postgres trigger on all tables

---

## Backend Structure

```
backend/src/
├── entities.ts               # All TypeORM entities
├── app.module.ts             # Root module, global JWT + Roles guards
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts       # register, login, getProfile
│   ├── auth.controller.ts
│   ├── strategies/jwt.strategy.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── guards/roles.guard.ts
│   └── decorators/
│       ├── roles.decorator.ts
│       ├── public.decorator.ts
│       └── current-user.decorator.ts
├── customers/
├── jobs/
├── photos/
│   └── s3.service.ts
└── invoices/
    ├── invoice-number.service.ts
    └── pdf.service.ts
```

---

## API Routes

```
PUBLIC (no token):
  POST  /auth/login
  POST  /auth/register
  GET   /jobs/portal/:token

AUTHENTICATED (staff + owner):
  GET   /auth/me
  GET/POST/PATCH/DELETE  /customers
  GET/POST/PATCH/DELETE  /jobs
  PATCH /jobs/:id/status
  GET/POST               /jobs/:jobId/photos
  PATCH /jobs/:jobId/photos/:id/visibility
  PATCH /jobs/:jobId/photos/:id/caption
  GET/POST               /invoices
  GET   /invoices/:id
  GET   /invoices/:id/pdf
  PATCH /invoices/:id/send
  PATCH /invoices/:id/paid

OWNER ONLY:
  DELETE /customers/:id
  DELETE /jobs/:id
  DELETE /jobs/:jobId/photos/:id
```

---

## Frontend Structure

```
frontend/src/app/
├── core/
│   ├── models/models.ts           # All TS interfaces
│   ├── services/
│   │   ├── api.service.ts         # Base HTTP wrapper
│   │   ├── auth.service.ts        # Signals-based auth state
│   │   ├── customers.service.ts
│   │   ├── jobs.service.ts
│   │   ├── photos.service.ts
│   │   └── invoices.service.ts
│   ├── guards/auth.guard.ts
│   └── interceptors/jwt.interceptor.ts
├── layout/shell/                  # Sidenav + toolbar
└── features/
    ├── auth/login/
    ├── jobs/jobs-list/ + job-detail/
    ├── customers/customers-list/ + customer-detail/
    ├── invoices/invoices-list/ + invoice-detail/ + invoice-form/
    └── portal/                    # Public customer portal
```

---

## Environment Variables

### Backend (Railway)
```
NODE_ENV=production
PORT=3000
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_USER=postgres
DB_PASS=<secret>
DB_NAME=railway
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=<bucket-name>
FRONTEND_URL=https://autobody-shop-p9ci.vercel.app
```

### Frontend
Built into bundle via `environment.prod.ts`:
```
apiUrl=https://autobody-shop-production.up.railway.app
```
