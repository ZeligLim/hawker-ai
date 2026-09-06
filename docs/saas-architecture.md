# Hawker SaaS Ownership Architecture

## 1. Current architecture assessment

The current codebase already has the right building blocks for a multi-tenant shop-and-booth model:

- `restaurants` already represents the top-level shop / venue / SaaS tenant.
- `food_outlets` already represents a stall or booth within a shop.
- `merchant_memberships` already models a user-to-booth relationship with a role.
- `orders`, `merchant_orders`, and `order_items` already model parent-order and stall-level accountability.
- Owner APIs and UI already operate in a booth-level model (`/owner`, `/owner/menu`, `/owner/orders`).
- Supabase Auth and RLS are already the correct security boundary.

This means the safest path is not a wholesale replacement. The project should evolve its authorization model rather than rewrite the transactional model.

### Reuse decisions

- Keep `restaurants` as the shop/tenant root.
- Keep `food_outlets` as the booth.
- Keep `orders` and `merchant_orders` as the customer and stall accounting model.
- Keep `merchant_memberships` for booth ownership, because current owner APIs, storage policies, and order access checks are already designed around it.
- Add a separate shop-level membership table instead of overloading `merchant_memberships` with a second meaning.

### Why not force `merchant_memberships` to become both shop and booth membership?

Because the table is already used in existing authorization checks such as:

- dish creation/update permissions
- merchant order access
- menu ownership
- dish image upload policies
- storefront membership lookups

Making it dual-purpose would create ambiguous semantics and risk crossing boundaries between shop-wide and booth-specific permissions.

---

## 2. Proposed architecture

### Core entity model

```text
User
├── restaurant_memberships (shop scopes)
│   └── Restaurant / Shop
│       ├── shop settings
│       ├── booth roster
│       ├── shop-wide orders
│       └── subscription
│
├── merchant_memberships (booth scopes)
│   └── Food Outlet / Booth
│       ├── menu
│       ├── dish availability
│       ├── booth orders
│       └── booth analytics
│
└── customer orders
    └── orders / merchant_orders / order_items
```

### Recommended V1 interpretation

```text
Restaurant = SaaS tenant + shop-level business entity
Food Outlets = booths within a shop
User = one identity with multiple membership records
Shop Owner = restaurant_membership with role owner/manager
Booth Owner = merchant_membership with role owner/manager on a booth
```

### Database boundary

```text
restaurants
  - id
  - name
  - slug
  - address
  - status
  - subscription_status
  - created_by
  - created_at

food_outlets
  - id
  - restaurant_id
  - name
  - status
  - description
  - created_by
  - created_at

restaurant_memberships
  - id
  - user_id
  - restaurant_id
  - role
  - invited_by
  - created_at

merchant_memberships
  - user_id
  - food_outlet_id
  - role
  - created_at
```

The difference is intentional:

- `restaurant_memberships` answers: "What shops does this user manage?"
- `merchant_memberships` answers: "What booths does this user manage?"

This keeps the models separate and database-driven.

---

## 3. Entity relationship model

```text
restaurants
  1 ───< food_outlets
  1 ───< restaurant_memberships
  1 ───< subscriptions
  1 ───< booth_invitations

food_outlets
  1 ───< dishes
  1 ───< merchant_memberships
  1 ───< merchant_orders

orders
  1 ───< merchant_orders
  1 ───< order_items

users
  1 ───< restaurant_memberships
  1 ───< merchant_memberships
```

### Shop profile

`restaurants` is the natural owner of:

- shop name and branding
- address and map metadata
- shop status (`active`, `trial`, `paused`, `suspended`)
- billing/subscription relationship
- shop dashboard and shop-wide analytics

### Booth profile

`food_outlets` is the natural owner of:

- booth name
- booth status
- booth owners and staff
- booth menu
- booth orders and analytics

A booth must belong to exactly one restaurant.

---

## 4. Membership model

### Recommended V1 choice

Do not replace `merchant_memberships` immediately.

Instead add `restaurant_memberships` and keep `merchant_memberships` as the booth-scoped permission table.

