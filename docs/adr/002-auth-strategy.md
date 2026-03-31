# ADR 002 — Auth Strategy: JWT

## Status
Accepted

## Context
Needed authentication for shop staff/owner with role-based access control. The customer portal must be accessible without any login.

## Decision
JWT (JSON Web Tokens) via Passport.js + `@nestjs/jwt`. Tokens stored in localStorage on the frontend.

## Reasons
- Stateless — no session store needed
- Works well with Railway/Vercel deployment (no sticky sessions required)
- `@Public()` decorator makes it easy to mark open routes (customer portal, login, register)
- Role-based access via `@Roles('owner')` decorator with a global RolesGuard
- 7-day expiry is appropriate for a small internal tool

## Consequences
- No token refresh mechanism — users get logged out after 7 days
- Tokens stored in localStorage — acceptable risk for an internal shop tool
- Customer portal uses `portal_token` UUID (not JWT) — simpler and shareable via SMS/email
- If JWT_SECRET is rotated, all existing sessions are invalidated
