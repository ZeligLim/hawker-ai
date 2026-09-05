# Current Project Context

## Current Phase
Phase 4: customer home experience and search entry flow

## Current Feature
Build the first customer-facing Hawker home page with table context, natural-language search entry, featured dishes, stall discovery, and mobile bottom navigation.

## Completed
- Next.js App Router foundation initialized
- Supabase schema and seed data created
- Deterministic search API implemented and validated
- OpenRouter AI intent parsing layered behind Zod validation
- Mobile-first Apple-inspired search and results experience designed
- Light/dark mode support introduced
- Multi-stall cart model added with grouped merchant totals and checkout summary
- Cart logic covered by TypeScript test cases
- Customer home page implemented with premium mobile-first layout and navigation

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers and deterministic `SearchService`
- Database: Supabase/PostgreSQL with raw SQL migrations and fallback data paths
- Security: AI never touches SQL or database access directly

## Important Decisions
- AI output is validated with Zod before it can affect backend logic
- Search remains deterministic and database-backed when credentials are present
- Fallback data keeps the app usable when Supabase or OpenRouter credentials are absent
- Cart state remains client-side for this milestone while the customer-facing product experience is refined
- Home and search flow prioritize a premium consumer-app feel over dashboard-like layouts

## Known Issues
- No persistent order storage or auth layer yet; cart state is local to the browser session
- Merchant dashboard, QR sessions, and admin flows remain future milestones
- Production credentials are still required for live Supabase/OpenRouter operations

## Next Task
Implement the dish detail and add-to-order flow that follows the customer home page and search experience.
