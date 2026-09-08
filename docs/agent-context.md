# Current Project Context

## Current Phase
Phase 8: Multi-Client Platform Architecture Refactoring (Landing, Customer, Stall, Owner)

## Current Feature
1. **Multi-Client Experience Separation**:
   - Refactored application into 4 distinct client experiences with clean architectural boundaries:
     1. **Public Marketing Website** (`components/marketing/marketing-shell.tsx` & `components/marketing-nav.tsx`):
        - Public discovery, features, pricing, and onboarding (`/`, `/pricing`, `/plans`, `/apply`, `/subscribe`).
        - Does NOT expose customer, stall-worker, or owner dashboards.
        - Persists real-time authentication awareness with user initials avatar, role badge, and contextual navigation without layout leakage.
     2. **Customer App** (`components/customer/customer-shell.tsx`):
        - Browsing, menus, QR table sessions, multi-stall cart, checkout, order tracking, and diner profile (`/home`, `/menu`, `/orders`, `/profile`, `/scan`, `/shop/[slug]`, `/results`).
        - Bottom navigation strictly exposes customer views (Home, Menu, Orders, Profile).
        - Does NOT expose stall dashboard, ticket processing, menu editing, staff management, or owner analytics.
     3. **Hawker Stall App** (`components/stall/stall-shell.tsx` & `components/stall/stall-guard.tsx`):
        - Tailored for stall workers & chefs operating kitchen display systems (`/stall`, `/owner`, `/owner/orders`, `/owner/menu`, `/owner/profile`).
        - Dark-mode high-contrast KDS bottom navigation (Tickets, Menu 86, Overview, Profile).
        - Strictly isolated: stall workers only see and modify their assigned stall's orders and dishes.
        - Cross-access prevented: customers and unauthorized users are blocked by `StallGuard` and redirected.
     4. **Hawker Shop Owner App** (`components/owner/owner-shell.tsx` & `components/owner/owner-guard.tsx`):
        - Reserved for venue operators and hawker centre business owners (`/shop-owner`, `/shop-owner/booths`, `/shop-owner/analytics`, `/shop-owner/profile`, `/booths`, `/analytics`).
        - Dedicated business navigation (Booths & Invites, Financial Analytics, Venue Settings).
        - Protected by `OwnerGuard`: customers and stall workers without venue ownership are redirected to `/apply`.
   - Refactored root `components/app-shell.tsx` into a lightweight multi-client dispatcher using `PermissionEngine.getClientForPath(pathname)`.

2. **Decoupled Platform SDK (`lib/shared/`)**:
   - Designed for 100% portability across Web, iOS, and Android (React Native / Expo):
     - `lib/shared/types.ts`: Clean domain entities separating personal user identity (`UserProfile`) from business entities (`RestaurantEntity`, `FoodOutletEntity`, `DishEntity`, `MerchantOrderEntity`) and memberships (`RestaurantMembershipEntity`, `MerchantMembershipEntity`).
     - `lib/shared/permissions.ts`: Pure TypeScript `PermissionEngine` evaluating client capabilities, route authorization, and cross-stall/cross-shop boundaries.
     - `lib/shared/api-client.ts`: Modular API client layer with client-specific namespaces (`customerApi`, `stallApi`, `ownerApi`).

3. **Backend Authorization & Security Hardening**:
   - Fixed `app/api/owner/analytics/route.ts`: Enforced strict `restaurant_memberships` role check (`owner`, `manager`). Stall workers and customers calling shop analytics now receive `403 Forbidden`. Removed all dev fallback leaks.
   - Fixed `app/api/owner/dishes/route.ts`: Removed insecure POST bypass and fallback mock data in GET. Unauthorized users receive `403 Forbidden`.
   - Fixed `app/api/owner/orders/route.ts`: Returns `403 Forbidden` if requester lacks stall/shop memberships.
   - Created Supabase migration `supabase/migrations/010_multi_client_authorization.sql` enforcing PostgreSQL Row Level Security (RLS) for restaurants, food outlets, dishes, and merchant orders.

4. **Automated Verification & Testing**:
   - Added `lib/multi-client-architecture.test.ts` covering path resolution, client boundaries, cross-stall isolation, cross-shop isolation, and unauthenticated redirects.
   - All 13 unit tests pass (`npm test`).
   - TypeScript verification (`npx tsc --noEmit`) passes with 0 errors.
   - ESLint (`npm run lint`) passes with 0 errors.
   - Production build (`npm run build`) compiles all 44 routes successfully.

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
- Applied all migrations (001 through 008) and seed data to the remote Supabase database; all core tables, RLS policies, and RPCs are active
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
- Removed all public `/booths/join` links from landing page (`app/page.tsx`) across top nav, mobile drawer, invitation explainer card, and footer
- Removed unauthorized auto-insertion into `merchant_memberships` in `app/api/owner/dishes/route.ts` to strictly maintain invite-only stall kitchen access
- Implemented `app/api/user/roles/route.ts` to verify user memberships on the server (`hasShopOwner`, `hasBooth`, `shops`, `booths`)
- Created `components/role-mode-switcher.tsx` supporting seamless switching between Diner, Stall Kitchen, and Food Hall Operator only when verified memberships exist
- Integrated `<RoleModeSwitcher />` across `app/profile/settings/page.tsx`, `app/profile/page.tsx`, `app/owner/profile/page.tsx`, and `app/shop-owner/profile/page.tsx`, eliminating all arbitrary toggle buttons
- Refactored `app/subscribe/page.tsx` Stage 3 to "Generate Booth Token" so shop owners specify booth slot identifiers (e.g. `Slot #01`) rather than stall brand names or menus, and display 1-click invitation links on launch
- Refactored `app/shop-owner/booths/page.tsx` to "Generate Booth Token" so shop owners generate cryptographically secure invitation tokens for stall slots, copyable with 1-click links (`/booths/join?token=...`)

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers, deterministic `SearchService`, and payment refund handlers
- Database: Supabase/PostgreSQL with raw SQL migrations (001-008), generated-style TypeScript types, RLS, and fallback data paths
- Security: AI never touches SQL or database access directly; merchant isolation verified via memberships before processing refunds; booth activation is strictly invite-only
- Monetization: Zero monthly software subscriptions; platform revenue is generated via a transparent payment cut on processed orders

## Important Decisions
- AI output is validated with Zod before it can affect backend logic
- Search remains deterministic and database-backed when credentials are present
- Platform Monetization: No monthly RM software subscriptions. Transparent cut taken from transactions; configurable between diner platform fee (flat RM 0.50) and merchant payout deduction
- Refunds: When an item is sold out, hawker triggers 1-tap refund from kitchen ticket; customer receives automated eWallet refund and dish is marked unavailable automatically
- Kitchen ticket privacy: Customer platform fee line item is strictly omitted from merchant kitchen tickets
- Business Model & Launchpad: Completely eliminated legacy subscription tiers (Starter, Food Hall Pro, Enterprise) and checkout artifacts. Centered entire landing page (#pricing) and venue launchpad (/subscribe) around "Zero monthly subscriptions. We only win when you sell."
- Role Separation & Strict Membership Gating: Shop owners generate tokens for booth slots; they do not configure stalls. Stall vendors redeem tokens to name their stall and set menus. Mode switcher pills are only visible when the user holds verified server-side memberships.

## Known Issues
- Password recovery depends on Supabase Auth email configuration
- Live Stripe/HitPay/Curlec transactions require live API credentials in production; local sandbox fallback provides smooth development and demo testing

## Next Task
- End-to-end user checkout and verify realtime multi-stall kitchen routing and sold-out refund synchronization.
