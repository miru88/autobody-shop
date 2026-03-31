# Task Tracker

## In Progress
_Nothing currently in progress_

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
- [ ] **Email Notifications** — notify customer when job status changes (Nodemailer / SendGrid)

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
