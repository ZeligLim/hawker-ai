# Current Project Context

## Current Phase
Phase 8: Multi-Client Platform Architecture Refactoring & Onboarding Access Gating

## Current Feature
1. **Multi-Client Experience Separation**:
   - Refactored application into 4 distinct client experiences with clean architectural boundaries:
     1. **Public Marketing Website** (`components/marketing/marketing-shell.tsx` & `components/marketing-nav.tsx`):
        - Public discovery, features, pricing, and onboarding (`/`, `/pricing`, `/plans`, `/apply`, `/subscribe`).
        - Does NOT expose customer, stall-worker, or owner dashboards.
        - Real-time authentication awareness:
          - "Dashboard" button is ONLY shown if user has completed shop onboarding (`roles.hasShopOwner`) OR stall setup via invitation email (`roles.hasBooth`).
          - If the user holds **both** shop owner and stall worker roles, clicking "Dashboard" opens a dropdown allowing them to choose between "Shop Dashboard" (`/shop-owner/booths`) and "Stall Kitchen (KDS)" (`/owner/orders`).
          - If only a shop owner, links directly to `/shop-owner/booths`.
          - If only a stall worker, links directly to `/owner/orders`.
          - If user is only a customer / diner, "Dashboard" is completely hidden.
          - "Start Free" is shown when signed in ONLY if shop onboarding has not yet been completed (`!roles.hasShopOwner`), linking directly to shop onboarding (`/apply`).
     2. **Customer App** (`components/customer/customer-shell.tsx`):
        - Browsing, menus, QR table sessions, multi-stall cart, checkout, order tracking, and diner profile (`/home`, `/menu`, `/orders`, `/profile`, `/scan`, `/shop/[slug]`, `/results`).
        - Bottom navigation strictly exposes customer views (Home, Menu, Orders, Profile).
        - Guest mode ("Continue as guest") in `/auth` is strictly gated to customer intent (`/home`, `/menu`, `/orders`, `/scan`, `/shop/`, `/results`); it does NOT apply when signing in from the public marketing site or merchant onboarding.
     3. **Hawker Stall App** (`components/stall/stall-shell.tsx` & `components/stall/stall-guard.tsx`):
        - Tailored for stall workers & chefs operating kitchen display systems (`/stall`, `/owner`, `/owner/orders`, `/owner/menu`, `/owner/profile`).
        - Stall access is **strictly email-invite only** via cryptographic invitation tokens dispatched by food hall venue operators (`/booths/join?token=...`).
        - Added dedicated interactive FAQ on the landing page explaining that stalls cannot self-register publicly without an operator invitation.
     4. **Hawker Shop Owner App** (`components/owner/owner-shell.tsx` & `components/owner/owner-guard.tsx`):
        - Reserved for venue operators and hawker centre business owners (`/shop-owner`, `/shop-owner/booths`, `/shop-owner/analytics`, `/shop-owner/profile`, `/booths`, `/analytics`).
        - Registration button on `/apply` simplified to "Sign Up".

2. **Shop Onboarding vs Stall Setup Decoupling**:
   - **Shop Onboarding (`/apply`)**: Venue operators register physical hawker centres or food halls (`restaurants`) and receive `restaurant_memberships` (`role: 'owner'`). Fixed `app/api/owner/shops/route.ts` to stop auto-inserting `merchant_memberships` or creating stall records. Overhauled `app/apply/page.tsx` to collect genuine venue attributes (venue type, stall slot capacity, address, table capacity, operator phone).
   - **Stall Onboarding**: Strictly email-invite only via operator tokens (`/booths/join?token=...`). Stalls cannot register independently or publicly on the website.
   - **Start Free Button**: Linked strictly to Shop Onboarding (`/apply`), never stall setup. Shown when signed in only if `!roles.hasShopOwner`. If already a shop owner, links to `/shop-owner/booths`.