### Why this is the safest model

1. Existing code already uses `merchant_memberships` for booth authorization.
2. A single `merchant_memberships` table cannot express a user who is owner of a shop and also owner of a booth without generating confusing role semantics.
3. `restaurant_memberships` clarifies the business ownership hierarchy.
4. It preserves backward compatibility and keeps the current consumer app working.

### Example role model

```text
restaurant_memberships.role in ('owner', 'manager', 'staff')
merchant_memberships.role in ('owner', 'manager', 'staff')
```

Where `role` is evaluated in context:

- shop role controls restaurant management
- booth role controls outlet management

### Example data model

```text
User A -> restaurant_memberships(restaurant_id=X, role='owner')
User A -> merchant_memberships(food_outlet_id=Booth1, role='owner')

User B -> merchant_memberships(food_outlet_id=Booth1, role='owner')

User C -> restaurant_memberships(restaurant_id=X, role='owner')
User C -> merchant_memberships(food_outlet_id=Booth2, role='owner')
```

This supports the required case where a user is both shop owner and booth owner with one account.

---

## 5. Shop owner permissions

A shop owner should be able to do all shop-level tasks across the admin domain.

### Recommended shop owner permissions

```text
Shop
├── View dashboard
├── View all booth orders
├── View shop-wide analytics
├── Manage shop profile
├── Create booth
├── Edit booth
├── Deactivate booth
├── Generate booth invite
├── Manage booth members
├── View shop subscription status
├── View shop revenue and sales totals
└── Manage shop settings
```

### Recommended V1 behavior for booth access

A shop owner should not automatically be able to modify every booth menu unless they also hold a booth-specific membership.

Recommended V1 rule:

- shop owners can view all booth orders, dashboard data, and analytics within their restaurant
- shop owners can manage booth members and booth metadata
- shop owners can manage a booth's menu only if they are also granted booth ownership or booth-manager access on that specific outlet

This preserves a clean separation between shop-level authority and booth-level operational ownership.

---

## 6. Booth owner permissions

A booth owner should be restricted to one outlet.

### Recommended booth owner permissions

```text
Booth
├── View dashboard
├── Manage menu
├── Create dishes
├── Edit dishes
├── Toggle availability
├── Upload images
├── View booth orders
├── Update order status
├── View booth analytics
├── Manage booth profile
└── Manage booth staff members
```

### Security rule

A booth owner must never be able to query or edit another booth's data.

This should be enforced by RLS and by scoped API queries, not by UI-only checks.

---

## 7. Shop owner also being booth owner

This is a key requirement and should be handled as a single user with multiple memberships, not two separate identities.

### Recommended behavior

When Alice logs in:

- she has one Supabase Auth account
- the system resolves all of her roles from `restaurant_memberships` and `merchant_memberships`
- she sees a single `Owner` app shell
- she can choose the scope she is working in: shop or booth
- shop permissions are available if she has a restaurant membership
- booth permissions are available if she has a booth membership

### UI design recommendation

Prefer a single Owner/Merchant Mode with context switching, not two separate modes.

Example:

```text
Owner app
├── Selected scope: ABC Hawker Centre / Alice Noodles
├── Switch shop/booth context
├── Dashboard
├── Booths
├── Orders
├── Menu
├── Analytics
├── Settings
```

This avoids duplicate accounts and keeps the user model simple.

---

## 8. Booth invitation system

A booth invitation is a shop-scope operation, not a customer-flow feature.

### Recommended flow

```text
Shop Owner
  ↓
Create Booth
  ↓
Generate Invite
  ↓
Token (e.g. X7K9-PQ2M)
  ↓
Booth owner enters token
  ↓
Validate token and merchant membership
  ↓
Join booth
```

### Recommended schema

