# Flora Skincare

A full-stack booking and clinic-management platform for a skincare studio — a public marketing/booking site for customers plus a full admin dashboard for the clinic manager, built with Next.js.

## Features

https://flora-skincare.vercel.app/
https://flora-skincare.vercel.app/admin/login

**Public site**
- Home, About, Services, and Contact pages with a custom purple/glass visual design
- Service catalog pulled live from the database
- Appointment booking flow (service, date, time slot)
- Contact form
- Customer sign up / login, with email + OTP password reset

**Admin dashboard** (role-gated, separate from the public site)
- Revenue, bookings, and status overview with charts
- Appointment management (create, edit, filter by date, delete)
- Service management (create, edit, activate/deactivate, mark members-only)
- Customer list with lifetime appointments and spend
- Expense/tip tracking
- Report generation (weekly/monthly/yearly/custom range) with history and PDF export
- Manager password change

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- [Drizzle ORM](https://orm.drizzle.team) over [Neon](https://neon.tech) serverless Postgres (HTTP driver)
- Session auth with `bcryptjs` + `jsonwebtoken`, OTP email flow via `nodemailer`
- `pdf-lib` for generated report PDFs
- `lucide-react` icons, `date-fns`

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run db:push        # sync the schema to your database
npm run seed            # optional: seed a demo admin + sample services
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin dashboard (unlisted — there's no public link to it by design).

### Environment variables

| Variable | Description |
| --- | --- |
| `NEON_DB_URL` | Postgres connection string (Neon) |
| `JWT_SECRET` | Secret used to sign session tokens |
| `EMAIL_USER` | SMTP account used to send OTP/reset emails |
| `EMAIL_PASS` | SMTP account password/app password |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build and start |
| `npm run db:push` | Push the Drizzle schema to the database |
| `npm run db:generate` | Generate a new migration |
| `npm run seed` | Seed a demo admin account and starter services |
| `npm run lint` | Run ESLint |