3. **Customer Landing Page (`/customer`) & Clean Client Separation**:
   - **Owner Landing Page (`app/page.tsx` & `components/marketing-nav.tsx`)**: Removed all customer app and customer landing page links/buttons from the hero section, navigation bars, and footer. The owner landing page is now strictly dedicated to food court operators, hawker centre owners, and stall onboarding.
   - **Simplified Customer Landing Page (`app/customer/page.tsx`)**:
     - **Spacious, Non-Crowded Navbar**: Eliminated the cluttered ribbon and reduced the nav links to 4 core anchors (`How It Works`, `Perks`, `Food Halls`, `FAQ`). On desktop, right-side buttons are compact (`Scan QR`, `Order Food`, and `Sign In`/profile badge) inside `max-w-7xl` with generous breathing room. On mobile, compact direct `Order` button and hamburger drawer prevent any layout overflow.
     - **Streamlined Sections**: Focused strictly on diner essentials:
       - Crisp hero with table ordering value proposition and quick action buttons.
       - 3-step visual guide: Scan QR → Mix dishes across stalls into 1 cart → Pick up when phone buzzes.
       - Key perks: One Shared Cart, Zero App Download, Digital Phone Buzzer, Instant Sold-Out Refunds.
       - Popular food halls directory (Lot 10 Hutong, Newton Food Centre, Penang Road, Medan Selera SS2) with stall count and direct menu links.
       - Concise diner FAQ accordion with smooth expand/collapse.
       - Clean, minimalist footer.
   - Client routing in `lib/shared/permissions.ts` classifies `/customer` as `'website'`.

4. **Sign Out Landing Page Redirection**:
   - `signOut` in `components/auth-provider.tsx` now redirects to the landing page (`'/'`) by default instead of `/auth`.
   - Added `resolveSignOutDestination` in `lib/auth-redirect.ts` to enforce safe landing-page fallback and prevent open-redirect vulnerabilities or auth loops.
   - Introduced `isSigningOutRef` in `AuthProvider` so unauthenticated route guards do not intercept the sign out transition when logging out from private views (such as `/owner/orders`, `/profile`, or `/shop-owner/booths`).
   - Added Sign Out button and confirmation modal to `app/shop-owner/profile/page.tsx` for food hall operators.
   - Added `/customer` to `publicRoutes` in `components/auth-provider.tsx`.

5. **Restaurant Registration RLS & Atomic Provisioning**:
   - **Root Cause**: Table `restaurants` had RLS enabled with SELECT (`Allow public read access on restaurants`) and UPDATE (`Owners can update their restaurants`), but lacked an INSERT policy for authenticated users, resulting in PostgreSQL error `new row violates row-level security policy for table "restaurants"` upon registration.
   - **Migration 011 (`supabase/migrations/011_restaurant_registration_rls.sql`)**:
     1. Added `CREATE POLICY "Authenticated users can create restaurants" ON restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);`.
     2. Added owner DELETE policies for `restaurants` and `food_outlets`.
     3. Implemented atomic `register_hawker_centre` PostgreSQL RPC with `SECURITY DEFINER` that creates the restaurant, assigns owner membership, and provisions initial booth slots in a single transaction.
   - **Server Layer (`lib/supabase/server.ts` & `app/api/owner/shops/route.ts`)**:
     - Added `createAdminClient` supporting `SUPABASE_SERVICE_ROLE_KEY` if configured.
     - Updated `app/api/owner/shops/route.ts` to attempt the atomic RPC first, fall back to direct client insertion with user authorization, and provide actionable error messaging if migration 011 has not yet been executed in Supabase.

