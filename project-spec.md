# Hawker Menu Intelligence — Project Specification

## 0. Project Overview

Build a production-minded, mobile-first **Malaysian hawker centre food marketplace and menu intelligence application**.

The product is designed around a simple physical-world workflow:

> **Sit down → Scan table QR → Discover dishes → Search naturally → Order from multiple stalls → Pay once → Stalls prepare → Food is served to the table**

The application should not feel like a generic GrabFood/Foodpanda clone. It should feel like **Apple-designed infrastructure for Malaysian hawker centres**: simple, fast, highly polished, and focused on the physical hawker-centre experience.

The initial MVP should support a single hawker centre with approximately 10 stalls.

---

# 1. Core Product Requirements

## 1.1 Hawker Centre Model

The system is structured as:

```text
Hawker Centre
    ├── Stall
    │    ├── Dish
    │    ├── Dish
    │    └── Dish
    │
    ├── Stall
    ├── Stall
    └── ...
```

Example:

```text
Setia Hawker Centre
    ├── Ah Seng Chicken Rice
    ├── Penang Corner
    ├── Curry House
    ├── Green Garden Vegetarian
    ├── Noodle Station
    ├── Wok & Fire
    ├── Laksa Corner
    ├── Malay Kitchen
    ├── Dessert House
    └── Drinks Corner
```

The MVP should contain realistic Malaysian hawker data for approximately 10 stalls.

---

# 2. Core User Journey

## 2.1 Table QR

Each physical table has a QR code.

Scanning the QR code identifies:

```text
hawker_centre_id
table_id
customer_session_id
```

The application should therefore know:

- Which hawker centre the customer is in
- Which table the customer is sitting at
- Which order should be delivered to that table

The customer should not need to manually select their table after scanning the QR code.

---

## 2.2 Discover Food

The home screen should immediately answer:

> "What do you want to eat?"

Example search queries:

```text
spicy noodles under RM10
vegetarian food
something with lots of protein
chicken rice
Penang food
halal food
something not too spicy
food under RM15
```

Search should be **dish-first**, not restaurant-first.

For example:

```text
Char Kway Teow — RM8
Penang Corner

Curry Mee — RM9
Noodle Station

Vegetarian Mee Goreng — RM7
Green Garden Vegetarian
```

Users should be able to add a dish directly from search results.

---

# 3. Multi-Stall Ordering

A customer must be able to order food from multiple stalls in one session.

Example:

```text
Ah Seng Chicken Rice
    Chicken Rice × 1        RM8.00

Penang Corner
    Char Kway Teow × 1      RM8.00

Dessert House
    Cendol × 1              RM5.00

Drinks Corner
    Teh O Ice × 1           RM3.00
--------------------------------
Subtotal                    RM24.00
Service Fee                  RM1.00
Total                       RM25.00
```

The customer pays **once**.

The backend then splits the order into merchant-specific sub-orders.

```text
Parent Order #1001
│
├── MerchantOrder #1001-A
│   └── Ah Seng Chicken Rice
│
├── MerchantOrder #1001-B
│   └── Penang Corner
│
├── MerchantOrder #1001-C
│   └── Dessert House
│
└── MerchantOrder #1001-D
    └── Drinks Corner
```

Each stall only sees its own order.

---

# 4. Table Service

This is NOT initially a delivery application.

There is no rider.

The flow is:

```text
Customer orders
       ↓
Customer pays
       ↓
Relevant stall receives order
       ↓
Stall accepts
       ↓
Stall prepares food
       ↓
Food becomes ready
       ↓
Stall serves food to table
       ↓
Customer receives food
```

The customer should be able to see the status of each stall's order.

Example:

```text
Your Order

✓ Chicken Rice
  Ah Seng Chicken Rice
  Served

● Char Kway Teow
  Penang Corner
  Preparing

○ Cendol
  Dessert House
  Waiting for stall
```

---

# 5. Core Architecture & Constraints

This is a production-minded Next.js application.

## Frontend

- Next.js
- App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Next.js API Routes / Route Handlers
- Vercel AI SDK
- Zod
- TypeScript

## Database

- PostgreSQL
- Supabase
- Local Supabase development where possible
- Free-tier compatible architecture

## Security Boundary

The AI must **NEVER**:

- Execute SQL
- Access PostgreSQL directly
- Access Supabase directly
- Modify database records
- Bypass authorization
- Decide authorization
- Construct arbitrary database queries

