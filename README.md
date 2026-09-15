# Hawker Menu Intelligence

A production-minded Next.js application for Malaysian hawker food discovery. The project uses:

- Next.js App Router
- Tailwind CSS
- TypeScript
- Supabase PostgreSQL
- Vercel AI SDK with OpenRouter
- Zod validation

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your real values:
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (for local OAuth redirects)
3. Install dependencies:
   - `npm install`
4. Start the app:
   - `npm run dev`

## Authentication setup

This app uses Supabase Auth for email/password authentication and Google OAuth.

### Supabase dashboard configuration

1. Create a Supabase project.
2. Open Authentication > URL Configuration.
3. Set the **Site URL** in Supabase:
   - For production, set to your production URL: `https://hawker-ai-one.vercel.app` (or your custom domain).
   - If developing locally, you can use `http://localhost:3000`.
4. Add **Redirect URLs** in Supabase (under Authentication > URL Configuration):
   - `http://localhost:3000/**`
   - `https://hawker-ai-one.vercel.app/**`
   - `https://*.vercel.app/**` (for preview deployments)
   - `https://<your-custom-domain>/**`
   > **Note:** If a redirect URL is requested that is NOT in the Supabase Redirect URLs whitelist, Supabase automatically falls back to the **Site URL**. Ensure both your production domain and localhost are listed.
5. Open Authentication > Providers > Google.
6. Enable Google sign-in.
7. Add your Google OAuth client ID and client secret from the Google Cloud Console.
8. Set the redirect URI in Google Cloud Console to your Supabase callback URL:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
9. Open Authentication > Settings and ensure email sign-in is enabled for email/password sign-up and login.
10. Enable the password recovery flow for email reset links.

### Google OAuth details

Supabase handles the OAuth exchange server-side. The frontend only calls:

- `supabase.auth.signInWithOAuth({ provider: 'google' })`

The application is ready to work once the developer adds the Google OAuth credentials to the Supabase dashboard and populates the environment variables.

### Auth note

The authenticated user object is the source of truth for user identity. We intentionally do not duplicate Supabase auth data into a separate user table unless a future requirement requires it.

## Production checks

Before shipping, run:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:env`

## API Reference

Comprehensive endpoint documentation is available in [`docs/endpoints.md`](docs/endpoints.md), covering:

- **System**: `GET /api/health`
- **Customer Discovery**: `GET /api/search`, `POST /api/search`, `POST /api/search-intent`, `GET /api/outlets`
- **Customer Orders & Sessions**: `POST /api/table-sessions`, `POST /api/orders`, `GET /api/orders`
- **User Identity & Roles**: `GET /api/user/roles`
- **Stall Operations**: `GET/POST /api/owner/dishes`, `PATCH/POST /api/owner/dishes/[id]`, `GET/PATCH /api/owner/orders`, `POST /api/owner/orders/[id]/refund`, `GET/POST /api/owner/booths/join`
- **Food Hall Operations**: `GET/POST /api/owner/shops`, `GET/PATCH /api/owner/shops/[id]`, `POST/PATCH /api/owner/booths`, `POST /api/owner/booths/[id]/invite`, `GET/DELETE /api/owner/booths/[id]/members`, `GET /api/owner/analytics`

## Deployment notes

- This app is configured with `output: 'standalone'` for deployment-friendly builds.
- The system is designed to fail closed when required environment variables are missing.
- If Supabase credentials are unavailable, the app falls back to a deterministic internal fallback dataset so the UI still loads.
- OpenRouter is required for AI-powered natural-language parsing.

## Supabase schema

Raw SQL migrations live in `supabase/migrations/` and seed data in `supabase/seed/`.
