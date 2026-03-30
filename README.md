# AutoBody Shop Manager

A full-stack web app for managing an autobody repair shop — customers, jobs, progress photos, invoices, and a public customer portal.

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | Angular 17 · Angular Material · Tailwind  |
| Backend   | NestJS · TypeORM                          |
| Database  | PostgreSQL                                |
| Storage   | AWS S3                                    |
| Invoicing | PDFKit                                    |
| Auth      | JWT (Passport + bcrypt)                   |
| Hosting   | Railway (API + DB) · Vercel (frontend)    |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- AWS S3 bucket (or use local mock for dev)

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE autobody;"
psql -U postgres -d autobody -f schema.sql
```

> Or let TypeORM auto-sync on first run (`synchronize: true` in dev mode).

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run start:dev
# API running at http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
# App running at http://localhost:4200
```

---

## Features

- **Jobs** — create and track repair jobs through a 7-stage status pipeline
- **Customer Portal** — shareable `/portal/:token` link per job; customers see status, photos, and invoice without logging in
- **Photos** — drag & drop upload, per-photo customer visibility toggle
- **Invoices** — dynamic line items, VAT calculation, PDF generation and download
- **Customers & Vehicles** — full history and vehicle management
- **JWT Auth** — owner and staff roles; global guard with `@Public()` escape hatch

---

## API Overview

```
PUBLIC
  POST  /auth/login
  POST  /auth/register
  GET   /jobs/portal/:token

AUTHENTICATED
  GET/POST/PATCH/DELETE  /customers
  GET/POST/PATCH/DELETE  /jobs
  PATCH /jobs/:id/status
  GET/POST/DELETE        /jobs/:jobId/photos
  PATCH /jobs/:jobId/photos/:id/visibility
  GET/POST               /invoices
  GET   /invoices/:id/pdf
  PATCH /invoices/:id/send
  PATCH /invoices/:id/paid

OWNER ONLY
  DELETE /customers/:id
  DELETE /jobs/:id
  DELETE /jobs/:jobId/photos/:id
```

---

## Environment Variables

See `backend/.env.example` for the full list. Key vars:

```
DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_NAME
JWT_SECRET
AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET
FRONTEND_URL
```

---

## Deployment

### Railway (Backend + DB)
1. Create a new Railway project
2. Add a PostgreSQL service
3. Add a Node.js service pointing to `backend/`
4. Set all environment variables in the Railway dashboard
5. Deploy — Railway will run `npm run start:prod`

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend/`
3. Set `NEXT_PUBLIC_API_URL` (or update `environment.prod.ts` with your Railway URL)
4. Deploy

---

## Project Structure

```
autobody/
├── schema.sql              # Raw PostgreSQL schema
├── backend/
│   └── src/
│       ├── entities.ts     # All TypeORM entities
│       ├── app.module.ts
│       ├── auth/
│       ├── customers/
│       ├── jobs/
│       ├── photos/
│       └── invoices/
└── frontend/
    └── src/app/
        ├── core/           # Models, services, guards, interceptor
        ├── layout/shell/   # Sidenav shell
        └── features/
            ├── auth/
            ├── jobs/
            ├── customers/
            ├── invoices/
            └── portal/     # Public customer portal
```

---

## Next Steps

- [ ] New job form (frontend)
- [ ] New customer form (frontend)
- [ ] Vehicle management UI
- [ ] Email notifications on status change (Nodemailer / SendGrid)
- [ ] Overdue invoice cron job
- [ ] Dark/light theme toggle
