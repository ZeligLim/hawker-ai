You are the lead architect for this project.

## Source of Truth

Before doing anything, read:

```text
docs/agent-context.md
```

Also inspect the existing:
- Supabase migrations
- database schema
- RLS policies
- authentication implementation
- merchant/owner APIs
- owner UI
- relevant TypeScript types
- existing documentation

Do NOT start coding yet.

---

# Objective

We are evolving Hawker into a multi-tenant SaaS platform.

The core business hierarchy is:

```text
Shop / Restaurant
├── Booth A
├── Booth B
└── Booth C
```

There are two important ownership scopes:

### Shop Owner

A shop owner owns/manages the overall hawker shop.

They need to be able to:

- Create/manage the shop
- Create/manage booths
- Invite booth owners
- Manage booth members
- View all booth orders
- View shop-wide sales
- View sales by booth
- Manage shop profile
- Manage the SaaS subscription

### Booth Owner

A booth owner manages an individual food outlet/booth.

They need to be able to:

- Manage their booth
- Manage their menu
- Manage dish availability
- Upload dish images
- View/manage booth orders
- View booth analytics

### Important

A person can be BOTH:

```text
Shop Owner
+
Booth Owner
```

For example:

```text
Alice
├── Shop Owner of ABC Hawker Centre
└── Booth Owner of "Alice Noodles"
```

Therefore, do NOT design `shop_owner` and `booth_owner` as mutually exclusive global user roles.

Permissions must be scoped to the shop and/or booth.

---

# Current Architecture

The existing project already has:

- Supabase Auth
- PostgreSQL
- RLS
- restaurants
- food_outlets
- merchant_memberships
- orders
- merchant_orders
- order_items
- owner APIs
- owner UI

Do not replace the existing architecture blindly.

First determine what can be reused and what needs to change.

---

# Required Design

Design the architecture for the following.

## 1. Shop / Restaurant

Determine whether the existing `restaurants` table can represent the SaaS tenant/shop.

Document:

- ownership
- shop profile
- shop status
- subscription relationship
- creation flow
- who is allowed to modify it

---

## 2. Booth / Food Outlet

Determine whether the existing `food_outlets` table should represent booths.

Document:

```text
restaurant
    ↓
food_outlet
```

A booth must belong to exactly one shop.

Document:

- booth ownership
- booth members
- booth status
- menu ownership
- order ownership

---

# 3. Membership Model

Design whether we should replace or extend the current `merchant_memberships`.

Preferred conceptual model:

```text
restaurant_memberships
    user_id
    restaurant_id
    role

food_outlet_memberships
    user_id
    food_outlet_id
    role
```

However, DO NOT automatically implement this.

First inspect the existing schema and determine whether:

1. `merchant_memberships` can safely support both scopes
2. it should be migrated
3. it should be replaced
4. another design is better

Explain the tradeoffs.

The design must support:

```text
User A
└── Shop Owner of Shop X

User B
└── Booth Owner of Booth 1

User C
├── Shop Owner of Shop X
└── Booth Owner of Booth 2
```

---

# 4. Shop Owner Permissions

Define exactly what a shop owner can do.

At minimum:

```text
Shop
├── View dashboard
├── View analytics
├── Manage shop profile
├── Create booth
├── Edit booth
├── Delete/deactivate booth
├── Generate booth invitation
├── Manage booth members
├── View booth orders
└── View shop-wide orders
```

Also determine whether shop owners should automatically have access to every booth's:

- menu
- dishes
- orders
- analytics

Explain the recommended V1 behavior.

---

# 5. Booth Owner Permissions

Define exactly what a booth owner can do.

At minimum:

```text
Booth
├── View dashboard
├── Manage menu
├── Create dishes
├── Edit dishes
├── Change availability
├── Upload images
├── View orders
├── Update order status
└── View booth analytics
```

A booth owner MUST NOT be able to access another booth's data.

---

# 6. Shop Owner Also Being Booth Owner

Explicitly design this case.

Example:

```text
Alice
Shop Owner → ABC Hawker Centre
Booth Owner → Noodle Stall
```

