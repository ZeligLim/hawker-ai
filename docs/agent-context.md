# Current Project Context

## Current Phase
Phase 29: Standard OpenStreetMap (Zero Watermark), Map Selected Shop Card, and Dedicated List View Mode

## Current Feature
1. **High-Res Pure Black & White Map (`components/hawker-map.tsx`)**:
   - Switched map tile endpoint to high-res Google Maps tiles (`mt0.google.com/vt/lyrs=m...&scale=2`) to resolve low-res pixelation issues on retina displays (which occurred with Esri Light Gray).
   - Applied a custom CSS filter (`grayscale(100%) contrast(120%) brightness(105%)`) to perfectly strip all colors and enforce the requested pure white and black high-contrast look without watermarks.
   - **Bugfix**: Pushed the map zoom controls further down to `top-32` (128px) when in `fullScreen={true}` to prevent them from crashing into the top search bar and Quick Scan QR button area.

2. **Clean & Straightforward Scan QR Prompt (`components/customer-stall-page.tsx`)**:
   - Completely redesigned the "At a table?" scanning prompt on the stall page.
   - Replaced the bulky multi-element card with a single, clean, full-width pure black button: `Scan table QR to order`.
   - Replaced all instances of the generic `Camera` icon with the proper `QrCode` icon across `customer-stall-page.tsx` and `centre-diner-page.tsx` to match the unified UI language.Clean vertical feed showing venue count, standard `h-11` Distance / Rating sorting controls, and search filtering.

4. **Home Tab: List View Redesign (`components/home-page.tsx`)**:
   - The Distance/Rating sort toggle now exactly matches the Map/List toggle global styling (`h-9` pills inside a white rounded container).
   - Completely redesigned the hawker centre cards in list view:
     - The bulky black "View" button is gone. The entire card is now clickable.
     - Stripped away unnecessary information (removed the long address string and walking time string which cluttered mobile).
     - Condensed the stats (rating, stalls count, distance) into a single clean line with dot separators.

## Phase 30: AI Search, Menu Scanner, and MCP Server
1. **Food Card Aspect Ratio**: Made `DishCard` perfectly square on all devices by changing `aspect-[4/3] sm:aspect-square` to `aspect-square`.
2. **AI Search Fix**: Fixed the natural language AI search which was broken because the frontend passed `q` instead of `query`, and the default filter values caused the AI parser to skip.
3. **AI Menu Scanner**: Implemented `app/(stall)/owner/menu/scan/page.tsx` and an API route. Merchants can now upload a picture of their physical menu, and the backend uses the AI SDK (via OpenRouter/Gemini) to extract dishes, categorize them, and prepare them for one-click bulk saving.
4. **Agentic Actions (MCP)**: Added `@modelcontextprotocol/sdk`. Built `scripts/mcp-server.ts` and configured it in `.agents/mcp_config.json`. The AI agent can now use these tools to directly interact with the Supabase database on the user's behalf.
   - Completely removed any "Resume Table" button.
   - Centre cards in both views use smooth, solid `transition-colors` with zero hover animations or scale shifts.

3. **Bottom Navigation Tab De-clutter (`components/shared/client-bottom-nav.tsx`)**:
   - Removed all word labels across customer, stall, and owner shells.
   - Clean, centered icon pills adhering to Apple standard 44px (`h-11`) touch target.

4. **Stall & Centre View Polish**:
   - In `components/centre-diner-page.tsx`:
     - Removed the `"50 Jalan Sultan, City Centre, Kuala Lumpur"` address line.
     - Removed the `"Change"` underline text from the scan table button.
     - Modernized table selection modal and floating bottom cart to 0 border and no bouncy animations.
   - In `components/customer-stall-page.tsx`:
     - Filtered out any street address text from the centre header.
     - Standardized filter chips to `h-11`, pure white inactive, pure black active, 0 border.
     - Removed all card borders, badge borders, and hover translate animations.

5. **Dish Spice Level Customization Engine**:
   - In `lib/order/customizations.ts`:
     - Upgraded `getDishCustomization` so all dishes with `spiceLevel >= 1` or culinary keywords (`curry`, `laksa`, `sambal`, `chili`, `spicy`, `pedas`, `tomyum`, `mala`, `nasi lemak`, `mee goreng`, `pan mee`, `kway teow`, `rendang`) reliably offer spice level customization (`Level 0 Mild`, `Level 1 Less spicy`, `Level 2 Medium`, `Level 3 Extra spicy`).
   - In `components/customization-card.tsx`:
     - Removed `ring-1 ring-black/5` border.
     - Added tap-friendly button options below the spice level slider for fast one-tap selection on mobile.
     - Standardized button to `h-11`, pure black, 0 border, no animation.
   - In `components/dish-card.tsx` & `components/menu-page.tsx`:
     - Removed hover zoom and active scale animations; standardized to Apple `h-11` controls.

6. **Documentation Cleanup**:
   - Deleted `docs/endpoints.md`, `docs/project-spec.md`, and `docs/saas-architecture.md`.
   - Preserved only `docs/agent-context.md`.