```text
booth_invitations
  id UUID PK
  restaurant_id UUID NOT NULL FK restaurants(id)
  food_outlet_id UUID NOT NULL FK food_outlets(id)
  created_by UUID NOT NULL FK auth.users(id)
  token_hash TEXT NOT NULL
  expires_at TIMESTAMPTZ NOT NULL
  used_at TIMESTAMPTZ NULL
  used_by UUID NULL FK auth.users(id)
  revoked_at TIMESTAMPTZ NULL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Security design

- Do not store plaintext invite tokens in the database.
- Store a hash using a secure, one-way hash (e.g. argon2/bcrypt-like suitable server-side hashing or a secure HMAC scheme depending on deployment preferences).
- Prefer single-use invites.
- Expire invites automatically.
- Restrict token validation to the intended `food_outlet_id`.
- Ensure the token can only grant access to one booth.
- Require that invitation creation is only possible by a user with restaurant-level `owner` or `manager` rights.
- Revoke or rotate tokens if the booth or shop changes ownership.

### Later extension

QR-code invite generation is not required for V1, but the schema should be flexible enough to support it later without redesigning the ownership model.

---

## 9. Subscription architecture

The subscription belongs to the shop / restaurant, not to the individual booth owner.

### Recommended conceptual model

```text
Restaurant
  ↓
Subscription
```

### Recommended table design

```text
subscriptions
  id UUID PK
  restaurant_id UUID NOT NULL FK restaurants(id)
  plan TEXT NOT NULL
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'paused'))
  billing_customer_id TEXT
  provider TEXT DEFAULT 'stripe'
  provider_subscription_id TEXT
  current_period_start TIMESTAMPTZ
  current_period_end TIMESTAMPTZ
  cancelled_at TIMESTAMPTZ NULL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Authorization rule

Shop access should be gated by:

```text
user -> restaurant_memberships -> restaurant -> subscription
```

The subscription is not a per-user capability. It is a tenant-level capability.

### V1 decision

Do not implement a payment provider yet. Instead, create the schema boundary and status model so Stripe or another provider can be integrated later without breaking the SaaS model.

---

## 10. RLS security model

RLS is the primary security boundary. Browser code must not contain service-role keys and should not manipulate authorization directly.

### Recommended policy model

#### restaurants
- Public read access may remain for storefront or directory pages that intentionally expose restaurant metadata.
- Only restaurant owners/managers with a valid `restaurant_memberships` record can update shop settings.

#### food_outlets
- Public read access remains acceptable for public storefront listing.
- Only restaurant owners/managers or explicit booth owners may modify booth settings.

#### restaurant_memberships
- Users can view their own memberships.
- Shop owners/managers can view other restaurant members for their own restaurant.
- Only a shop owner/manager can invite or revoke membership records for that restaurant.

#### merchant_memberships
- Users can view their own booth memberships.
- Booth owners/managers can view members for their own booth.
- A shop owner with explicit restaurant permission may manage booth members only when the booth belongs to their restaurant.

#### booth_invitations
- Only a shop owner/manager for that restaurant may create or revoke invites.
- Invite validation is scoped to the invited `food_outlet_id` and `restaurant_id`.
- Once used, the invite becomes invalid.

#### dishes
- Public read remains acceptable for menu browsing.
- Only booth owners/managers or restaurant owners with explicit booth-level access may create/update dishes for the relevant booth.

#### orders
- Customers can read only their own orders.
- Booth owners/managers can read only orders associated with their booth via `merchant_orders` and `order_items`.
- Shop owners can view shop-wide order sets if the restaurant membership is authorized.

#### merchant_orders
- Customer may read only merchant orders linked to their own orders.
- Booth owners may read only orders for their booth.
- Shop owners may read all merchant orders for the restaurant if permitted by the permission model.

#### order_items
- Customer may read only their own order items.
- Booth owners/managers may read only the items for their booth.

#### subscriptions
- Only restaurant owners/managers can view and manage the restaurant's subscription data.

### AI boundary

The AI must never receive direct database authorization or query rights. It remains a structured-intent parser only and must continue to work through validated API inputs rather than direct SQL or Supabase calls.

---

## 11. SaaS onboarding flow

### Shop owner onboarding