When Alice enters the application:

- She should have one account.
- She should not need separate accounts.
- The application should determine her permissions from database memberships.
- She should be able to access shop-level functionality.
- She should also be able to operate her booth.

Recommend how the UI should handle this.

Prefer a single "Owner/Merchant Mode" rather than separate "Shop Owner Mode" and "Booth Owner Mode" toggles.

---

# 7. Booth Invitation System

We need a system where a shop owner can create a booth and invite a booth owner.

Example:

```text
Shop Owner
    ↓
Create Booth
    ↓
Generate Invite
    ↓
X7K9-PQ2M
    ↓
Booth Owner enters token
    ↓
Booth Owner joins booth
```

Design a secure invitation system.

Preferred conceptual table:

```text
booth_invitations
    id
    food_outlet_id
    created_by
    token_hash
    expires_at
    used_at
    used_by
    created_at
```

But inspect the existing schema before deciding.

Requirements:

- Tokens should expire.
- Tokens should preferably be single-use.
- Do not store plaintext invitation tokens if unnecessary.
- A shop owner can revoke an invitation.
- A shop owner can generate a new invitation.
- A token must only grant access to the intended booth.
- A random person must not be able to join a booth by guessing tokens.
- Joining must create the correct booth membership.
- Existing shop ownership must be checked before generating invitations.

Also consider whether QR-code invitations should be supported later.

Do NOT implement QR generation yet unless required architecturally.

---

# 8. Subscription Architecture

Hawker will eventually be a SaaS product.

The subscription belongs to the:

```text
Shop / Restaurant
```

NOT the individual booth owner.

Conceptually:

```text
Restaurant
    ↓
Subscription
```

Design how we should represent:

- subscription status
- plan
- billing customer ID
- subscription ID
- trial
- active
- cancelled
- past_due

Do NOT implement a payment provider yet unless absolutely necessary.

Instead, design the database boundary so a provider such as Stripe can be added later.

Explain where subscription authorization should happen.

For example:

```text
User
 ↓
Restaurant Membership
 ↓
Restaurant
 ↓
Subscription
```

---

# 9. RLS Security

This is extremely important.

Design the RLS model for:

- restaurants
- food_outlets
- memberships
- booth invitations
- dishes
- orders
- merchant_orders
- order_items
- subscriptions

Rules must ensure:

### Shop owner

Can access data belonging to shops they own/manage.

### Booth owner

Can access only data belonging to booths they are authorized to manage.

### Customer

Can only access their own customer data/orders where appropriate.

### Unauthenticated user

Cannot access protected merchant data.

### AI

Must NOT receive direct database authorization.

Keep the existing architecture:

```text
User
 ↓
API
 ↓
Supabase Auth
 ↓
RLS
 ↓
Database
```

Do not introduce service-role access into browser code.

---

# 10. SaaS Onboarding Flow

Design the recommended onboarding flow.

### Shop owner

```text
Marketing Website
        ↓
Sign Up
        ↓
Create Shop
        ↓
Choose Subscription
        ↓
Shop Dashboard
        ↓
Create Booth
        ↓
Generate Booth Invite
```

### Booth owner

```text
Sign Up / Login
        ↓
Enter Booth Invite Token
        ↓
Validate Token
        ↓
Join Booth
        ↓
Booth Dashboard
```

Also design what happens if:

- user already has an account
- user already belongs to another booth
- invitation expires
- invitation is already used
- user is already a booth member
- user is already a shop owner
- shop subscription is inactive

---

# 11. UI Architecture

Recommend the application navigation.

Current owner application has:

```text
Dashboard
Orders
Menu
Profile
```

We now need to support both shop-level and booth-level functionality.

Propose a clean V1 navigation.

Preferred direction:

```text
Owner
├── Dashboard
├── Booths
├── Orders
├── Menu
├── Analytics
└── Settings
```

But determine the best structure based on the existing UI.

A shop owner should be able to select a booth and enter its booth-level management interface.

Do NOT create multiple accounts or duplicate applications.

