# Current Project Context

## Current Phase
Phase 5: booth invitation and join flow

## Current Feature
Complete the booth invitation lifecycle by generating hashed invite tokens from the shop-owner app and redeeming them from a dedicated booth join flow. The app keeps the single-account architecture and relies on `restaurant_memberships` at the shop level and `merchant_memberships` for booth-level access, with a secure token redemption process that validates expiry and single-use semantics.

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
- Applied all migrations (001 through 007) and seed data to the remote Supabase database; all core tables, RLS policies, and RPCs are active
- Added defensive fallbacks in `api/owner/dishes` and `api/owner/orders` to gracefully handle schema cache timing and missing tables without crashing the application
- `merchant_handles` migration and seed data provide public example handles: `@pakmat_nasilemak`, `@currymecorner`, and `@char_kwayteowstall`
- Restored the profile tab in the regular customer bottom navigation and the standalone booth-owner navigation so the user can access profile/account settings again in both app shells
- Redesigned public landing page (`/`) with Apple design aesthetic: frosted glass navigation, cinematic hero typography, interactive Studio Display product showcase (Food Court Operator OS, Stall Kitchen Display, Diner QR Experience), problem/solution contrast, bento feature grid, interactive deterministic AI food intelligence simulation, booth invite code demo, dual operator/stall solutions, Apple-style pricing tiers, and global footer
- Refactored subscription onboarding page (`/subscribe`) to Apple-style 4-step guided setup: venue registration, interactive plan selector (Starter, Pro, Enterprise with monthly/annual discount toggle), first stall provisioning, and activation key generator with 1-click invitation copy and dashboard routing
- Added `lib/auth-redirect.ts` with contextual return routing (`resolveAuthRedirect`, `resolveUserDestination`, `saveAuthRedirect`) so users signing in return to where they came from (customer app `/home` or `/profile`, shop-owner app `/shop-owner/booths`, or booth app `/owner`) rather than hardcoded `/`
- Fixed booth menu loading (`/api/owner/dishes`) by resolving both `merchant_memberships` and `restaurant_memberships`, preventing PostgREST `.in('food_outlet_id', [])` syntax errors, auto-linking initial booths for testing, and rendering a graceful empty state in `/owner/menu`
- Applied Supabase migration `008_monetization_and_refunds.sql` supporting fair platform monetization:
  - Added `fee_payer` ('CUSTOMER' | 'MERCHANT', default 'CUSTOMER'), `platform_fee_fixed` (default RM 0.50), and `platform_fee_percent` to `food_outlets` and `restaurants`
  - Added `subtotal_amount`, `platform_fee_amount`, `total_amount`, `merchant_payout_amount`, `payment_status` ('PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED'), `refund_amount`, and `payment_intent_id` to `orders` and `merchant_orders`
  - Added `is_refunded`, `refund_amount`, and `refund_reason` to `order_items`
  - Updated `create_order_with_items` atomic database RPC with backwards-compatible defaults
- Implemented Payment Gateway refund handler (`lib/payment/refund.ts`) with Stripe, HitPay, Curlec API support and sandbox DuitNow QR simulation fallback
- Created Out-of-Stock Sold Out Refund API (`POST /api/owner/orders/[id]/refund`) that securely calculates line item refunds, executes payment gateway refund, updates DB records, auto-disables the dish (`dishes.is_available = false`), and broadcasts real-time `order_refunded` events to the customer channel
- Updated Cart Engine (`lib/order/cart.ts`) to compute dynamic platform fees (default RM 0.50 flat fee) and merchant payouts (100% of dish revenue kept by stall under customer fee mode)
- Created interactive `CustomerReceipt` component (`components/customer-receipt.tsx`) showing detailed breakdowns: Subtotal, Platform Fee (RM 0.50), Total Paid with `[PAID via eWallet / DuitNow QR]` badge, real-time sold-out item strikes with `[Item Sold Out - Refunded: -RM X.XX]`, and adjusted totals
- Re-architected Merchant Kitchen Ticket stream (`app/owner/orders/page.tsx`):
  - Completely omits the customer platform fee line item
  - Shows table/collection details, customizations, and stall earnings subtotal (`STALL TOTAL: RM XX.XX [PAID]`)
  - Added 1-Tap `Item Sold Out / Refund` button next to each line item with confirmation modal, instant gateway refund, and live dish inventory disabling
- Updated public landing page (`app/page.tsx`) to highlight the 0% hawker commission, flat RM 0.50 diner fee, and 1-tap automated out-of-stock eWallet refunds in the hero, interactive product showcase tabs, and pricing tiers

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers, deterministic `SearchService`, and payment refund handlers
- Database: Supabase/PostgreSQL with raw SQL migrations (001-008), generated-style TypeScript types, RLS, and fallback data paths
- Security: AI never touches SQL or database access directly; merchant isolation verified via memberships before processing refunds

## Important Decisions
- AI output is validated with Zod before it can affect backend logic
- Search remains deterministic and database-backed when credentials are present
- Platform Monetization: Transparent flat RM 0.50 per-order diner fee, with 0% transaction commission on stalls so hawkers keep 100% of their dish earnings
- Refunds: When an item is sold out, hawker triggers 1-tap refund from kitchen ticket; customer receives automated eWallet refund and dish is marked unavailable automatically
- Kitchen ticket privacy: Customer platform fee line item is strictly omitted from merchant kitchen tickets

## Known Issues
- Password recovery depends on Supabase Auth email configuration
- Live Stripe/HitPay/Curlec transactions require live API credentials in production; local sandbox fallback provides smooth development and demo testing

## Next Task
Next: Run end-to-end user checkout and verify realtime multi-stall kitchen routing and sold-out refund synchronization.
