# Current Project Context

## Current Phase
Owner MVP Phase 5: dish editor and customisation setup

## Current Feature
Build the first customer-facing Hawker home page with table context, natural-language search entry, featured dishes, stall discovery, and mobile bottom navigation. The search interaction remains fully on the home screen, and a dedicated menu page now exists for browsing the broader hawker offering by category.

## Completed
- Next.js App Router foundation initialized
- Supabase schema and seed data created
- Deterministic search API implemented and validated
- OpenRouter AI intent parsing layered behind Zod validation
- Mobile-first Apple-inspired search and results experience designed
- Light mode is the supported account-settings appearance
- Multi-stall cart model added with grouped merchant totals and checkout summary
- Cart logic covered by TypeScript test cases
- Customer home page implemented with premium mobile-first layout and navigation
- Inline search flow implemented on the main home page; `/search` route removed to avoid unnecessary navigation
- Dedicated `/menu` route implemented with category cards, hawker-wide browsing, and logo-based category cues
- Owner mode now opens a protected `/owner` dashboard from the profile toggle
- Owner orders are grouped into active/completed views and support persisted status progression
- Owner menu supports adding dishes and toggling availability with local persistence
- Owner routes use a separate four-tab bottom navigation: Dashboard, Orders, Menu, and Profile
- Owner menu entries open dedicated dish editor pages with photo selection and large, egg, and spicy-level customisation settings

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
- Password recovery depends on Supabase Auth email configuration
- Owner order workflow and menu management are the next owner MVP phases
- Production credentials are still required for live Supabase/OpenRouter operations

## Next Task
Owner MVP baseline is complete; replace local persistence with Supabase-backed merchant data when the owner schema and merchant authorization are defined. Customer-facing customisation rendering should consume merchant-configured options when the persistent menu schema is introduced.