---

# 12. API Architecture

Inspect the existing APIs.

Determine which APIs can remain unchanged and which new APIs are needed.

Potential examples:

```text
/api/owner/shop
/api/owner/booths
/api/owner/booths/[id]
/api/owner/booths/[id]/invite
/api/owner/booths/join
/api/owner/members
/api/owner/analytics
```

Do not blindly create these exact routes.

Design the cleanest API structure based on the existing project.

For every proposed endpoint document:

- HTTP method
- purpose
- authentication requirement
- authorization requirement
- input
- output
- database operations
- RLS considerations

---

# 13. Database Migration Strategy

This is an existing application.

Do NOT destroy or recreate the database.

Design a safe migration strategy from the current schema.

Document:

```text
Current schema
      ↓
Migration 005
      ↓
Migration 006
      ↓
...
      ↓
New SaaS architecture
```

Explain:

- tables to add
- tables to modify
- columns to add
- indexes
- foreign keys
- constraints
- RLS policy changes
- data migration requirements
- backwards compatibility

Pay particular attention to the existing:

```text
merchant_memberships
```

Do not remove it until you understand all current code using it.

Search the repository for every reference.

---

# 14. Authorization Rules

Create a clear permission matrix.

Example:

| Action | Shop Owner | Booth Owner | Customer |
|---|---|---|---|
| View shop | Yes | If authorized | Public where appropriate |
| Edit shop | Yes | No | No |
| Create booth | Yes | No | No |
| Manage booth | Yes | Own booth | No |
| Manage menu | Yes* | Own booth | No |
| View orders | Yes* | Own booth | Own orders |
| Update orders | Yes* | Own booth | No |
| Manage members | Yes | No | No |
| Generate invite | Yes | No | No |
| Join booth | No/optional | Yes | No |
| Manage subscription | Yes | No | No |

Replace `*` with the exact recommended behavior.

---

# 15. Documentation Output

Do NOT write application code yet.

Instead create/update:

```text
docs/saas-architecture.md
```

The document must contain:

1. Current architecture assessment
2. Proposed architecture
3. Entity relationship model
4. Membership model
5. Permission model
6. Invitation-token design
7. Subscription design
8. RLS model
9. API design
10. UI/navigation design
11. Onboarding flows
12. Migration strategy
13. Security considerations
14. Open questions
15. Recommended implementation order

Also update:

```text
docs/agent-context.md
```

with a concise summary of the new approved architecture, but ONLY after the design is complete.

---

# 16. Important Engineering Rules

Do NOT:

- rewrite the entire application
- replace Supabase
- replace the existing auth system
- create separate user accounts for shop and booth owners
- use localStorage for authorization
- put service-role keys in frontend code
- let AI directly query the database
- create a giant migration without inspecting dependencies
- delete existing tables without a migration plan
- implement payments yet
- implement QR generation yet
- build the entire SaaS in one step

DO:

- inspect first
- reuse existing architecture
- preserve working functionality
- make authorization database-driven
- use RLS as a security boundary
- keep shop and booth permissions separate
- support one user having multiple memberships
- make the architecture extensible
- keep V1 simple

---

# 17. Final Deliverable

At the end, report:

### Current Architecture

What exists today.

### Recommended Architecture

What should change.

### Database Changes

Exact tables/columns/migrations required.

### Authorization

Exact membership and permission model.

### Invitation System

Exact token lifecycle.

### Subscription

Exact relationship between shop and subscription.

### UI

Recommended navigation and flows.

### API

Required endpoints.

### Migration Plan

Ordered implementation phases.

### Risks

Anything that could break existing functionality.

### Implementation Order

Give a numbered sequence such as:

```text
Phase 1 — Database foundation
Phase 2 — Membership migration
Phase 3 — RLS
Phase 4 — Shop management
Phase 5 — Booth management
Phase 6 — Invitations
Phase 7 — Owner UI
Phase 8 — Subscription foundation
Phase 9 — Testing
```

Then STOP.

Do not implement any of the phases yet.

Wait for my approval before writing code.