```text
Marketing Website
  ↓
Sign Up
  ↓
Create shop / restaurant
  ↓
Create restaurant_membership
  ↓
Choose a subscription or trial
  ↓
Shop dashboard
  ↓
Create booth
  ↓
Invite booth members
```

### Booth owner onboarding

```text
Sign Up / Login
  ↓
Enter Booth Invite Token
  ↓
Validate token and restaurant/booth match
  ↓
Create merchant_membership
  ↓
Booth dashboard
```

### Edge cases

- If the user already has an account: attach new membership record instead of creating a second account.
- If user already belongs to another booth: allow additional booth membership as long as the permission model is valid.
- If invite expires: show a retry flow and let the shop generate a new token.
- If invite is used: mark as used and prevent re-use.
- If user is already a booth member: show a friendly "already joined" result.
- If user is already a shop owner: allow custom dashboard access and booth invite creation.
- If shop subscription is inactive: show a soft lock state for shop-level actions but do not break public storefront browsing.

---

## 12. UI / navigation design

The current owner app already has a booth-led shape:

```text
Dashboard
Orders
Menu
Profile
```

That should be evolved, not replaced.

### Recommended V1 navigation

```text
Owner
├── Dashboard
├── Booths
├── Orders
├── Menu
├── Analytics
├── Settings
```

### Recommended UX behavior

- The app should show a single owner shell.
- When a user has multiple scopes, the UI should let them switch the active shop or booth context.
- The dashboard can show either:
  - shop overview when a shop is selected
  - booth overview when a booth is selected
- `Booths` should list all booths for the selected shop.
- `Menu` and `Orders` should be context-aware to the selected booth.
- `Analytics` should allow shop-level or booth-level filtering.
- `Settings` should include both shop settings and the user's memberships.

### V1 rule

Keep one app shell and one account. Do not create separate shop-owner and booth-owner applications.

---

## 13. API architecture

The existing owner APIs are a good base. The new architecture should add shop-scoped endpoints without disrupting booth-scoped APIs.

### Recommended API families

```text
/api/owner/shop
/api/owner/booths
/api/owner/booths/[id]
/api/owner/booths/[id]/invite
/api/owner/booths/join
/api/owner/members
/api/owner/analytics
```

### Example endpoint contract

#### GET /api/owner/shop
- Purpose: fetch the current restaurant and its summary state
- Auth: required
- Authorization: restaurant owner/manager or accepted restaurant membership
- Input: none
- Output: restaurant object, active booth list, membership summary, subscription status
- DB ops: read `restaurants`, `restaurant_memberships`, `food_outlets`, `subscriptions`

#### POST /api/owner/booths
- Purpose: create a booth in a shop
- Auth: required
- Authorization: shop owner/manager
- Input: `{ name, description, status }`
- Output: created booth record
- DB ops: insert into `food_outlets`, create booth membership if needed

#### POST /api/owner/booths/[id]/invite
- Purpose: create a limited-use booth invite
- Auth: required
- Authorization: shop owner/manager for the restaurant owning the booth
- Input: `{ expiresInHours, role }`
- Output: invite metadata without plaintext token
- DB ops: write `booth_invitations` row with hash, expiration, and metadata

#### POST /api/owner/booths/join
- Purpose: accept an invite and become a booth member
- Auth: required
- Authorization: authenticated user only
- Input: `{ token }`
- Output: membership status and joined booth info
- DB ops: validate hash, check expiry, verify booth/restaurant match, insert `merchant_memberships`

#### GET /api/owner/analytics
- Purpose: fetch shop-level or booth-level analytics depending on selected scope
- Auth: required
- Authorization: restaurant owner/manager or booth owner for the targeted booth
- Input: `{ scope: 'shop' | 'booth', boothId? }`
- Output: totals, order count, sales by booth, time-bucket data
- DB ops: aggregate `orders`, `merchant_orders`, `order_items`

The point is not to add a giant API surface in one step, but to keep route semantics aligned with the new ownership model.

---

## 14. Database migration strategy

The project already has a working schema. The migration plan should evolve it incrementally rather than rebuilding it.