The AI only converts natural language into a strictly validated structured object.

Example:

```text
User:
"Find vegetarian spicy food under RM15"

        ↓

AI

        ↓

SearchIntent

{
  "query": "food",
  "maxPrice": 15,
  "isVegetarian": true,
  "isHalal": null,
  "spiceLevel": "spicy"
}

        ↓

Zod validation

        ↓

SearchService

        ↓

Supabase query
```

The AI is therefore an **intent parser**, not a database agent.

---

# 6. Engineering Principles for the AI Coding Agent

## 6.1 Phase-by-Phase Development

Implement this document strictly in phases.

Do NOT jump ahead.

After completing a phase:

1. Implement
2. Run verification
3. Fix all errors
4. Review the implementation
5. Commit the changes
6. Update project context
7. Stop
8. Wait for human approval before beginning the next phase

Never silently continue into the next phase.

---

# 7. Context Management

The coding agent must actively manage project context.

Do not rely entirely on conversation history.

Maintain a lightweight project context file:

```text
/docs/agent-context.md
```

This file should contain:

```markdown
# Current Project Context

## Current Phase
Phase 2

## Current Feature
Deterministic Search API

## Completed
- Next.js project initialized
- Supabase schema created
- Seed data added
- RLS configured

## Current Architecture
...

## Important Decisions
...

## Known Issues
...

## Next Task
Implement SearchService filtering.

## Last Commit
abc1234
```

The context file must be updated whenever a meaningful feature or architectural decision is completed.

---

# 8. Feature-Level Development Workflow

Do NOT attempt to build the entire application in one pass.

Work feature-by-feature.

For every feature:

```text
1. Read project context
2. Inspect existing implementation
3. Understand architecture
4. Define the smallest useful implementation
5. Implement feature
6. Run TypeScript checks
7. Run lint
8. Run relevant tests
9. Manually inspect affected code
10. Fix problems
11. Update agent-context.md
12. Create Git commit
13. Report what changed
14. Stop
```

Example:

```text
Feature:
Create dishes database table

        ↓

Implement migration

        ↓

Run tests/checks

        ↓

Commit:

feat(db): add dishes schema

        ↓

Update agent-context.md

        ↓

STOP
```

Then the next feature might be:

```text
Feature:
Create SearchIntent schema

        ↓

Implement

        ↓

Test

        ↓

Commit:

feat(search): add SearchIntent schema

        ↓

Update context

        ↓

STOP
```

Do not bundle unrelated features into one commit.

---

# 9. Git Commit Requirements

Git should be used throughout development.

Create a commit after each logically complete feature.

Use conventional commit messages where appropriate:

```text
feat(db): add hawker centre schema
feat(search): add deterministic search service
feat(ai): add SearchIntent parser
feat(ui): add mobile search interface
feat(order): add multi-stall cart
feat(payment): add mock payment provider
fix(search): correct vegetarian filtering
test(search): add SearchService tests
refactor(order): separate merchant sub-orders
```

Do not create meaningless commits such as:

```text
update
changes
stuff
final
```

Before committing:

```bash
git status
git diff
```

Ensure secrets, `.env` files, generated files, and unnecessary files are not committed.

---

# 10. Verification Requirements

After writing code, run appropriate checks.

At minimum:

```bash
npx tsc --noEmit
npm run lint
```

Run tests when tests exist.

For database changes, verify migrations.

For API changes, test the endpoint.

For UI changes, verify the actual page and relevant interactions.

Do not move forward while known build/type/lint/test errors remain unless the human explicitly approves doing so.

---

# 11. No Placeholders

Write production-ready code.

Do not leave:

```typescript
// TODO: implement
```

for core functionality.

Do not create fake functions that pretend to work.

If a real external integration is intentionally deferred, create a clean abstraction around it.

Example:

```typescript
interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentStatus>;
}
```

Then implement:

```text
MockPaymentProvider
```

for the MVP.

The architecture should allow a real Malaysian payment provider to be added later without rewriting the order system.

---

# 12. Ask for Clarification

If a requirement is genuinely ambiguous and the ambiguity affects architecture, data integrity, security, or user experience:

**STOP and ask the human.**

Do not guess.

For minor implementation details that are conventional and reversible, use reasonable engineering judgment and document the decision.

---

# 13. AI Provider Configuration

Use the Vercel AI SDK with OpenRouter.

Package:

```text
@ai-sdk/openai
```

