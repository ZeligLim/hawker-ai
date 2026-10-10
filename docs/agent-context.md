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

## Next Task
- Project refactoring complete. Maintain this modular structure moving forward. All feature additions should follow the new strict frontend/backend service extraction strategy.