6. **Email-Gated Booth Setup Links & Store Access Revocation**:
   - **Root Cause of Error**: Invoking `/api/owner/booths/[id]/invite` in `app/shop-owner/booths/page.tsx` was calling unauthenticated global `fetch` instead of `authenticatedFetch`, causing `requireRequestUser` to fail with `Authentication required.`.
   - **Migration 012 (`supabase/migrations/012_booth_invitation_email.sql`)**:
     1. Added `invited_email TEXT` to `booth_invitations` with index.
     2. Added `email TEXT` to `merchant_memberships` with index.
     3. Backfilled `merchant_memberships.email` from `auth.users`.
     4. Added RLS SELECT policy allowing restaurant owners to view all stall members in their outlets.
     5. Added RLS DELETE policies allowing restaurant owners to remove members from `merchant_memberships` and revoke `booth_invitations`.
     6. Pushed migration to remote Supabase via `npx supabase db push`.
   - **Email-Gated Setup Links (`app/api/owner/booths/[id]/invite/route.ts` & `app/api/owner/booths/join/route.ts`)**:
     - Shop owners enter an email (e.g. `vendor@stall.com`) and click "Send Setup Link".
     - Generates cryptographically secure token tied specifically to `invited_email`.
     - When claiming (`POST /api/owner/booths/join`), only the authenticated user whose email matches `invitation.invited_email` is authorized to claim the stall. Any other signed-in email is rejected with 403 Forbidden.
   - **Store Control Revocation (`app/api/owner/booths/[id]/members/route.ts`)**:
     - Shop owners view all authorized emails (`Active (Manager)` and `Pending Setup`).
     - Clicking "Remove" invokes `DELETE /api/owner/booths/[id]/members`, deleting the user from `merchant_memberships` and revoking any pending invitations.
     - Once removed, the user immediately loses control of the store; all stall management endpoints (`/api/owner/dishes`, `/api/owner/orders`, `/owner/menu`) reject access with 403 Forbidden.
   - **UI Overhaul (`app/shop-owner/booths/page.tsx`)**:
     - Replaced generic "Generate Token" buttons with an email input and a "Send Setup Link" button for each booth slot.
     - Displays the live list of authorized emails with status indicators (`Active Staff` vs `Pending Setup`).
     - Provided 1-click "Remove" buttons with real-time feedback that immediately revokes stall access.

