# Task Tracker

## In Progress

### Customer Notifications Feature (WhatsApp / SMS / Email)
- [ ] Add `preferred_channel` to Customer entity + `JobUpdate` entity
- [ ] Install `twilio` and `resend` packages
- [ ] Create backend updates module (service, controller, notification service)
- [ ] Register updates module in `app.module.ts`
- [ ] Update customer DTO + `schema.sql`
- [ ] Add env vars to `.env.development`
- [ ] Add `JobUpdate` interface + `preferred_channel` to frontend models
- [ ] Create frontend updates service
- [ ] Add Updates tab to job-detail component
- [ ] Add `preferred_channel` to customer form

---

## Up Next

### High Priority
- [ ] **New Job Form** — frontend form to create a job (customer selector, vehicle selector, description, dates)
- [ ] **New Customer Form** — frontend form to create a customer (name, email, phone, address)
- [ ] **New Vehicle Form** — add vehicle to a customer from customer detail page

### Medium Priority
- [ ] **Edit Job** — ability to update job description, notes, dates
- [ ] **Edit Customer** — ability to update customer details
- [ ] **Vehicle Management** — edit and delete vehicles from customer detail
- [ ] **Invoice from Job** — button on job detail to create invoice pre-filled with job/customer

### Low Priority
- [ ] **Overdue Invoice Cron** — automatically mark sent invoices as overdue past due date
- [ ] **Dark/Light Theme Toggle**
- [ ] **Search Jobs** — filter jobs by customer name or description
- [ ] **Dashboard** — summary stats on home page (open jobs, outstanding invoices, etc.)
- [ ] **Photo Captions** — UI for editing photo captions on job detail

---

## Completed
- [x] PostgreSQL schema
- [x] NestJS backend (auth, customers, jobs, photos, invoices)
- [x] Angular frontend (shell, login, jobs, customers, invoices, portal)
- [x] Customer portal (public token-based page)
- [x] Deploy backend to Railway
- [x] Deploy frontend to Vercel
- [x] Connect frontend to backend (CORS, environment URLs)