2. **Mobile-First Map Bottom Sheet & Shop Pins**:
   - In `components/hawker-map.tsx`:
     - Removed the downward diamond arrow on shop label pins.
     - Removed map watermark / attribution banner.
     - Kept high-contrast monochrome tile filter (`grayscale(100%) contrast(108%) brightness(102%)`).
   - In `components/home-page.tsx`:
     - Removed "Table 04" button from the map view.
     - Mobile-first swipe-up gesture bottom sheet (`onTouchStart`, `onTouchMove`, `onTouchEnd`) filling full bottom width (`w-full inset-x-0 bottom-0`).
     - Standardized Distance and Rating filter pills to `h-11` (44px) height, with pure white inactive background (`bg-white text-black`) and pure black active background (`bg-black text-white`).

3. **Orders Page Cleanup**:
   - In `app/(customer)/orders/page.tsx`:
     - Removed `"Your order"`, `"Review items and checkout"`, and the `"Table 04"` banner.
     - Removed table session buttons from the summary box.
     - Enforced strictly 0 borders and pure black-and-white theme throughout.

4. **Account-Isolated Order History & Receipts**:
   - In `app/(customer)/profile/page.tsx`:
     - Local storage cache is strictly scoped to the authenticated user's ID (`hawker-profile-${authProfile.id}`).
     - Switching between accounts immediately clears previous user orders.
     - Remote orders from `/api/orders` always overwrite state (including empty `[]`), preventing order leakage between accounts.
     - Previous orders list cards styled with 0 border, soft fill `bg-white hover:bg-neutral-100`, and pure black/white typography.
   - In `components/customer-receipt.tsx` & `app/(customer)/profile/order/[id]/page.tsx`:
     - Completely removed all borders, dividers, dashed lines, and spin animations.

5. **5-Domain App Structure**:
   - Organized `app/` into 5 clean Next.js route groups:
     1. `app/(website)`: `/`, `/pricing`, `/plans`, `/apply`, `/auth`, `/customer`, `/subscribe`
     2. `app/(customer)`: `/home`, `/[centreSlug]`, `/stall`, `/stalls`, `/menu`, `/orders`, `/scan`, `/results`, `/shop`, `/profile`
     3. `app/(stall)`: `/owner`, `/booths`
     4. `app/(center)`: `/shop-owner`, `/analytics`
     5. `app/(saas)`: `/admin`
     - Root files maintained: `app/api/`, `app/globals.css`, `app/layout.tsx`.
   - Added convenience redirects in `next.config.mjs` for `/center` and `/saas` paths.

6. **Verification**:
   - `npx tsc --noEmit`: 0 TypeScript errors.
   - `npm test`: 31/31 unit & integration tests passed.
   - `npm run lint`: 0 errors.
   - `npm run build`: Production build succeeded across all 50 routes.

## Previous Phases
Phase 26: Unified Search Bar & Uniform Borderless Action Buttons (h-11 Touch Target)

## Previous Phases
Phase 22: Apple-Inspired Visual Streamline for SaaS Platform Admin (`/admin`)

2. **Refactored Admin Shell (`components/admin/admin-shell.tsx`)**:
   - Translucent sidebar `bg-[#fbfbfd]/90 backdrop-blur-xl border-r border-black/[0.08]` matching macOS System Settings.
   - Active navigation items rendered in `#1d1d1f` with crisp white text and subtle shadow; inactive items use `#6e6e73` with smooth hover.
   - Refined mobile top header and brand badges.
   - Apple modal dialog for sign-out confirmation with cancel and dark destructive action pills.

3. **Admin Guard Boundary (`components/admin/admin-guard.tsx`)**:
   - Converted loading, unauthenticated login gate, and 403 Forbidden views to clean Apple cards with delicate borders on `#f5f5f7`.

4. **SaaS Superadmin Overview (`app/(admin)/admin/page.tsx`)**:
   - Refined header with pill badge and white refresh button with subtle border.
   - Crisp KPI metric cards with soft pastel icon backgrounds (`bg-blue-50`, `bg-emerald-50`, `bg-amber-50`, `bg-purple-50`).
   - Apple Pro action card highlighting platform fee management with Apple Blue CTA.
   - Clean food halls table with delicate border separators, subtle hover states, and refined status pills.

5. **Monetization & Fee Controls (`app/(admin)/admin/monetization/page.tsx`)**:
   - macOS-style segmented control for fee mode (Percentage, Flat Fee, Mixed).
   - Quick rate preset buttons as Apple pill badges.
   - Dual-card fee payer selector (Diner Surcharge vs. Stall Commission).
   - Apple receipt simulation card with clear breakdown of cart total, platform fee, diner bill, and stall net payout.
   - Interactive Active Venue Pricing Directory with card selection.

6. **Venues Directory & Venue Detail Pages (`app/(admin)/admin/shops/page.tsx`, `app/(admin)/admin/shops/[id]/page.tsx`)**:
   - Clean white squircle cards with subtle borders and refined status tags.
   - Apple-style inputs, segmented controls, and simulation card.

7. **Verification**:
   - `npx tsc --noEmit`: 0 TypeScript errors.
   - `npm test`: 31/31 unit tests passed.
   - `npm run lint`: 0 errors.
   - `npm run build`: Successful production build across all 50 routes.

## Previous Phases
Phase 21: Customer Venue Isolation, Time-Based Operating Schedules & Dual-Layer Status Controls