8. **Responsive Design (Mobile & Tablet), Unified Design Language & Deduplication**:
   - **Unified Shared Components**:
     - `components/shared/client-bottom-nav.tsx`: Extracted floating bottom navigation used across Customer, Stall Worker, and Shop Owner client shells. Features responsive width scaling (`max-w-[430px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[680px]`), iOS home-bar safe-area insets (`pb-[max(0.75rem,env(safe-area-inset-bottom))]`), and accessible minimum 44px tap targets.
     - `components/dish-card.tsx`: Extracted common Apple-style dish card UI with rounded borders, price badge, vegetarian leaf badge, lazy-loaded photo fallback, and quantity counter controls.
   - **Code Deduplication**:
     - Replaced duplicate dish card JSX across `components/home-page.tsx`, `components/menu-page.tsx`, and `components/shop-detail-client.tsx` with `<DishCard />`.
     - Removed redundant custom `<nav>` blocks in `components/customer/customer-shell.tsx`, `components/stall/stall-shell.tsx`, and `components/owner/owner-shell.tsx` in favor of `<ClientBottomNav />`.
     - Deleted obsolete unused file `components/shop-owner-nav.tsx`.
     - Net reduction of over 120 lines of redundant code while expanding capabilities.
   - **Responsive Breakpoint Overhaul (Mobile, Tablet, Desktop)**:
     - Uncapped restrictive mobile-locked containers (`max-w-[430px] sm:max-w-[480px]`) in favor of fluid responsive widths (`w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-4 sm:px-6`).
     - **Dish Grids**: Scales from 2 columns on mobile to 3 columns on tablet portrait, and 4 columns on tablet landscape/desktop (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`) in Home, Menu, and Stall Detail views.
     - **Stalls & Directory**: Upgraded to 2-column grid on tablet/desktop (`grid-cols-1 md:grid-cols-2 gap-3.5`).
     - **Orders & Checkout**: Overhauled into a responsive 2-column layout on tablet/desktop (`md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] md:gap-6 md:items-start`), keeping the order items on the left and a sticky Order Summary & Checkout panel on the right.
     - **KDS Kitchen Ticket Stream (`/owner/orders`)**: Upgraded to a 2-column ticket grid on tablet/desktop (`grid grid-cols-1 md:grid-cols-2 gap-4`), optimized for counter-mounted iPads and tablets in hawker stalls.
     - **Owner Menu (`/owner/menu`)**: Upgraded to a 2-column responsive grid on tablet/desktop.
     - **Profile & Settings (`/profile`, `/profile/settings`)**: Uncapped artificial `max-w-[190px]` display name truncation and expanded container to `max-w-2xl`.
     - **Scan QR (`/scan`)**: Expanded container and adjusted typography for tablets.

9. **Automated Verification & Testing**:
   - `lib/auth-onboarding.test.ts`: Added unit tests verifying `resolveSignOutDestination` defaults to `'/'`, handles custom safe paths, and sanitizes malicious URLs; tested `isCustomerIntent` route classification, marketing nav role detection, dashboard visibility gating, dual-role dropdown handling, shop-only "Start Free" visibility, and `/customer` route isolation.
   - `lib/multi-client-architecture.test.ts`: Client path resolution including `/customer`, client boundaries, cross-stall isolation, cross-shop isolation, unauthenticated redirects, stall access revocation on membership removal, and email-gated setup link validation.
   - All 18 tests pass (`npm test`).
   - TypeScript verification (`npx tsc --noEmit`) passes with 0 errors.
   - ESLint (`npm run lint`) passes with 0 errors.
   - Production build (`npm run build`) compiles all 45 routes successfully.

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
- **Picture-Only Dish Cards (`components/dish-card.tsx`)**:
  - Removed dish name text completely from card face to honor visual-first diner experience.
  - Replaced text initials fallback with culinary icon (`UtensilsCrossed`).
  - Edge-to-edge visual tile with floating glassmorphism price pill (top-left), vegetarian badge (top-right), and floating quantity / add button pill.
  - Preserved accessibility with `aria-label={name}` and `alt={name}` for assistive technology.
- **Mobile Phone Responsive Design & Logo/Icon-First Optimization**:
  - `components/marketing-nav.tsx`: Mobile header (`sm:hidden`) uses logo/icon-first buttons (`LayoutDashboard`, `Store`, `CookingPot`) with responsive labels (`hidden xs:inline`) so top navigation never wraps or overflows on small screens (320px–375px).
  - `components/role-mode-switcher.tsx`: Truncation protection (`min-w-0 flex-1 truncate`), responsive mode pill, and clean stacking on phone viewports.
  - `components/stall/stall-shell.tsx` & `components/owner/owner-shell.tsx`: Concise navigation labels ("Tickets", "Menu", "Booths", "Profile") and responsive compact headers.
  - `components/shared/client-bottom-nav.tsx`: Fixed label wrapping with `truncate max-w-full px-1 text-center` and safe-area inset preservation.
  - `app/orders/page.tsx`: Responsive checkout button (`Pay RM XX.XX` on phone, `Pay & Place Order • RM XX.XX` on tablet/desktop).
  - `app/shop-owner/booths/page.tsx`: Icon-first buttons (`Edit Slot`, `Send Link`, `Remove`, `Revoke`) preventing horizontal squashing.
  - `app/owner/orders/page.tsx`: KDS ticket refund button made compact (`XCircle` icon + responsive text) and stall payout footer wraps gracefully.
  - `components/home-page.tsx`, `components/menu-page.tsx`, `components/shop-detail-client.tsx`, and `app/customer/page.tsx`: Full responsive review preventing text overflow and awkward line breaks.
- **Stall Setup Email Dispatch Service (`lib/email/mailer.ts`)**:
  - Implemented multi-provider email delivery engine supporting:
    1. **Resend REST API** (`RESEND_API_KEY`, `RESEND_FROM` / `EMAIL_FROM`)
    2. **SMTP Transport via Nodemailer** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
    3. **Dev Simulation & Console Logging**: Generates high-visibility console notification box with clickable `/booths/join?token=...` link when live email keys are not yet configured in local development.
  - Connected email dispatch into `POST /api/owner/booths/[id]/invite`:
    - Retrieves physical food hall venue name (`restaurants`) and slot identifier (`food_outlets`).
    - Constructs responsive, mobile-optimized HTML email containing stall setup link, security isolation warning, and 7-day expiration notice.
    - Dispatches email and returns `{ delivered, simulated, provider, setupLink, message }`.
  - Updated `app/shop-owner/booths/page.tsx` UI feedback banner: displays green check badge (`CheckCircle2`) when email is delivered via Resend/SMTP or link copy badge when simulated in dev mode.
  - Documented configuration options in `.env.example`.
- **Booth Invitation Token Redemption & RLS Fix**:
  - Diagnosed root cause of "This invitation is invalid or expired": invited vendors lack prior membership in `booth_invitations` and `merchant_memberships`, causing RLS to return empty sets when authenticated via `anon` key without service role key in local environments.
  - Created migration `013_booth_invitation_redemption.sql`:
    - Added `claim_booth_invitation(p_token_hash, p_stall_name)` RPC with `SECURITY DEFINER` for atomic, server-authorized token validation, email match verification, stall naming, and `merchant_memberships` enrollment.
    - Added `get_booth_invitation_details(p_token_hash)` RPC for instant token metadata preview.
    - Updated RLS policies on `booth_invitations` (allowing invitee/active token inspection) and `merchant_memberships` (allowing authenticated user self-enrollment upon valid claim).
    - Pushed migration directly to remote Supabase via `npx supabase db push`.
  - Updated `app/api/owner/booths/join/route.ts` to call `claim_booth_invitation` RPC with fallback to direct queries.
  - Updated `app/booths/join/page.tsx` to automatically extract tokens from pasted URLs, live-preview the assigned food hall venue and booth name, and display email mismatch warning if logged in with a different account.
  - Fixed `app/api/owner/booths/[id]/invite/route.ts` to support both email-gated invitations and open setup tokens, and eliminated dummy `HKR-8F92-KL` fallback from `app/subscribe/page.tsx`.
- **Home & Menu Page Background Div Color Harmonization**:
  - Removed container `lg:bg-white` wrapping divs in `components/home-page.tsx` and `components/menu-page.tsx`.
  - Ensured all views consistently inherit the neutral `#f5f5f7` canvas across mobile, tablet, and desktop viewports without jarring card borders.
  - Styled the venue table header pill on `/home` into a crisp `bg-white border border-black/[0.06] shadow-xs` element matching dish cards and search bars.
