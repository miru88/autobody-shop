# AutoBody Shop — Claude Context

## What this project is
A full-stack web app for managing an autobody repair shop. Built for a real shop. Handles customers, jobs, progress photos, invoices, and a public customer portal.

## Repo
- GitHub: https://github.com/miru88/autobody-shop
- Branch: `main` — deploys automatically to Railway (backend) and Vercel (frontend)

## Live URLs
- Frontend: https://autobody-shop-p9ci.vercel.app
- Backend API: https://autobody-shop-production.up.railway.app
- Database: PostgreSQL on Railway (internal: postgres.railway.internal)

## Stack
| Layer | Tech |
|---|---|
| Frontend | Angular 17 · Angular Material · Tailwind CSS |
| Backend | NestJS · TypeORM |
| Database | PostgreSQL (Railway) |
| Storage | AWS S3 |
| Invoicing | PDFKit |
| Auth | JWT (Passport + bcrypt) |
| Hosting | Railway (backend + DB) · Vercel (frontend) |

## Running locally

### Backend
```bash
cd backend
cp .env.example .env   # fill in values
npm install
npm run start:dev      # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm start              # http://localhost:4200
```

## Key conventions
- All TypeORM entities live in `backend/src/entities.ts`
- All TypeScript interfaces live in `frontend/src/app/core/models/models.ts`
- Angular components are standalone — every pipe/module must be explicitly imported
- JWT auth uses `@Public()`, `@Roles()`, `@CurrentUser()` decorators
- Angular signals used throughout for reactive state

## Always read next
- `tasks/todo.md` — what's currently being worked on
- `docs/ARCHITECTURE.md` — system design and API routes
- `lessons.md` — mistakes and gotchas already discovered
