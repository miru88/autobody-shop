# Project Specification

## Overview
A mobile-friendly web app for managing an autobody repair shop. Built for a real shop (owner's family business).

## Users

### Shop Staff (role: `staff`)
- View and update jobs
- Upload progress photos
- Create and manage invoices
- View customer and vehicle history

### Shop Owner (role: `owner`)
- Everything staff can do
- Delete jobs, customers, photos
- Full admin access

### Customers (no account)
- Access their job via a unique portal link (no login required)
- View job status, progress photos, and invoice

---

## Core Features

### Jobs
- Each job has a customer, optional vehicle, description, notes, and status
- 7-stage status pipeline: Received → Assessment → In Progress → Paint → Quality Check → Ready → Collected
- Each job gets a unique `portal_token` UUID for the customer portal link
- Staff can upload multiple progress photos per job
- Each photo can be toggled visible/hidden to the customer

### Customers & Vehicles
- Customers have name, email, phone, address
- Each customer can have multiple vehicles
- Vehicle: make, model, year, colour, registration, VIN
- Full job history visible on customer detail page

### Invoices
- Created against a job
- Dynamic line items (description, quantity, unit price)
- Auto-calculates subtotal, VAT (20% default), total
- Auto-generated invoice number: `INV-YYYY-XXXX`
- Statuses: Draft → Sent → Paid (or Overdue)
- PDF generation via PDFKit — downloadable, branded

### Customer Portal
- Public URL: `/portal/:token`
- No login required
- Shows: status banner, progress timeline, visible photos (with lightbox), invoice summary
- Unique link per job — shareable via SMS/email

### Auth
- JWT-based, 7-day expiry
- Roles: `owner` and `staff`
- Global guard with `@Public()` escape hatch for open routes

---

## Non-Goals (for now)
- Customer accounts / login
- Online payments
- Multi-location / multi-shop
- Native mobile app