### Safe migration sequence

```text
Current schema
  ↓
Migration 005 (membership expansion)
  ↓
Migration 006 (booth invitations)
  ↓
Migration 007 (restaurant subscriptions)
  ↓
Migration 008 (shop owner analytics indexes and policy tightening)
  ↓
New SaaS architecture
```

### Recommended migration steps

#### 1. Add `restaurant_memberships`

Add a new table:

```sql
CREATE TABLE IF NOT EXISTS restaurant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('owner','manager','staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, restaurant_id)
);
```

#### 2. Add `restaurant`-level status fields

Add columns to `restaurants` such as:

- `status` (`active`, `trial`, `paused`, `suspended`)
- `subscription_status`
- `owner_note` or `metadata` if needed

#### 3. Extend `food_outlets`

Add fields such as:

- `status`
- `description`
- `is_active`
- `created_by`

This preserves the booth object while allowing shop-level management.

#### 4. Add `booth_invitations`

Create the invitation table with a one-way hash, expiry, and `used_by` tracking.

#### 5. Add `subscriptions`

Create a separate subscription table, not an embedded JSON column.

#### 6. Keep `merchant_memberships` for now

Do not remove it until all current code paths that rely on booth membership are audited and migrated.

### Important compatibility rule

This should be additive, not destructive. The project should maintain the current customer and booth flows while introducing shop ownership.

---

## 15. Permission matrix

| Action | Shop Owner | Booth Owner | Customer |
|---|---|---|---|
| View shop | Yes | If authorized to the booth in that shop | Public where appropriate |
| Edit shop | Yes | No | No |
| Create booth | Yes | No | No |
| Edit booth | Yes | Own booth | No |
| Delete/deactivate booth | Yes | No | No |
| View booth orders | Yes (shop-wide) | Own booth | Own orders |
| Update booth order | Yes* | Own booth | No |
| Manage menu | Yes* | Own booth | No |
| View analytics | Yes (shop-wide) | Own booth | No |
| Manage members | Yes | No (unless own booth + explicit role) | No |
| Generate invite | Yes | No | No |
| Join booth | No | Yes | No |
| Manage subscription | Yes | No | No |

Where `*` means: only when the user also holds the booth-level permission or is directly acting within that booth context.

---

## 16. Security considerations

### Required hard rules

- Keep one account per user.
- Do not split user identity by shop/booth ownership.
- Do not store service-role keys in browser code.
- Do not use localStorage for authorization.
- Do not let AI touch database records or credentials.
- Use RLS to enforce all cross-tenant boundaries.
- Validate every invite server-side using secure hashing and expiry checks.
- Gate shop-level and booth-level operations by the role table, not by UI state only.

### Authorization principle

The rule should be:

```text
User membership -> Restaurant/Food Outlet scope -> allowed action
```

and never:

```text
UI toggle decides access
```

---

## 17. Open questions

1. Should `restaurant_memberships` use the same role vocabulary as `merchant_memberships` or a distinct shop-specific role set?
2. Should `food_outlets` include `status`, `description`, and `is_active` immediately or later in the migration?
3. Does the product want a public restaurant directory and a private shop dashboard, or should public reads remain restricted to the customer-facing storefront only?
4. How much of the shop owner analytics should be visible to a booth owner without being a shop owner?
5. Do we want one reusable `membership` abstraction in the app layer, or is it cleaner to keep separate server-side helpers for shop and booth access?

---

## 18. Recommended implementation order

1. Audit all current uses of `merchant_memberships` and owner routes.
2. Add `restaurant_memberships` and `subscriptions` as additive tables.
3. Add `booth_invitations` with hashed token flow.
4. Add shop-level owner API routes and RLS policy tightening.
5. Add owner UI scope switching for shop vs booth.
6. Add booth invitation join flow and membership assignment.
7. Add shop-level analytics and reporting view.
8. Add subscription status integration with a future provider.
9. Only then consider deeper SaaS billing and team management features.

This preserves the current app while extending it into a clean multi-tenant architecture.
