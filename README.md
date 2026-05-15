# ProTrade

A full-featured field service management platform for trade businesses — built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard** — Live stats: active jobs, revenue, outstanding invoices, upcoming schedule
- **Jobs** — Create, track, and manage jobs with status workflow, priority, team assignment, time entries and materials
- **Customers** — Full CRM with contact history, jobs, quotes and invoices per customer
- **Quotes** — Create professional quotes with line items, GST calculation, and status tracking
- **Invoices** — Generate invoices with line items, mark as paid, track overdue
- **Schedule** — Monthly calendar view of all scheduled jobs with day detail panel
- **Team** — Manage team members with roles, trades, hourly rates and status

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- JSON file-based data store (no external DB required)
- Lucide React icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seed data is automatically created on first run — 5 customers, 6 jobs, 2 quotes, 3 invoices and 4 team members to explore the platform immediately.

## Data Storage

All data is stored in `data/db.json` (created automatically on first run). For production use, swap the `lib/db.ts` file-system layer for a real database (Postgres, SQLite, etc.).