1. **Customer Navigation & Strict Venue Isolation**:
   - **Cross-Venue Header Pills Removed**: In `components/customer-stall-page.tsx`, completely removed the header pills allowing diners to switch between venues ("888 Restoran" vs "Lim's Foodcourt"). The customer experience is strictly isolated to stalls belonging to their active venue.
   - **Dedicated Stalls Route**: Created `app/stalls/page.tsx` rendering `CustomerStallPage` within active venue scope.
   - **Deprecated Full-Screen Map Landing View**: In `components/home-page.tsx`, removed OpenStreetMap/Leaflet map rendering and geolocation polling from diner entry. Customers landing on `/home` directly enter their active hawker centre context (`CentreDinerPage`) with table session info and categories.
   - **Customer Navigation Confined**: Bottom navigation links (`Home`, `Stall`, `Menu`, `Orders`, `Profile`) keep diners strictly scoped to their current venue.

2. **Fixed Spice Level Badge Indicator**:
   - In `components/dish-card.tsx` and `components/result-card.tsx`, corrected the conditional rendering check from `spiceLevel > 1` to `spiceLevel >= 1`.
   - Dishes with spice level 1 (mild) now properly render the chili/flame badge alongside dietary tags (such as vegetarian logo) rather than being hidden.

3. **Stall Overview Dashboard Cleanup (`app/owner/page.tsx`)**:
   - Removed the entire "Kitchen Station" card block along with its description text ("Fulfill incoming table tickets and adjust real-time dish availability.") and child action cards ("Kitchen Display (KDS)" and "Stall Menu").
   - Re-aligned and stretched the "Recent Orders" ticket list to span full width below metrics for a clean, focused dashboard.

4. **Time-Based Operating Schedule Engine & Dual-Layer Control Architecture**:
   - Database migration `supabase/migrations/019_operating_schedules_and_booth_active.sql`.
   - Core schedule engine in `lib/schedule/operating-hours.ts`.
   - Declarative schedule modal in `components/operating-schedule-modal.tsx`.
   - Full integration in `app/shop-owner/booths/page.tsx` and `app/owner/page.tsx`.

## Previous Phases
Phase 20: Dedicated SaaS Superadmin Dashboard Route Group & Standalone Monetization Controls

1. **Full-Screen Map UI ($100vw \times 100vh$)**:
   - Refactored `components/home-page.tsx` into a full viewport map (`fixed inset-0 w-screen h-screen z-0`).
   - Removed all static headers, titles, extra padding, and banner clutter from the home view.
   - Built a floating top search bar (`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-10`) with a clean search input, quick clear button, and GPS locate trigger.
   - Implemented a swipe-up collapsible bottom sheet over the map (`z-20`) with drag handle, summary header, touch gesture swipe-up/swipe-down handling, and full scrollable list of food halls.

2. **Auto-Location Polling & Visibility Guard**:
   - Geolocation auto-detection polls `navigator.geolocation` every 5 minutes (`5 * 60 * 1000`).
   - Added a `visibilitychange` guard: timer is paused when `document.visibilityState === 'hidden'` and immediately triggers a refresh upon active tab focus.
   - Strict shortest distance sorting: recalculates distance via Haversine formula on every location update, sorting list items and map markers strictly by shortest distance first (`distanceKm`).

3. **Merchant & Shop-Owner UI Cleanup**:
   - Removed legacy static text and unused widgets:
     - `app/owner/orders/page.tsx`: Removed `"LIVE KITCHEN TICKET STREAM"`.
     - `app/owner/page.tsx`: Removed `"Live kitchen metrics, ticket queue, and menu status"`, `"Database Connection"`, and `"Live PostgreSQL Stream"` widget.
     - `app/owner/menu/page.tsx`: Removed `"Turn availability off when a dish is sold out. Customers will see the change immediately"`.
     - `components/role-mode-switcher.tsx`: Removed `"Switch between ordering as a diner, cooking at your stall, or managing your venue."`.
     - `app/shop-owner/analytics/page.tsx`: Removed the entire **Food Hall Actions** widget (`"Food Hall Actions"`, `"Quick operational links to scale your venue."`, `"Manage Booth Slots"`, `"Venue Overview"`).
   - Matched `<select>` styling and exact heights to adjacent buttons (`h-9` in `app/owner/page.tsx`, `h-[44px]` in `app/shop-owner/analytics/page.tsx`).

4. **Verification**:
   - Verified with `npx tsc --noEmit` passing with 0 errors.

## Previous Phases
   - Updated `lib/order/customizations.ts` with polymorphic `CustomizationSource` type supporting both string dish names and full dish objects.
   - Parses dynamic `customizations` array `{ label, price }` from Supabase `dishes` table JSONB column, dynamic `spiceLevel` tiers (Level 0–3), with fallback to dish name string.
   - Updated `app/shop/[slug]/page.tsx`, `components/shop-detail-client.tsx`, `components/menu-page.tsx`, and `components/home-page.tsx` to query and pass `customizations` array directly into `getDishCustomization(dish)`.
   - Customers can now select dynamic options configured by merchants and add them to their multi-stall cart.