OpenRouter base URL:

```text
https://openrouter.ai/api/v1
```

Model:

```text
openrouter/free
```

Example:

```typescript
import { createOpenAI } from '@ai-sdk/openai';

export const openRouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

Use the appropriate Vercel AI SDK structured-output API available in the installed SDK version.

The AI output must be strictly validated against the Zod `SearchIntent` schema before entering application logic.

Never trust raw model output.

---

# 14. SearchIntent

Create a strict Zod schema.

Conceptually:

```typescript
const SearchIntent = z.object({
  query: z.string().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minPrice: z.number().nonnegative().optional(),
  isVegetarian: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  spiceLevel: z.enum([
    'none',
    'mild',
    'medium',
    'spicy',
    'very_spicy'
  ]).optional(),
  minProteinGrams: z.number().nonnegative().optional(),
});
```

The exact schema can evolve during implementation.

The schema must remain:

- Strict
- Small
- Predictable
- Application-oriented

Do not allow arbitrary SQL, filters, expressions, or executable instructions inside `SearchIntent`.

---

# 15. Database Schema

Use raw SQL migrations.

## restaurants

```text
id
name
slug
address
lat
lng
created_at
updated_at
```

## food_outlets

```text
id
restaurant_id
name
description
status
created_at
updated_at
```

## dishes

```text
id
food_outlet_id
name
description
price
image_url
category
is_available
is_spicy
is_vegetarian
is_halal
spice_level
protein_grams
preparation_time
created_at
updated_at
```

The exact schema can be refined during implementation.

Constraint:

```text
price >= 0
```

## ingredients

```text
id
name
```

## dish_ingredients

```text
dish_id
ingredient_id
```

This relationship exists to support ingredient and allergy-related queries.

---

# 16. Ordering Database Model

The ordering system should use a parent-order / merchant-sub-order architecture.

## Tables

### hawker_centres

```text
id
name
slug
address
lat
lng
created_at
updated_at
```

### stalls

```text
id
hawker_centre_id
name
description
logo
status
created_at
updated_at
```

### tables

```text
id
hawker_centre_id
table_number
qr_code
status
```

### customer_sessions

```text
id
table_id
created_at
expires_at
```

### orders

```text
id
table_id
customer_session_id
status
subtotal
service_fee
total
payment_id
created_at
updated_at
```

### order_items

```text
id
order_id
dish_id
stall_id
quantity
unit_price
notes
created_at
```

### merchant_orders

```text
id
order_id
stall_id
status
subtotal
commission
merchant_payout
created_at
updated_at
```

### payments

```text
id
order_id
provider
status
amount
currency
transaction_reference
created_at
updated_at
```

The implementation should avoid unnecessary duplication and maintain proper foreign-key constraints.

---

# 17. Row Level Security

Supabase RLS must be implemented deliberately.

Public customers may read publicly available:

- Hawker centres
- Stalls
- Dishes
- Relevant menu information

Customers must not gain arbitrary access to other customers' private order information.

Merchants may only access:

```text
their own stall
their own menu
their own merchant orders
```

Hawker-centre administrators may access:

```text
their hawker centre
its stalls
its tables
its orders
its transactions
```

Platform administrators may access platform-wide information.

Never rely solely on frontend checks for authorization.

---

# 18. Phase 1 — Foundation & Database

Implement:

- Next.js App Router project
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase integration
- Environment variable setup
- SQL migrations
- Database constraints
- RLS
- Seed data

Create realistic Malaysian hawker dishes including:

```text
Nasi Lemak
Curry Mee
Char Kway Teow
Chicken Rice
Laksa
Mee Goreng
Wantan Mee
Vegetarian Fried Rice
Cendol
Teh O Ice
```

Create approximately 10 stalls for development.

### Phase 1 completion requirements

The agent must verify:

- Database migrations work
- Seed data works
- Constraints work
- RLS works
- Application builds
- TypeScript passes
- Lint passes

Then:

```text
commit
update agent-context.md
STOP
```

---

# 19. Phase 2 — Deterministic Search API

Build a `SearchService`.

The search service must work **without AI**.

It should support:

- Text query
- Maximum price
- Minimum price
- Vegetarian
- Halal
- Spice level
- Protein
- Availability
- Hawker centre
- Stall

Expose:

```text
/api/search
```

Validate API input with Zod.

---

# 20. Deterministic Ranking

Implement deterministic ranking.

Ranking may consider:

```text
Text relevance
Price match
Dietary match
Spice match
Protein match
Popularity
Availability
Preparation time
```

Do not make ranking dependent on an LLM.

The same input should produce predictable results.

The system should provide reasons that can later be displayed as:

```text
Why this matches