- **Design Unification Across 3 Apps & Elimination of Deep Blue**:
  - **Bottom Tab Navigation (`components/shared/client-bottom-nav.tsx`)**: Unified tab container and active pill (`bg-[#111827] text-white`) across all three client apps (Customer, Stall Worker, Shop Owner). Removed conflicting `#0071e3` electric blue styles.
  - **Header & Shells (`components/owner/owner-shell.tsx`, `components/stall/stall-shell.tsx`)**: Eliminated `bg-blue-600` and `text-blue-600`. Standardized headers with `#111827` icon containers, neutral role pills, and unified `max-w-7xl` container widths.
  - **Owner Overview Redesign (`app/shop-owner/page.tsx`)**:
    - Fixed mobile layout deformities, replacing oversized blocks with a responsive 2x2 KPI grid (`grid-cols-2 lg:grid-cols-4`).
    - Implemented widescreen multi-column layout (`lg:grid-cols-12`): Left (8 cols) displays managed venues and stall slot status badges; Right (4 cols) features streamlined quick-operation shortcuts and merchant isolation security notice.
  - **Widescreen Analytics Dashboard Redesign (`app/shop-owner/analytics/page.tsx` & `app/api/owner/analytics/route.ts`)**:
    - Expanded layout from `max-w-[980px]` to `max-w-7xl` to make full use of widescreen monitors and tablets.
    - Upgraded top summary into a responsive 5-card KPI ribbon: Gross Sales (RM), Total Orders, Average Ticket Size, Active Stalls, and Stall Avg Sales.
    - Two-column responsive architecture (`lg:grid-cols-12`):
      - Left (8 cols): Stall performance leaderboard rendered in a responsive multi-column grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3`) so stalls span 2-3 per row (occupying exactly 2-3 rows for up to 6 stalls), with rank medals (🥇 1, 🥈 2, 🥉 3), proportional volume progress bars, expandable view toggle for >6 stalls, and operational velocity benchmarks (Top Earner, Occupancy Rate, Stall Velocity).
      - Right (4 cols): Segmented revenue share visualizer, transparent settlement & merchant payout breakdown (Gross Volume, Merchant Disbursements, Platform Cut), and quick food hall management shortcuts.
    - Updated `app/api/owner/analytics/route.ts` to sort stalls by revenue descending and calculate active booth counts, platform processing fees, and merchant payouts.
  - **Booths Management Page Mobile Optimization (`app/shop-owner/booths/page.tsx`)**:
    - Replaced all remaining `#0071e3` blue buttons, input focus rings, and modal accents with sleek `#111827` dark styling.
    - Optimized email input and "Send Link" button to never break or overflow on small mobile displays (<375px).
    - Refactored authorized member rows and pending invite tokens with responsive wrapping and accessible touch targets.

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers, deterministic `SearchService`, and payment refund handlers
- Database: Supabase/PostgreSQL with raw SQL migrations (001-013), generated-style TypeScript types, RLS, and fallback data paths
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