2. **Resolved Duplicate React Child Key Console Error**:
   - Fixed `components/home-page.tsx` where stalls were mapped using `key={stall.name}`.
   - Changed to `key={stall.id}` so that unassigned or placeholder booth slots (e.g. multiple "Booth Slot #06") maintain unique component identity without React console errors.

3. **Diner App Hidden Until Scan QR Code**:
   - `lib/table-session.ts`: Removed hardcoded default "Table 12". Added session management helpers `getStoredTableSession()`, `isTableSessionActive()`, `clearTableSession()`, with venue metadata (`centreSlug`, `centreName`, `centreId`).
   - `components/home-page.tsx`: Gated diner app when no table session is active (`!tableSession?.tableNumber`). Displays a mobile-first QR scan gate with 1-click camera scan shortcut (`/scan`), demo table shortcuts (Table 04, Table 12), and manual table input. Once linked, the diner app unlocks immediately with an active table badge and a "Change Table" option.
   - `app/scan/page.tsx`: Upgraded with `useSearchParams()` for `?table=` and `?centre=`, auto-links table sessions from QR URLs, and redirects to `/home`.

4. **Hawker Centre Domain & Subdomain Isolation**:
   - `app/api/outlets/route.ts`: Detects subdomain from `x-forwarded-host` / `host` headers or `?centre=` / `?slug=` query parameters. Scopes queries strictly to a single hawker centre so stalls from different food halls are never mixed in the same domain.
   - `components/home-page.tsx`: Passes `?centre=${tableSession?.centreSlug}` when requesting outlets and dishes.

5. **Mobile-First Landing Page Redesign (`app/page.tsx`)**:
   - Complete mobile-first architecture: Unprefixed Tailwind classes define the 360px–420px mobile layout, progressively enhancing with `sm:`, `md:`, and `lg:`.
   - Fluid mobile typography: Non-breaking responsive headers (`text-[32px] xs:text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight`).
   - High-touch CTAs: Full-width `h-12` rounded-full buttons on mobile (`Start Free as Operator`, `Scan Table QR`).
   - Mobile-first interactive showcase (`#product`): Compact segmented tabs (`🏢 Operator`, `🍳 Kitchen`, `📱 Diner QR`), legible hardware preview cards, KDS ticket, and table receipt chits with zero horizontal clipping.
   - Touch-friendly Bento grid, AI query simulator, Role breakdown, zero-subscription comparison, and FAQ accordion.

6. **React 19 & Turbopack Lint Verification**:
   - Fixed `react-hooks/set-state-in-effect` warnings in `app/scan/page.tsx` and `components/home-page.tsx` using deferred state initialization.
   - Verified clean `npx tsc --noEmit` and `npm run lint`.
   - Verified `npm run build` succeeds generating all 46 static and dynamic routes.
   - **Database Migration (`supabase/migrations/015_shop_active_and_booth_open.sql`)**:
     - Added `is_active BOOLEAN NOT NULL DEFAULT true` to `restaurants` with index `idx_restaurants_is_active`.
     - Added `is_open BOOLEAN NOT NULL DEFAULT true` to `food_outlets` with index `idx_food_outlets_is_open`.
     - Added RLS policy `Stall members can update own booth open status` on `food_outlets` allowing stall operators in `merchant_memberships` to toggle `is_open`.
     - Pushed migration directly to remote Supabase DB using `npx supabase db push`.
   - **Backend API Routes**:
     - `app/api/owner/shops/[id]/route.ts`: Supports partial PATCH for `is_active` and `status` ('approved' vs 'suspended').
     - `app/api/owner/shops/route.ts`: Returns `isActive` and `isOpen` in payload.
     - `app/api/owner/booths/[id]/route.ts`: Supports PATCH for `is_open` and `status` ('approved' vs 'closed') with access control for stall merchants and food hall operators.
     - `app/api/user/roles/route.ts`: Returns `isActive` on shops and `isOpen` on booths.
     - `lib/hawker-centres/service.ts` & `app/api/outlets/route.ts`: Expose `is_active` and `is_open` to customer listings and queries.
   - **Customer App Closed & Inactive State Enforcement**:
     - `app/shop/[slug]/page.tsx`: Computes `isClosed = !isStallOpen || !isShopActive`. Sets `busy: 'Closed'` which displays the closed banner and disables adding items to the cart.
     - Customer directory pages check `is_open` and show closed states.
   - **Shop Owner & Booth Owner Controls**:
     - `app/shop-owner/page.tsx` & `app/shop-owner/booths/page.tsx`: Added Active/Inactive toggle in header and booth cards.
     - `app/owner/page.tsx`: Added booth owner Stall Open / Closed toggle button (`h-9`) with `Power` icon.

2. **Button Size Standardization & Logo-Only Space Saving**:
   - Primary action buttons: standardized to uniform `h-9` height across owner, shop-owner, menu, orders, and booths pages.
   - Action icon buttons: standardized to uniform `h-8 w-8` icon buttons on booth cards, shop cards, dish edit cards, etc.
   - Item / list actions: standardized to uniform `h-7 w-7` icon buttons (sold out refund, revoke member, copy link, remove invite).
   - Refresh buttons: standardized to uniform `h-9 w-9` icon-only buttons with `RefreshCw` and accessible `title`/`aria-label`.
   - Used logo-only buttons where possible to save valuable horizontal space on mobile devices.