✓ Under RM10
✓ Vegetarian
✓ Spicy
✓ Available now
```

---

# 21. Phase 3 — AI Intent Parsing

Integrate OpenRouter through the Vercel AI SDK.

The AI's responsibility is:

```text
Natural language
       ↓
SearchIntent
```

Not:

```text
Natural language
       ↓
SQL
```

Example:

```text
"Give me something vegetarian and spicy under RM15"
```

becomes:

```json
{
  "query": "",
  "maxPrice": 15,
  "isVegetarian": true,
  "spiceLevel": "spicy"
}
```

Validate the result with Zod.

Then:

```text
SearchIntent
      ↓
SearchService
      ↓
Database
      ↓
Ranked results
```

The database layer remains deterministic.

---

# 22. Phase 4 — Mobile-First UI

The interface should be designed primarily for approximately:

```text
390 × 844
```

The experience should feel:

- Clean
- Fast
- Premium
- Minimal
- Apple-inspired
- Malaysian
- Practical

Avoid:

- Excessive gradients
- Neon colors
- Huge cards
- Excessive shadows
- Clutter
- Generic dashboard aesthetics

Use:

- Warm off-white background
- Near-black text
- Soft gray borders
- Restrained accent colors
- Generous spacing
- 10–14px radius
- Large touch targets
- Sticky actions
- Bottom sheets where appropriate

---

# 23. Home Screen

The primary interaction should be:

```text
What are you craving?
```

Large search input.

Display current context:

```text
Setia Hawker Centre
Table 12
```

Quick filters:

```text
Vegetarian
Halal
Spicy
Under RM10
Popular
Open now
```

Sections may include:

```text
Featured today
Popular nearby
Quick picks
```

Bottom navigation:

```text
Home
Search
Orders
Profile
```

Keep the home screen lightweight.

---

# 24. Search Experience

Search should feel like a modern AI search interface rather than a traditional restaurant directory.

Example:

```text
┌─────────────────────────────┐
│ What are you craving?       │
│ spicy noodles under RM10   │
└─────────────────────────────┘
```

Results:

```text
Curry Mee
Noodle Station

RM9
🌶 Spicy
✓ Available

"Matches your spicy + under RM10 request"
```

Users can add directly from the result.

---

# 25. Dish Detail

Display:

- Dish image
- Dish name
- Price
- Stall
- Description
- Dietary information
- Ingredients
- Spice level
- Protein
- Preparation time
- Availability
- Quantity selector
- Special notes

Example:

```text
Char Kway Teow

RM8.00

Penang Corner

🌶 Medium spicy
Non-vegetarian
Protein: 18g

Preparation: ~10 min

[ Add to order ]
```

---

# 26. Cart

The cart must support multiple stalls.

Group items by stall.

Example:

```text
Your order

AH SENG CHICKEN RICE
Chicken Rice × 1        RM8

PENANG CORNER
Char Kway Teow × 1      RM8

DESSERT HOUSE
Cendol × 1              RM5

---------------------------
Subtotal                RM21
Service fee              RM1
Total                   RM22

[ Pay RM22 ]
```

The user should never feel like they are placing separate orders manually.

---

# 27. Payment Architecture

Do not hard-code a payment provider into the ordering system.

Create:

```typescript
interface PaymentProvider {
  createPayment(...): Promise<...>;
  verifyPayment(...): Promise<...>;
}
```

For MVP implement:

```text
MockPaymentProvider
```

This allows the complete order flow to be developed without spending money or requiring production payment credentials.

Later a compliant Malaysian payment provider can be added.

Never pretend that mock payment is real payment.

---

# 28. Order State Machine

## Parent Order

Possible states:

```text
PENDING_PAYMENT
PAID
IN_PROGRESS
PARTIALLY_READY
READY
COMPLETED
CANCELLED
REFUNDED
```

## Merchant Order

Possible states:

```text
PENDING
ACCEPTED
PREPARING
READY
SERVED
CANCELLED
```

The parent order status should be derived appropriately from merchant sub-orders.

Example:

```text
Merchant A → READY
Merchant B → PREPARING
Merchant C → SERVED

