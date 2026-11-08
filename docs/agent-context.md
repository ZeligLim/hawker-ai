# Agent Implementation Context

## Phase 1: Audit
- Examined project structure and package dependencies.
- Identified API routes (`src/app/api`) containing mixed business logic, direct database calls, and backend validations, which violates the strict frontend/backend boundary.
- Discovered components importing backend services/types improperly (e.g. `HawkerCentreSummary`).
- Found disorganized `lib` folder with mixed client/server/shared types.

## Phase 2: Architecture
- Established boundaries:
  - `src/app/`: UI Pages & API endpoint shells
  - `src/features/`, `src/components/`, `src/hooks/`: Frontend elements
  - `src/server/services/`, `src/server/repositories/`, `src/server/auth/`, `src/server/integrations/`: Strict backend isolation
  - `src/shared/types/`, `src/shared/schemas/`, `src/shared/constants/`: Universal types/schemas
  - `src/lib/api-client/`: API fetching utils
- Defined strict rules that UI components should only import from `src/shared/` or `src/lib/api-client/` but never from `src/server/`.

## Phase 3: Refactoring
- **Authentication**: Extracted `src/lib/auth-rbac.ts` into `src/server/auth/rbac.ts`. Created `src/server/services/user-service.ts` to own database calls previously inside `src/app/api/user/roles/route.ts` and `src/app/api/user/delete/route.ts`.
- **Hawker Centres**: Moved `src/lib/hawker-centres/service.ts` into `src/server/services/hawker-centres/service.ts`. Decoupled frontend types into `src/shared/types/hawker-centre.ts`.
- **Menu Management**: Extracted dish fetching and creation from API routes to `src/server/services/menu-service.ts`. Extracted booth creation to `src/server/services/booth-service.ts`.
- **Shopping Cart & Orders**: Extracted complex subtotal/platform fee math and order creation RPC invocation from `src/app/api/orders/route.ts` into `src/server/services/order-service.ts`.
- **Payments**: Abstracted `src/lib/payment` into `src/server/integrations/payment` to isolate payment providers on the backend.
- **Analytics**: Migrated metrics and platform fee analytics queries from API routes to `src/server/services/analytics-service.ts`.
- **Shared Data**: Migrated `schema.ts` from `search`, `session`, `owner`, and `order` folders into `src/shared/schemas/`. Realigned `src/shared/constants/permissions.ts`.

## Phase 4: Security
- **Tenant Isolation**: Retained strict RLS and authorization wrappers (e.g. `merchant_memberships` and `restaurant_memberships` matching).
- **Service Boundaries**: Ensured that the `createAdminClient` usage remains strictly in `src/server/` and isn't imported into UI environments.

## Phase 5: Cleanup and Verification
- Ran complete TypeScript checks (`tsc --noEmit`). Fixed all type boundary breakages and missing `any` declarations.
- Ran eslint checks (`eslint .`). Handled `react-hooks/set-state-in-effect`, unescaped UI strings, and immutable hook bugs.
- Triggered Next.js production build (`next build`) to guarantee absolute zero regressions.
- Removed vestigial Git artifact files (`.orig` and `.rej`).

## Phase 6: Automated Testing & Security Audit
- Setup native Node test runner execution via `tsx` to support Next.js path aliases (`@/*`).
- Verified strict tenant isolation boundaries on menu and order services (preventing unauthorized cross-stall modifications or reads).
- Handled UI linting issues causing hydration warnings (e.g. `set-state-in-effect`).

## Phase 7: Marketplace Payment Testing & Security Fixes
- Conducted payment readiness assessment exposing vulnerabilities in webhook validation and input calculation limits.
- **Fixed Negative Quantity Vulnerability**: Bound order items to positive constraints inside `order-service.ts` before cart insertion.
- **Fixed Multi-Stall Commission Bug**: Refactored `createOrder` in `order-service.ts` to calculate `platform_fee` dynamically *per stall* rather than erroneously assigning a global payout to every `merchant_orders` row.
- **Consolidated Checkout Architecture**: Removed duplicate, hardcoded database logic in `api/payment/route.ts`. The route now properly delegates all checkout verification to `order-service.ts`.
- **Fortified Webhooks**: Added strict SHA-256 HMAC cryptographic signature validation (`x-mock-signature`) to `mock-provider.ts` to prevent blind forgery of `PAID` statuses.
- **Pilot Readiness**: The single-stall application pilot architecture is safe and technically sound with the new boundaries implemented.

## Phase 8: UI Updates
- Removed the customer `/home` page entirely.
- Customer sign-in defaults to the public landing page; table ordering is entered through centre- and table-specific QR links.
- Removed references to the `HomePage` component and the `/home` route in multiple places including navigation, redirects, and guards.

