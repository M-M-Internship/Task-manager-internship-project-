# Task Manager Web App

Task Manager Web App is a React + Vite project with Supabase-backed authentication and task storage. Users can sign up with email and password, log in with saved credentials, or request a one-time password by email. After sign-in, every task is scoped to the current Supabase user instead of being shared anonymously.

## Install and Run

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run build
npm run lint
```

## Supabase Setup

1. Add your project credentials in a `.env` file:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

You can also use `VITE_SUPABASE_ANON_KEY` if that matches your existing setup.

2. Open the Supabase SQL editor and run `supabase/tasks.sql`.

3. In Supabase Auth, keep the Email provider enabled so password login and signup work.

4. For OTP codes, update the email template to include the OTP token. If you keep magic links enabled, the app can still sign users in from the emailed link.

5. If you already created anonymous tasks before this auth update, those rows will not appear for signed-in users until you manually assign a `user_id` or recreate them.

## Current Features

- Email/password signup and login with Supabase Auth
- Email OTP request and verification flow
- User-specific task CRUD with Supabase row-level security
- Task detail dialog, editing, filtering, and snackbar feedback