Parent → IN_PROGRESS / PARTIALLY_READY
```

---

# 29. Phase 5 — Customer Order Tracking

Create a customer order tracking screen.

Example:

```text
Order #1001

Ah Seng Chicken Rice
✓ Served

Penang Corner
● Preparing

Dessert House
○ Accepted
```

The interface should update as merchants change their order states.

---

# 30. Merchant Dashboard

Create a simple mobile/tablet-friendly merchant dashboard.

A stall should see only its own orders.

Example:

```text
NEW ORDERS

#1001
Chicken Rice × 2
Table 12

[ Accept ]

----------------

PREPARING

#1000
Chicken Rice × 1
Table 8

[ Ready ]
```

Merchant actions:

```text
Accept
Start preparing
Mark ready
Mark served
Cancel
```

Keep the interface extremely simple because the user may be working in a busy hawker stall.

---

# 31. Merchant Menu Management

Merchants should eventually be able to:

- Add dishes
- Edit dishes
- Change prices
- Toggle availability
- Set preparation time
- Upload/change images
- Edit dietary information
- Edit ingredients

This should respect stall-level authorization.

---

# 32. Hawker Centre Admin

Create an admin interface capable of managing:

- Hawker centres
- Stalls
- Tables
- QR codes
- Orders
- Transactions
- Merchant accounts

Admin functionality should be implemented after the core customer/merchant ordering flow unless required earlier by architecture.

---

# 33. Phase 6 — Multi-Stall Ordering

Implement the complete:

```text
Dish
 ↓
Cart
 ↓
Parent Order
 ↓
Merchant Sub-orders
 ↓
Payment
 ↓
Merchant preparation
 ↓
Table service
```

Ensure one parent order can contain items from many stalls.

Critical invariant:

> A merchant must never see another merchant's order items.

---

# 34. Phase 7 — QR Table Sessions

Implement QR-based table sessions.

A QR should encode enough information to identify:

```text
hawker centre
table
```

Do not put sensitive customer information into QR codes.

On scan:

```text
QR
 ↓
Validate location/table
 ↓
Create or retrieve CustomerSession
 ↓
Set active table context
 ↓
Start ordering
```

Handle expired sessions safely.

---

# 35. Phase 8 — Conversational Search Context

Add lightweight conversational context.

Example:

```text
User:
Show me vegetarian food.

AI:
[Vegetarian results]

User:
Which one has more protein?

AI:
Compare protein values among the currently relevant results.
```

The AI should not invent missing nutritional information.

Context should be structured rather than sending the entire conversation blindly every time.

Maintain relevant state such as:

```text
previous SearchIntent
current result set
current filters
current hawker centre
current table
```

---

# 36. Allergy Safety

Allergy queries require special handling.

The application must never claim:

```text
"This dish is safe for your peanut allergy."
```

unless the underlying ingredient information is sufficiently complete and the application explicitly supports that determination.

If ingredient data is missing:

```text
We don't have enough ingredient information to confirm this dish is safe for your allergy. Please check directly with the stall.
```

The AI must never hallucinate ingredient information.

Allergy-related responses should be conservative.

---

# 37. Group Ordering — Future Architecture

The architecture should allow multiple people at the same table to contribute to one table order.

Example:

```text
Person A scans Table 12
Person B scans Table 12
Person C scans Table 12
```

All can contribute to:

```text
Table 12 shared order
```

Potential future flow:

```text
Person A
Chicken Rice

Person B
Laksa

Person C
Cendol

        ↓

Shared Table Order

        ↓

One payment
```

Do not implement full group ordering in the MVP unless explicitly instructed.

However, avoid architectural decisions that make it impossible later.

---

# 38. Monetization Architecture

The product is a marketplace/infrastructure product.

Potential revenue:

## Transaction commission

For example:

```text
Platform commission = configurable percentage
```

Never hard-code the rate throughout the application.

Store it as configurable business logic.

Example:

```text
commission_rate
```

Merchant payout:

```text
merchant subtotal
-
platform commission
=
merchant payout
```

Future monetization can include:

- Merchant subscription
- Promoted dishes
- Analytics
- Hawker-centre SaaS
- Premium merchant tools

Do not overbuild monetization into the MVP.

---

# 39. Data Advantage

The system should structure data around:

```text
Hawker Centre
 ↓
Stall
 ↓
Dish
 ↓
Ingredients
 ↓
Price
 ↓
Availability
 ↓
Dietary properties
 ↓
