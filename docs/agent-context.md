# Current Project Context

## Current Phase
Phase 5: customer order flow and multi-stall checkout

## Current Feature
Multi-stall cart and mock checkout summary for the customer ordering loop.

## Completed
- Next.js App Router foundation initialized
- Supabase schema and seed data created
- Deterministic search API implemented and validated
- OpenRouter AI intent parsing layered behind Zod validation
- Mobile-first Apple-inspired search and results experience designed
- Light/dark mode support introduced
- Multi-stall cart model added with grouped merchant totals and checkout summary
- Cart logic covered by TypeScript test cases

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
- Cart state is intentionally client-side in this milestone so the UI can validate the order flow before persistent backend storage

## Known Issues
- No persistent order storage or auth layer yet; cart state is local to the browser session
- Merchant dashboard, QR sessions, and admin flows remain future milestones
- Production credentials are still required for live Supabase/OpenRouter operations

## Next Task
Implement customer order tracking and merchant acceptance flow as the next milestone after the cart/checkout loop.
