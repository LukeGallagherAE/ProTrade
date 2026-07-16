# ProTrade

A full-featured trade services management platform — the Tradify/ServiceM8 alternative you own.

## Features

- **Dashboard** — Live stats: active jobs, revenue collected, outstanding invoices, upcoming schedule
- **Jobs** — Full job lifecycle management (Pending → Scheduled → In Progress → Completed → Invoiced)
- **Clients** — Customer database with contact info, job/quote/invoice history
- **Quotes** — Line-item quotes with GST, status tracking, convert-to-invoice
- **Invoices** — Line-item invoices with GST, mark-as-sent/paid, overdue tracking
- **Schedule** — Monthly calendar view with day-detail panel
- **Team** — Staff management with roles (Admin / Manager / Staff)
- **Settings** — Business details, tax defaults, payment terms

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + Radix UI
- **Prisma** ORM with SQLite (swap to PostgreSQL for production)
- **NextAuth v5** (credentials-based auth)
- **React Hook Form** + Zod validation
- **date-fns** for calendar logic

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env — add your AUTH_SECRET (generate with: openssl rand -base64 32)

# 3. Set up the database
npm run db:push

# 4. Seed demo data
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Login

| Email | Password | Role |
|-------|----------|------|
| admin@protrade.com.au | password123 | Admin |
| manager@protrade.com.au | password123 | Manager |
| staff@protrade.com.au | password123 | Staff |

## Database

For production, switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma` — change `provider = "sqlite"` to `provider = "postgresql"`
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run `npm run db:push`