3. **Single-Line Description Rule**:
   - Added single-line truncation (`truncate`) across shop, stall, booth, and dish descriptions, card subheadings, and headers across `components/shop-detail-client.tsx`, `components/home-page.tsx`, `app/shop/page.tsx`, `app/shop/[slug]/page.tsx`, `app/shop-owner/page.tsx`, `app/shop-owner/booths/page.tsx`, `app/owner/page.tsx`, `app/owner/menu/page.tsx`, and `app/owner/orders/page.tsx`.

4. **Safari WebKit AdBlock `e.useCache` Error Isolation**:
   - **Root Cause Analysis**:
     - Stack trace `undefined is not an object (evaluating 'e.useCache') at he (webkit-masked-url://hidden/:18:81058)` is caused by Safari's installed AdBlock extension (`/Applications/AdBlock.app/Contents/PlugIns/AdblockPlusSafari Extension.appex/Contents/Resources/ewe-content.js`).
     - Line 18, Column 81058 in `ewe-content.js` defines `function he(e)` which accesses `e.useCache` without null/undefined guards.
     - WebKit masks Safari extension URLs as `webkit-masked-url://hidden/` as part of Apple's anti-fingerprinting privacy protection.
     - Next.js development server (Turbopack) listens to `window.addEventListener('error')`, intercepting unhandled extension runtime crashes and presenting them in the red dev error modal.
   - **Resolution & Mitigation**:
     - Added early capturing `<head>` error interceptor in `app/layout.tsx`.
     - Calls `stopImmediatePropagation()` and `preventDefault()` exclusively on unhandled errors originating from masked extension scripts (`webkit-masked-url`, `chrome-extension`, `moz-extension`) or matching the AdBlock `useCache` bug.
     - Leaves all legitimate application errors and console diagnostics completely intact.

1. **Booth Slot Deletion with Relational Cascade Cleanup**:
   - **Database Migration (`supabase/migrations/014_delete_booth_slot.sql`)**:
     - Created `delete_booth_slot(p_booth_id UUID)` stored procedure with `SECURITY DEFINER`.
     - Validates caller ownership/manager permissions via `restaurant_memberships`.
     - Cascades deletions across `order_items`, `merchant_orders` (which had `ON DELETE RESTRICT` on `food_outlet_id`), `booth_invitations`, `merchant_memberships`, `merchant_handles`, `dishes`, and `food_outlets`.
     - Added owner DELETE policy for `food_outlets`.
   - **Backend API (`app/api/owner/booths/[id]/route.ts`)**:
     - Added authenticated `DELETE` method handler.
     - Calls `delete_booth_slot` RPC first, falling back to direct cascade queries if migration is not yet pushed.
   - **Operator Frontend (`app/shop-owner/booths/page.tsx`)**:
     - Added "Delete" button to each booth slot card.
     - Confirmation dialog with clear warnings, spinner, and error handling.
     - Triggers automated reload of shops and booth slots upon deletion.

2. **Booth Analytics Button & Focused Stall Spotlight**:
   - **Direct Navigation Links**:
     - In `app/shop-owner/booths/page.tsx`: Added "Analytics" button on every booth slot card (`/shop-owner/analytics?boothId=${booth.id}`) and "Venue Analytics" button in the page header.
     - In `app/shop-owner/page.tsx`: Added "Analytics" button next to every booth status badge in the food hall overview.
   - **Analytics Dashboard (`app/shop-owner/analytics/page.tsx`)**:
     - Wrapped client component in `<Suspense>` to support Next.js App Router static optimization with `useSearchParams()`.
     - Reads `boothId` query parameter with zero-cascading-render derived state pattern.
     - Added Stall Focus Filter dropdown in the header next to the timeframe switcher, with a 1-click "Clear" button.
     - **Booth Performance Spotlight**: Displays a dedicated spotlight banner when a stall is selected, featuring rank within venue, gross sales (RM) & venue contribution %, orders fulfilled & volume %, average spend per ticket, and real-time operational status (Active vs Idle).
     - **Interactive Leaderboard**: Stalls in the performance leaderboard are interactive; clicking a card focuses the booth spotlight and highlights the card with a distinct dark border, badge, and ring.

3. **Spicy Level 0-Index & Realtime Stall Overview Primary Tab (Phase 10)**:

3. **Zero Mock Policy Enforcement & Codebase Cleanup**:
   - Purged hardcoded dish arrays in `lib/search/fallback-data.ts`.
   - Removed silent fallback matches in `lib/search/search-service.ts` (returns `[]` cleanly if client unavailable).
   - Removed unused `createMockOrder` helper from `lib/order/cart.ts`.
   - Eliminated hardcoded form pre-fills from `app/subscribe/page.tsx`.
   - Ensured `components/home-page.tsx` loads stalls and dishes dynamically from `/api/outlets`.

4. **Customer Landing Page (`/customer`) Alignment**:
   - Replaced static food halls list with live dynamic data fetched from `GET /api/hawker-centres` (rendering `Lim's Foodcourt` with its stalls and specialties).
   - Removed "Order Food" / "Order" buttons from desktop header, mobile actions, and mobile drawer in `app/customer/page.tsx`.
   - Updated action buttons and hero links to "Explore Hawker Centres" pointing to `#food-halls`.