Search behaviour
 ↓
Transactions
```

This creates useful dish-level data over time.

Potential future intelligence:

```text
Popular dishes
Search demand
Price sensitivity
Demand by time
Demand by hawker centre
Dish conversion rate
Unavailable dish frequency
```

Do not implement advanced analytics until the transactional foundation works.

---

# 40. AI Architecture

AI must remain replaceable.

Create an abstraction such as:

```text
SearchEngine
```

Possible implementations:

```text
BasicSearchEngine
AISearchEngine
```

Initially:

```text
BasicSearchEngine
```

handles deterministic search.

AI handles:

```text
Natural language → SearchIntent
```

Later AI may support:

- Query rewriting
- Search explanations
- Conversational context
- Recommendations
- Personalization

The core ordering system must continue working if the AI provider is unavailable.

---

# 41. Error Handling

Gracefully handle:

- AI provider failures
- 429 rate limits
- Network errors
- Database failures
- Invalid QR codes
- Expired sessions
- Payment failures
- Merchant cancellation
- Dish becoming unavailable
- Stale prices
- Empty search results

The user should always receive a useful state.

Example:

```text
We couldn't process that search right now.

Try:
"vegetarian food under RM10"
```

Never expose raw stack traces to users.

---

# 42. Security

Never expose:

- API keys
- OpenRouter credentials
- Supabase service-role credentials
- Internal database credentials

Use environment variables.

Example:

```text
OPENROUTER_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must never be exposed to the browser.

Use RLS as a real authorization boundary.

Validate all externally supplied input.

---

# 43. Testing Strategy

Create tests for critical business logic.

At minimum:

### Search

```text
vegetarian filtering
price filtering
spice filtering
text relevance
combined filters
empty results
```

### Orders

```text
single-stall order
multi-stall order
merchant sub-order generation
order totals
commission calculation
state transitions
merchant isolation
```

### AI

```text
valid SearchIntent
invalid model output
missing fields
ambiguous query
provider failure
rate limit
```

### Security

Test that merchants cannot access another stall's data.

---

# 44. MVP Scope

The MVP should include:

### Customer

- Hawker centre
- Stalls
- Dishes
- QR table identification
- Home
- Search
- Natural-language search
- Dish detail
- Cart
- Multi-stall cart
- Mock checkout
- Order creation
- Order tracking

### Merchant

- Merchant authentication
- Merchant dashboard
- Receive orders
- Accept orders
- Prepare orders
- Mark ready
- Mark served
- Menu management

### Admin

- Hawker centre management
- Stall management
- Table management
- QR management
- Basic order/transaction visibility

### AI

- SearchIntent extraction
- Zod validation
- Conversational search context
- Conservative allergy handling

---

# 45. Explicitly Out of Scope for Initial MVP

Do NOT implement unless explicitly requested:

- Food delivery
- Delivery riders
- Loyalty system
- Social feed
- Reviews
- Chat
- Complex recommendation engine
- Advanced AI agents
- AI-generated menu descriptions
- Full accounting system
- Advanced analytics
- Production payment gateway
- Full group ordering
- Complex promotions
- Nationwide merchant onboarding

The goal is to make the **core ordering loop work extremely well first**.

---

# 46. Seed Data

Use realistic Malaysian data.

Example:

```text
Setia Hawker Centre

Ah Seng Chicken Rice
- Chicken Rice
- Roasted Chicken Rice
- Steamed Chicken Rice
- Char Siew Rice

Penang Corner
- Char Kway Teow
- Penang Hokkien Mee
- Assam Laksa

Curry House
- Curry Mee
- Curry Rice
- Dry Curry Noodles

Green Garden Vegetarian
- Vegetarian Mee Goreng
- Vegetarian Fried Rice
- Vegetarian Curry Noodles

Noodle Station
- Wantan Mee
- Pan Mee
- Curry Noodles

Wok & Fire
- Fried Rice
- Kung Pao Chicken
- Fried Kway Teow

Laksa Corner
- Assam Laksa
- Curry Laksa
- Laksa Johor

Malay Kitchen
- Nasi Lemak
- Nasi Campur
- Mee Goreng Mamak

Dessert House
- Cendol
- Ais Kacang
- Tau Fu Fah

Drinks Corner
- Teh O Ice
- Milo Ice
- Lemon Tea
- Lime Juice
```

The exact data can be expanded as needed for testing.

---

# 47. UI Design Philosophy

