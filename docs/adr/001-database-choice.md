# ADR 001 — Database Choice: PostgreSQL

## Status
Accepted

## Context
Needed a relational database to store customers, vehicles, jobs, photos, and invoices with proper relationships and constraints.

## Decision
PostgreSQL via Railway's managed Postgres service.

## Reasons
- Relational data model fits the domain well (customers → vehicles → jobs → photos/invoices)
- Generated columns for `line_total` (quantity × unit_price) keep data consistent
- `updated_at` triggers handle audit timestamps automatically
- Railway provides managed Postgres with zero config
- TypeORM has excellent Postgres support

## Consequences
- TypeORM `synchronize: true` used in development for schema changes — must be `false` in production
- UUID primary keys used throughout — slightly more overhead than integers but better for distributed systems and portal token generation
