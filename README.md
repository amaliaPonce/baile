# Class Booking System

Full-stack booking system for a private tutor built with Next.js 14 App Router, Supabase, Resend, FullCalendar, Tailwind CSS, and Zod.

## Stack

- Next.js 14 + TypeScript
- Supabase Postgres, Auth, and Realtime
- FullCalendar
- Resend transactional email
- Tailwind CSS
- Zod

## Setup

1. Clone the repo.
2. Create a Supabase project.
3. Open the Supabase SQL editor and run [`supabase/migrations/001_class_booking_system.sql`](/Users/Amalia/Desktop/C_/clasesBaile/supabase/migrations/001_class_booking_system.sql).
4. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

5. Install dependencies:

```bash
npm install
```

6. Run the app:

```bash
npm run dev
```

7. Deploy to Vercel. Add the same environment variables in the Vercel project settings.

## Auth Flow

- Professors sign up or log in with email and password on `/login`.
- On first signup, the app creates a profile row automatically.
- Protected dashboard routes redirect to `/login` when there is no Supabase session.

## Routes

- `/login`
- `/dashboard`
- `/dashboard/availability`
- `/dashboard/bookings`
- `/book/[slug]`
- `/book/[slug]/confirm`

## Notes

- Resend uses `onboarding@resend.dev` as the sender by default. Replace it in [`lib/resend.ts`](/Users/Amalia/Desktop/C_/clasesBaile/lib/resend.ts) if you have a verified domain.
- Public booking depends on the SQL policies in the migration, including public profile lookup by `slug`.
- This workspace is currently on Node `18.16.1`. Next `14.2.30` requires `18.17.0` or newer, so upgrade Node before local production builds.