The product should feel like:

> **A premium mobile operating layer for physical Malaysian hawker centres.**

Not:

> Another food delivery clone.

Prioritize:

```text
Speed
Clarity
Discoverability
Large touch targets
Minimal typing
Strong visual hierarchy
Fast ordering
```

The customer should be able to go from:

```text
Scan QR
```

to:

```text
Order placed
```

with minimal friction.

---

# 48. Recommended Project Structure

Use a clean structure similar to:

```text
app/
  page.tsx
  search/
  orders/
  profile/
  merchant/
  admin/
  api/
    search/
    orders/
    payments/

components/
  ui/
  search/
  dishes/
  cart/
  orders/
  merchant/

lib/
  ai/
    provider.ts
    search-intent.ts
    prompts.ts

  search/
    search-service.ts
    ranking.ts

  orders/
    order-service.ts
    order-state.ts

  payments/
    payment-provider.ts
    mock-payment-provider.ts

  supabase/
    client.ts
    server.ts

  validation/
    ...

supabase/
  migrations/
  seed.sql

docs/
  agent-context.md
  architecture.md
```

The exact structure may evolve if there is a strong engineering reason.

---

# 49. Agent Operating Procedure

Before starting any task, the coding agent MUST:

```text
1. Read this specification.
2. Read docs/agent-context.md if it exists.
3. Inspect the current Git status.
4. Inspect the relevant existing code.
5. Identify the current phase.
6. Identify the smallest feature required.
```

Then implement only that feature.

After implementation:

```text
1. Run TypeScript checks.
2. Run lint.
3. Run relevant tests.
4. Fix failures.
5. Inspect Git diff.
6. Update docs/agent-context.md.
7. Commit the feature.
8. Report the commit and what changed.
9. STOP.
```

---

# 50. Context Preservation Rules

When the project becomes large, do not repeatedly dump the entire codebase into context.

Instead use:

```text
Specification
    ↓
agent-context.md
    ↓
Relevant source files
    ↓
Current feature
```

The agent should only inspect the files relevant to the current task unless architecture requires broader inspection.

If a previous implementation decision matters, record it in:

```text
docs/agent-context.md
```

Important architectural decisions should also be recorded in:

```text
docs/architecture.md
```

---

# 51. Human-in-the-Loop Rule

The human remains the final decision maker for:

- Architecture changes
- Database schema changes with significant consequences
- Security decisions
- Payment architecture
- Product scope
- Major UX changes
- External integrations
- Changes that affect existing features

The coding agent should not silently make major architectural changes.

If it believes a change is necessary, explain:

```text
Problem
Proposed change
Why it is necessary
Alternatives
Impact
```

Then ask for approval.

---

# 52. Definition of Done

A feature is only considered complete when:

```text
[ ] Implementation exists
[ ] No placeholder core logic
[ ] TypeScript passes
[ ] Lint passes
[ ] Relevant tests pass
[ ] Security implications considered
[ ] Existing functionality still works
[ ] Context updated
[ ] Git diff reviewed
[ ] Git commit created
```

Do not mark incomplete work as complete.

---

# 53. First Execution Instruction

When starting from an empty repository:

**Do not build the whole application immediately.**

Start with:

```text
Phase 1
→ Project foundation
→ Database schema
→ RLS
→ Seed data
```

Break Phase 1 into small features.

For example:

```text
Feature 1:
Initialize Next.js application

COMMIT

Feature 2:
Configure Tailwind + shadcn/ui

COMMIT

Feature 3:
Create Supabase migration

COMMIT

Feature 4:
Create RLS policies

COMMIT

Feature 5:
Create seed data

COMMIT

Feature 6:
Verify database + application

COMMIT
```

After each feature, update:

```text
docs/agent-context.md
```

Then stop and wait for human approval before proceeding to the next feature.

---

# 54. Final Product Principle

Do not optimize for the number of features implemented.

Optimize for making this experience excellent:

```text
I sit at a Malaysian hawker centre.

        ↓

I scan the QR code.

        ↓

The app knows my table.

        ↓

I type:

"something spicy under RM10"

        ↓

I instantly see relevant dishes
from every stall.

        ↓

I choose food from 3 different stalls.

        ↓

I pay once.

        ↓

Each stall receives its own order.

        ↓

The food is prepared.

        ↓

The stalls bring the food to my table.

        ↓

I eat.
```

That is the core product.

Everything else should support this loop.