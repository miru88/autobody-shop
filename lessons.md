# Lessons Learned

A log of mistakes, gotchas, and hard-won knowledge. Read this before making changes.

---

## Angular

### Missing workspace files
`ng build` fails with "This command is not available when running the Angular CLI outside a workspace" if any of these are missing:
- `frontend/angular.json` — the most critical, defines the entire build
- `frontend/tsconfig.app.json` — TypeScript config for the build
- `frontend/src/index.html` — HTML entry point
- `frontend/src/assets/` — must exist (add `.gitkeep` if empty)

**Always generate all four when scaffolding a new Angular project.**

### Standalone components — pipes must be explicitly imported
Every pipe used in a template must be in the component's `imports` array. There is no NgModule fallback.
```typescript
// If using | titlecase in template:
import { TitleCasePipe } from '@angular/common';
@Component({ imports: [TitleCasePipe] })
```
`TitleCasePipe`, `DatePipe`, `CurrencyPipe`, `AsyncPipe` are all commonly forgotten.

### @ symbol in templates
Angular 17 treats `@` as a block syntax character. Escape it in HTML:
```html
info&#64;example.com   ✅
info@example.com        ❌ causes "Incomplete block" error
```

### @for track expression
Cannot use `$index` directly in `track`:
```html
@for (item of items; track item; let i = $index) { }   ✅
@for (item of items; track $index) { }                  ❌
```

### Production environment not picked up by Vercel
If the frontend is hitting `localhost` in production, Vercel is likely building with the dev config. Fix:
- Go to Vercel → Settings → Build Command → set to `ng build --configuration production`
- Or hardcode the API URL in `environment.ts` as a temporary fix

---

## NestJS / Backend

### App must bind to 0.0.0.0
Without this, the app only listens on localhost inside Docker/Railway containers and returns 502:
```typescript
await app.listen(port, '0.0.0.0');  ✅
await app.listen(port);              ❌ (invisible to Railway proxy)
```

### Railway injects its own PORT — can conflict with DB port
Railway injects `PORT` into all services. If the Postgres service variables bleed into the backend service, `PORT` can end up as `5432`. Always explicitly set `PORT=3000` in backend service variables, or hardcode in code.

### TypeORM connection — use individual variables not DATABASE_URL
Our `app.module.ts` uses individual `DB_HOST`, `DB_PORT` etc. variables, not a connection string. Don't set `DATABASE_URL` — it won't be used and causes confusion.

### CORS — set origin to FRONTEND_URL
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
});
```
Must match the exact Vercel URL (no trailing slash). Update `FRONTEND_URL` in Railway when the Vercel URL changes.

---

## Deployment

### Railway — Dockerfile is the most reliable approach
nixpacks.toml and start.sh both had issues with Node not being found. A `Dockerfile` at the repo root is the most reliable way to deploy a monorepo backend to Railway:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Vercel — Root Directory must be set to `frontend`
Without this, Vercel tries to build from the repo root and can't find Angular.

### First user must be created via API call
The database starts empty. Use curl or Hoppscotch to POST to `/auth/register` to create the first owner account before trying to log in.
