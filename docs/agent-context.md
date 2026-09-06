# Current Project Context

## Current Phase
Phase 3: multi-tenant shop membership and restaurant-scoped ownership

## Current Feature
Add the shop-level membership model required for the SaaS architecture: `restaurant_memberships` sits alongside the existing booth-scoped `merchant_memberships`, and the shop-owner dashboard loads real restaurant + booth access from the authenticated backend before broader multi-tenant flows are expanded.

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
- Owner menu supports adding dishes and toggling availability through authenticated APIs, with local fallback when no session is available
- Owner routes use a separate four-tab bottom navigation: Dashboard, Orders, Menu, and Profile
- Owner menu entries open dedicated dish editor pages with photo selection and large, egg, and spicy-level customisation settings
- Dish customisations are owner-defined, capped at 10 options per dish, with extra prices and no preset option labels
- Dish editors support vegetarian metadata, descriptions, and comma-separated search tags for future AI-assisted discovery
- Supabase migration `002_backend_foundation.sql` adds dish metadata, merchant memberships, table sessions, parent orders, merchant sub-orders, order items, indexes, and RLS policies
- Owner pages reserve additional bottom space so the fixed four-tab navigation does not cover content
- Owner dish editor now creates/updates dishes through authenticated APIs and uploads selected images through Supabase Storage
- Authenticated owner dish APIs are available at `/api/owner/dishes`; order creation uses the atomic `create_order_with_items` RPC through `/api/orders`
- Table session creation/retrieval is available at `/api/table-sessions`; merchant order status updates are available at `/api/owner/orders/[id]`
- Dish image uploads use the Supabase `dish-images` bucket and `/api/owner/dishes/[id]/image`, with merchant-scoped storage policies
- Customer checkout now calls `/api/orders` with the authenticated Supabase access token and clears the cart only after the atomic order RPC succeeds
- Owner order retrieval is available at `/api/owner/orders`, scoped to every stall membership belonging to the authenticated user
- Owner orders now load from `/api/owner/orders` and advance status through `/api/owner/orders/[id]`
- `lib/database.types.ts` provides checked-in Supabase `Database` types; the linked remote project currently has no applied schema, so `supabase gen types --linked` returns an empty schema
- `merchant_handles` migration and seed data provide public example handles: `@pakmat_nasilemak`, `@currymecorner`, and `@char_kwayteowstall`
- Restored the profile tab in the regular customer bottom navigation and the standalone booth-owner navigation so the user can access profile/account settings again in both app shells

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers and deterministic `SearchService`
- Database: Supabase/PostgreSQL with raw SQL migrations, generated-style TypeScript types, RLS, and fallback data paths
- Security: AI never touches SQL or database access directly

## Important Decisions
- AI output is validated with Zod before it can affect backend logic
- Search remains deterministic and database-backed when credentials are present
- Fallback data keeps the app usable when Supabase or OpenRouter credentials are absent
- Cart state remains client-side for this milestone while the customer-facing product experience is refined
- Home and search flow prioritize a premium consumer-app feel over dashboard-like layouts

## Known Issues
- Password recovery depends on Supabase Auth email configuration
- Merchant membership provisioning is still a controlled admin follow-up rather than a public customer flow
- Production credentials are still required for live Supabase/OpenRouter operations
- Supabase deployment configuration must be provided in Vercel as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service-role keys are never exposed in client-side environment variables

## Next Task
Next: provision merchant memberships through a controlled admin flow and then validate the complete customer/merchant lifecycle end-to-end.
