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
3. Install dependencies:
   - `npm install`
4. Start the app:
   - `npm run dev`

## Production checks

Before shipping, run:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:env`

## Search APIs

- `GET /api/search?maxPrice=15&vegetarian=true&limit=5`
- `POST /api/search` with JSON payloads
- `POST /api/search-intent` with `{ "query": "vegetarian under RM15" }`
- `GET /api/health`

## Deployment notes

- This app is configured with `output: 'standalone'` for deployment-friendly builds.
- The system is designed to fail closed when required environment variables are missing.
- If Supabase credentials are unavailable, the app falls back to a deterministic internal fallback dataset so the UI still loads.
- OpenRouter is required for AI-powered natural-language parsing.

## Supabase schema

Raw SQL migrations live in `supabase/migrations/` and seed data in `supabase/seed/`.