## Phase 9: React Best Practices Optimization & Code Quality Audit
- Executed full Vercel React Best Practices compliance update (`.agents/skills/vercel-react-best-practices/SKILL.md`).
- **Eliminated Waterfalls**: Parallelized DB queries via `Promise.all` in `menu-service.ts`, `user-service.ts`, and `analytics-service.ts`.
- **Bundle Size Optimization**: Enforced `next/dynamic` for heavy client-side AI components (`FloatingAiWidget`).
- **Render Optmizations**: Removed inline React Component declarations from hook return values (`useCartAdd`) to stop child re-mount thrashing.
- **Linter Safety**: Stabilized missing `react-hooks/exhaustive-deps` (stale closures) explicitly across `scan/page.tsx`, `orders/page.tsx` with clean `React.useCallback` wrapping.

## Phase 10: AI Removal, Loading States & Table QR Generation
- Wiped out legacy AI Menu Scanner and AI features across the DB schemas, API routes, and components.
- Standardised UI Loading states (`PageLoader`, `ComponentLoader`, `ButtonLoader`, `SkeletonLoader`) replacing custom inconsistent spinners globally.
- Created `api/owner/tables` and `/shop-owner/tables` allowing Centre Owners to spawn tables natively linked to `hawker_tables`.
- Added QR code generation (`qrcode.react`) and Print/Save functionality for Centre Owners.
- Table QR codes link directly to the centre menu with the table ID in the URL; diners use the iPhone camera to open that link.

## Phase 11: Simplified Order Management and Cancellation Workflow
- Removed all obsolete payment integrations, checkouts, and backend gateways for V1.
- Restructured `merchant_orders` and `orders` to follow strict standard statuses (PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED).
- Established a `CANCELLATION_REQUESTED` and `CANCELLED` workflow with backend validations.
- Enabled stall owners to directly Accept or Reject a customer's cancellation request, gracefully reverting to the order's `previous_status` upon rejection.
- Executed strict compliance sweep across UI guidelines (removing borders, hover boundaries, standardizing heights).
- Passed final unit testing, build (`next build`), and typechecks.

## Phase 12: Hawker Centre Analytics Calendar View & Table QR Sticker Generator
- **Route & Directory Restructuring**:
  - Created `/hawker/[hawker-slug]/analytics` (`src/app/(center)/hawker/[hawker-slug]/analytics/page.tsx`).
  - Updated `src/app/(center)/shop-owner/analytics/page.tsx` to automatically redirect users to their owned hawker centre analytics route (`/hawker/[hawker-slug]/analytics`).
  - Updated `src/components/owner/owner-shell.tsx` bottom navigation to dynamically target the active hawker centre's analytics URL.
  - Updated `PermissionEngine.getClientForPath` and permissions tests so `/hawker/...` paths belong to the `owner` client app.
  - Added `'hawker'` to `nonCentreRoutes` and `RESERVED_CENTRE_SLUGS`.
- **Calendar View System (Stall App Alignment)**:
  - Built `HawkerCalendar` (`src/components/hawker/hawker-calendar.tsx`) featuring the same unified Day / Month / Year calendar view as `StallCalendar`.
  - Added live monthly grid showing daily revenue figures (e.g. `RM 1.2k`), order counts, and date selection.
  - Added Day view order breakdown with stall badges, time, line items, and totals.
  - Added stall focus dropdown filter to view combined hawker centre totals or isolate individual stall revenue.
  - Integrated Supabase realtime updates on `merchant_orders`.
- **Table QR Generation & Physical Sticker Downloads**:
  - Integrated table management directly into the analytics view.
  - Added physical sticker preview simulating the card to be pasted on dining tables.
  - Implemented high-resolution PNG canvas export (`Download Table QR (PNG)`) formatting venue header, table number badge, high-contrast QR code, and diner scan instructions ready for printing.
  - Implemented direct single-sticker and batch print functionality (`Print All QRs`).

### UI Guidelines: No Top Headers on Operational / Calendar Views
- **Strictly do not add top page headers** (e.g. `<header>` tags with banners, badges such as 'Venue Analytics & Tables', or outer venue title headers) above calendar or operational views.
- Calendar views must mount directly into the clean card container (`<section className="rounded-[24px] bg-white p-4 sm:p-6">`), starting immediately with the period navigator and toolbar controls, identical to the Stall App view (`StallCalendar`).
- Any venue or stall switchers must be integrated cleanly within the inline toolbar controls inside the card, rather than in an external header banner.