5. **Landing Page Showcase (`app/page.tsx`) Backend Realism**:
   - Replaced fabricated mock data ("Lot 10 Hutong", "Madam Kwan Nasi Lemak", "Ah Fatt Chicken Rice") with real backend entities:
     - Venue: `Lim's Foodcourt`
     - Operator View: Shows `Western` (Booth #01, Active Menu: Spaghetti RM 10.01) + `Booth Slot #02` through `#06` (Ready to Invite).
     - Kitchen View: Shows `Western` KDS with live ticket `Spaghetti` (RM 10.01) and order action controls.
     - Customer View: Shows table receipt for `Table 04 • Lim's Foodcourt` with `1x Spaghetti (Western - Booth 01)` (RM 10.01 + RM 0.50 platform fee = RM 10.51).
     - AI Search Queries: Aligned query intent with real dish `Spaghetti` from `Western`.
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
- **Price Input Acceptance & Validation Fix (`app/owner/menu/[id]/page.tsx` & `lib/owner/schema.ts`)**:
  - Fixed HTML5 constraint validation bug where `min="0.01"` combined with `step="0.10"` rejected whole numbers like `10` or `10.00` via browser `stepMismatch` error.
  - Changed price inputs to `min="0" step="any"`, allowing whole numbers (e.g. 10) and any valid decimal prices.
  - Updated validation to `Number(dish.price) > 0` and included `imageUrl` in initial dish save payload.
  - Updated `OwnerDishSchema` in `lib/owner/schema.ts` to allow both remote URLs and data URIs.
- **Customer App Dish Photo Rendering Fix (`components/home-page.tsx`, `components/menu-page.tsx`, `components/shop-detail-client.tsx`, `app/shop/[slug]/page.tsx`, `components/result-card.tsx`, `app/api/owner/dishes/[id]/image/route.ts`)**:
  - Added `imageUrl` to `FeaturedDish`, `MenuItem`, `ShopData`, and `SearchResultSchema`.
  - Explicitly passed `imageUrl` prop to `<DishCard>` across `/home`, `/menu`, and `/shop/[slug]` so uploaded dish photos are immediately visible in the customer app.
  - Updated `fetchShopBySlug` in `app/shop/[slug]/page.tsx` to query `image_url` and map it to `imageUrl`.
  - Added optional image banner rendering to `ResultCard` in `components/result-card.tsx` for search results with photos.
  - Enhanced `/api/owner/dishes/[id]/image` with `createAdminClient()` and an automatic base64 data URI fallback if Supabase Storage bucket access is restricted, ensuring uploaded dish photos are permanently saved and never lost.
- **Booth Slots 3-Column Responsive Grid (`app/shop-owner/booths/page.tsx`)**:
  - Upgraded Booth Slots & Access layout from a single-column stack into a 3-column responsive grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5`).
  - Optimized vendor email input, send setup link button, and feedback notifications to fit compactly in 3-column card widths.
  - Made authorized store manager and pending invitation tokens responsive with concise action buttons (`Copy`, `Revoke`, `Remove`).
- **Docs Cleanup & API Endpoints Documentation (`docs/endpoints.md`)**:
  - Removed obsolete and empty markdown files (`docs/fixes.md` and `docs/mainpage.md`).
  - Authored a comprehensive endpoint specification at `docs/endpoints.md` covering all 28 API operations across 21 App Router route handlers.
  - Documented HTTP methods, access tiers (Public, Diner, Stall Merchant, Shop Owner), request schemas, success response formats, and error codes.
  - Updated `README.md` to reference the central endpoint catalog.

- **Phase 16: Percentage Charge, Dynamic Centre Slug Routing, and Nearby Hawker Centres Map**:
  - **Charge by Percentage & Monetization Settings**:
    - **Database Migration 017 (`supabase/migrations/017_restaurant_coordinates_and_fees.sql`)**: Updated `restaurants` table with GPS coordinates (`888-restoran`: `3.1432, 101.6985`, `lim-s-foodcourt`: `3.1465, 101.7015`).
    - **Backend APIs (`app/api/owner/shops/[id]/route.ts` & `app/api/owner/shops/route.ts`)**: Supported `fee_payer`, `platform_fee_fixed`, and `platform_fee_percent` in GET and PATCH handlers.
    - **Shop Owner UI (`app/shop-owner/profile/page.tsx`)**: Built Monetization & Charge Settings card supporting Percentage, Flat Fee, and Mixed modes with live RM 20.00 simulator.
    - **Cart & Order Engine (`lib/order/cart.ts` & `app/api/orders/route.ts`)**: Authoritative calculation for percentage fees (`subtotal * feePercent + feeFixed`), dynamic fee labels in `CartSummary`, and 100% test coverage in `lib/order/cart.test.ts`.
  - **Dynamic Hawker Centre Route Resolution (`/[centreSlug]` & `/[centreSlug]/home`)**:
    - Implemented `resolveHawkerCentreBySlug` in `lib/hawker-centres/service.ts` with heuristic fuzzy matching for slugs (`restaurent888` -> `888 Restoran`, `lim'shawker` -> `Lim's Foodcourt`).
    - Guarded against static reserved paths (`RESERVED_CENTRE_SLUGS`).
    - Created `components/centre-diner-page.tsx` for centre-specific diner ordering (QR table sessions, stall filtering, menu browsing, and cart).
    - Created `app/[centreSlug]/page.tsx` and `app/[centreSlug]/home/page.tsx` to handle direct customer links.
  - **Customer Home Tab Redesign with Interactive Map (`components/home-page.tsx` & `components/hawker-map.tsx`)**:
    - Replaced old single-centre ordering UI on `/home` with a mobile-first Map and nearby hawker centres directory.
    - Built zero-external-dependency interactive OpenStreetMap map (`HawkerMap`) with Web Mercator coordinates projection, touch/mouse dragging, zoom controls, live geolocation radar marker, and centre pins.
    - Haversine distance calculation and walking time estimation to sort centres by proximity.
    - Search bar and filters to quickly find hawker centres by name, area, or dish specialties.

- **Phase 18: 5-Tab Customer Navigation, Clean CARTO Positron Basemap, and Background GPS Polling**:
  - **5-Tab Customer Navigation Architecture (`components/customer/customer-shell.tsx` & `components/shared/client-bottom-nav.tsx`)**:
    - Expanded bottom navigation to 5 unified customer tabs:
      1. `Home` (`/home`): Full-screen map (100vw x 100vh) + floating top search + swipe-up bottom sheet list ranked by shortest distance.
      2. `Stall` (`/stall`): Displays stalls directory with ETA per stall. Clicking a stall opens its store-specific food menu (`/shop/[slug]`).
      3. `Menu` (`/menu`): Displays all food items available across the hawker centre, organized by category (Main Course, Drinks, Desserts), search, dish cards, customizations, and floating cart bar.
      4. `Orders` (`/orders`): Diner order history and live order tracking.
      5. `Profile` (`/profile`): Diner account management and authentication settings.
    - Updated `client-bottom-nav.tsx` with dynamic `grid-cols-5` support and compact mobile spacing (`px-0.5 sm:px-1`) to ensure optimal touch targets on all mobile screen sizes.
  - **Clean CARTO Positron Basemap & Watermark Fix (`components/hawker-map.tsx`)**:
    - Replaced basemap tile URL with CARTO Positron: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` with subdomains `['a', 'b', 'c', 'd']`.
    - Added high-DPI retina tile resolution support (`@2x.png`).
    - Extended maximum zoom level to `20` (`maxZoom: 20`).
    - Fixed the "API KEY REQUIRED" watermark while delivering a sleek, light-grey map aesthetic.
  - **Background GPS Polling with Visibility Guard (`components/home-page.tsx`)**:
    - Implemented background `navigator.geolocation` polling interval (every 5 minutes).
    - Added `document.visibilityState` lifecycle listener to pause timers when hidden and immediately refresh upon tab focus.
    - Re-evaluates Haversine distances and real-time proximity rankings on every location update.
  - **Stall & Menu Components Restoration (`components/customer-stall-page.tsx` & `components/menu-page.tsx`)**:
    - Restored `CustomerStallPage` to display all active stalls with ETA badges (`ETA 10 min`, `ETA 15 min`), status badges (`Open`, `Busy`, `Closed`, `Prep Shift`), specialty descriptions, and menu dish counts.
    - Added quick search and filter chips (All, Open Now, Fast ETA).
    - Configured direct store menu links `/shop/${slug}`.
    - Preserved table session indicator and QR camera scanner shortcut.
    - Added floating cart order bar with subtotal and item count.

- **Phase 19: Cross-Centre Cart Isolation, Zero-Border Mobile UI Redesign, and Voice AI Agent (`use-cart-add.tsx`, `components/floating-ai-widget.tsx`)**:
  - **Cross-Centre Cart Isolation**:
    - Built a strict multi-centre cart isolation rule. The app throws a warning modal before adding items if the customer attempts to mix food from two different hawker centres (physically impossible delivery).
    - Added custom hook `use-cart-add.tsx` with a pending state buffer and `CartWarningModal` wrapper, replacing direct `addItemToCart` calls site-wide.
  - **Clean Zero-Border UI Design**:
    - Swept all cards, list view items, and interactive components. Removed `border`, `ring`, and squashed flex items to comply strictly with pure white/black palette.
    - Ensured `min-w-0 flex-1` on items allowing cart text truncation to avoid squashed layout.
    - Removed arbitrary UI background coloring from the search bar.
  - **Floating Voice AI Agent (`FloatingAiWidget`)**:
    - Implemented a global floating action button allowing diners to hold-to-record voice or tap-to-chat.
    - Real-time `SpeechRecognition` records voice input on button hold.
    - Integrated Vercel AI SDK 4.x streaming natural language commands to `app/api/ai-chat/route.ts` via OpenRouter `google/gemini-1.5-pro`.
    - Configured `addToCart` tool execution natively resolving the `SearchService` to return dishes directly to the client which programmatically triggers cart additions.

- **Phase 20: Anonymous Guest Mode & Guest Checkouts**:
  - Overhauled authentication flow in `components/auth-provider.tsx` to assume guest mode (`isGuest: true`) by default for all unauthenticated users.
  - Removed strict route redirect traps on `/orders` and `/stall` by bypassing them in guest mode.
  - Wrote DB migration `021_guest_orders.sql` to drop `NOT NULL` constraint on `orders.customer_id`, allowing completely anonymous order creation.
- **Phase 21: Stall Allocation UI Simplification & Soft Deletes (`shop-owner/booths`)**:
  - Removed bloated wordings and operating schedule configurations from the center owner's interface, strictly streamlining the layout to manage vendor access and active states. (Note: Restored venue-level operating hours schedule).
  - Reduced stall overrides to a singular "Active/Inactive" toggle for the center owner. Added a confirmation prompt notifying that setting a stall inactive will take effect at 3:00 AM the following morning.
  - Implemented a "Soft Delete" mechanism for booths: updated the database migration (`022_soft_delete_booths.sql`) and `delete_booth_slot` RPC (`023_update_delete_booth_rpc.sql`). Deleting a stall now simply strips vendor access immediately and flags the data as `deleted_at = NOW()`, preserving the data for one year of recovery instead of performing a hard destructive deletion.
  - **Phase 22: Venue Hours & Stalls Management Overhaul (`shop-owner/booths`)**:
  - Removed remaining bloated headings and descriptions from the Stalls Management page (such as "Stall Allocation" and "Authorized Store Access") for an ultra-minimal look.
  - Simplified the "Send Setup Link" input block by removing its grey background container and reducing the text prompt to just an input placeholder.
  - Polished the `OperatingScheduleModal`: 
    - Removed extraneous description strings.
    - Simplified the "Apply Monday to all days" button.
    - Fixed scrolling issues by changing the sticky footer background to solid white instead of off-white.
    - Updated primary buttons to adhere strictly to the Apple 44px (`h-11`) standard shape.

## Current Architecture
- Frontend: Next.js App Router, TypeScript, React, Tailwind
- Customer Navigation: 5-Tab Architecture (Home, Stall, Menu, Orders, Profile) with floating cart checkout pill
- Map: Zero-dependency CARTO Positron canvas tiles with subdomains abcd, maxZoom 20, retina support, and no API key watermarks
- Geolocation: 5-minute background polling with `document.visibilityState` guard and automatic proximity sort
- AI boundary: OpenRouter via Vercel AI SDK for `SearchIntent` extraction only
- Backend: route handlers, deterministic `SearchService`, and payment refund handlers
- Database: Supabase/PostgreSQL with raw SQL migrations (001-017), generated-style TypeScript types, RLS, and fallback data paths
- Security: AI never touches SQL or database access directly; merchant isolation verified via memberships before processing refunds; booth activation is strictly invite-only
- Monetization: Configurable platform fee models per venue (percentage rate, flat fee, or mixed), payable by diner or deducted from merchant payout

## Important Decisions
- AI output is validated with Zod before it can affect backend logic
- Search remains deterministic and database-backed when credentials are present
- Dynamic centre slug matching resolves typos and colloquial names (e.g. `restaurent888` and `lim'shawker`) to verified hawker centre records
- Customer Home tab is dedicated to geographic food hall discovery and map-based exploration; specific venue menus are served on dynamic centre paths `/[centreSlug]/home`
- Platform Monetization: Support for percentage fee cuts (e.g. 5%, 8%) alongside flat fee rates (RM 0.50), dynamically persisted per food hall and simulated in real time for operators
- 5-tab customer layout separates venue-level discovery (`Home`), stall-level directory (`Stall`), food-level full menu (`Menu`), order tracker (`Orders`), and diner settings (`Profile`)

## Known Issues
- Password recovery depends on Supabase Auth email configuration
- Live Stripe/HitPay/Curlec transactions require live API credentials in production; local sandbox fallback provides smooth development and demo testing

- **Phase 23: Stall Payouts Integration**:
  - Added `airwallex_account_id` column to the `food_outlets` table to capture Airwallex connected account IDs for stall payout routing.
  - Wrote DB migration `024_add_airwallex_account_id.sql` and updated `lib/database.types.ts`.
  - Updated the `/api/user/roles` API and `AuthContextType` to surface the connected account ID to the frontend.
  - Implemented a "Payment & Payouts" section in the Stall Owner profile page (`app/(stall)/owner/profile/page.tsx`) to allow stall owners to save their Airwallex Account ID.

- **Phase 24: Stall Rent Collection**:
  - Created `rent_invoices` table via migration `025_rent_invoices.sql` to manage rent billing from the venue to stall owners.
  - Added a "Charge Rent" button in the Center Owner's Booth management UI (`app/(center)/shop-owner/booths/page.tsx`) which issues a rent invoice.
  - Created `/api/owner/rent` and `/api/owner/rent/[id]/pay` route handlers for creating, fetching, and paying invoices.
  - Implemented the `RentInvoices` UI component for stall owners to view their pending rent bills and seamlessly pay via Airwallex Drop-in on the frontend.

- **Phase 25: Cart fee calculation reflection & fix customer page ui bug**:
  - Dynamically load platform fee percentage config from database in the customer cart page to accurately render service fee subtotal and amounts.
  - Added UI guard for `aiEnabled` settings in the stall page camera widget display.

## Next Task
- End-to-end user checkout and verify realtime multi-stall kitchen routing and sold-out refund synchronization.

