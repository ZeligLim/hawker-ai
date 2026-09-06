You are the lead product engineer and UI/UX engineer for the Hawker project.

We are now expanding Hawker from the internal application into a complete SaaS product.

## Source of Truth

Before making changes, read:

```text
docs/agent-context.md
docs/saas-architecture.md
```

Also inspect the existing application, authentication, Supabase schema, owner dashboard, APIs, and routing.

Do not blindly rebuild anything that already exists.

---

# PRODUCT VISION

Hawker is a SaaS platform for hawker centres / food courts and their booth owners.

The core hierarchy is:

```text
Hawker SaaS
│
└── Shop / Restaurant
      │
      ├── Booth A
      ├── Booth B
      └── Booth C
```

A Shop Owner manages the overall shop.

A Booth Owner manages an individual booth.

One user can have both roles.

---

# DOMAIN ARCHITECTURE

The intended production domain structure is:

```text
hawker.com
```

Public marketing and acquisition website.

```text
app.hawker.com
```

Authenticated SaaS application.

The conceptual routing is:

```text
hawker.com
├── /
├── /features
├── /pricing
├── /about
├── /contact
├── /login
└── /signup

app.hawker.com
├── /dashboard
├── /booths
├── /orders
├── /menu
├── /analytics
├── /settings
└── /billing
```

IMPORTANT:

Do NOT create a second repository or completely separate application yet.

Keep this as one Next.js codebase unless the existing architecture makes that impossible.

The domains can initially point to the same Vercel project.

Use domain-aware routing/middleware only where necessary.

Do not introduce unnecessary complexity.

---

# PHASE 1 — AUDIT CURRENT APPLICATION

Before coding:

1. Inspect the current Next.js routing structure.
2. Inspect the existing owner application.
3. Inspect authentication.
4. Inspect Supabase configuration.
5. Inspect `docs/saas-architecture.md`.
6. Inspect existing UI components.
7. Inspect Tailwind configuration.
8. Inspect any existing landing page.
9. Inspect environment variables.
10. Inspect Vercel deployment assumptions.

Determine the cleanest way to introduce the marketing website without breaking the existing customer or owner application.

Do not remove existing functionality.

---

# PHASE 2 — MARKETING WEBSITE

Build a professional SaaS marketing website at the public root.

The homepage should feel like a real startup SaaS product, not a university project.

## Hero Section

The first viewport should immediately communicate the product.

Recommended messaging:

```text
Run your hawker centre smarter.
```

Supporting text:

```text
Manage booths, menus, orders and sales from one simple platform.
```

Primary CTA:

```text
Start free
```

Secondary CTA:

```text
See how it works
```

Do not blindly copy this wording if you can improve it.

The messaging should clearly communicate:

- Who Hawker is for
- What problem it solves
- What the product does
- Why the user should try it

---

# PRODUCT VISUAL

The homepage should show the actual Hawker product.

Do NOT fill the page with generic stock photos.

Use realistic product UI mockups/screenshots/components showing:

```text
Hawker Dashboard

Revenue
Orders
Active Booths

Booth performance
Recent orders
Sales analytics
```

The product should visually demonstrate that Hawker is a real operating system for a hawker centre.

Prefer reusable React components for the product mockup rather than static images.

---

# PROBLEM SECTION

Explain the problems hawker-centre operators currently face.

Examples:

```text
Too many separate systems.

Booth owners manage things manually.

Orders are difficult to track.

Sales data is fragmented.

Owners don't have a clear view of every booth.
```

Keep this concise.

Focus on business pain rather than technical features.

---

# SOLUTION SECTION

Introduce Hawker as the unified solution.

Show:

```text
One platform
     │
 ┌───┼────┬────────┐
 ↓   ↓    ↓        ↓
Booths Menu Orders Analytics
```

Explain how everything connects.

---

# HOW IT WORKS

Create a simple 3–4 step flow:

```text
01
Create your hawker centre

02
Add your booths

03
Invite booth owners

04
Manage everything from one dashboard
```

Include a visual explanation of the invitation flow:

```text
Shop Owner
    ↓
Create Booth
    ↓
Generate Invite
    ↓
Booth Owner
    ↓
Join Booth
```

---

# FEATURES

Create a strong feature section.

At minimum:

### Multi-Booth Management

Manage all booths from one place.

### Menu Management

Booth owners can manage dishes, availability and images.

### Order Management

See and manage orders across booths.

### Analytics

Understand sales and booth performance.

### Owner Management

Control who has access to each booth.

### AI-Powered Discovery

Explain the existing AI-powered natural-language food search.

Do NOT claim that AI has direct database access.

Preserve the existing architecture:

```text
User query
 ↓
OpenRouter
 ↓
Validated SearchIntent
 ↓
Deterministic SearchService
 ↓
Supabase
```

---

# SHOP OWNER SECTION

Create a dedicated section showing the Shop Owner experience.

Example:

```text
Everything your hawker centre needs.

✓ Manage multiple booths
✓ Invite booth owners
✓ View all orders
✓ Track revenue
✓ Compare booth performance
✓ Manage members
```

Show a dashboard mockup.

CTA:

```text
Start managing your hawker centre
```

---

# BOOTH OWNER SECTION

Explain the booth-owner experience.

```text
Your booth. Your menu. Your orders.

✓ Manage dishes
✓ Update availability
✓ Upload food images
✓ Manage orders
✓ Track performance
```

CTA:

```text
Join a booth
```

---

# AI SECTION

Hawker should have an AI differentiator.

Explain the customer experience:

```text
"Where can I get something spicy with chicken and rice?"

        ↓

Hawker understands the intent

        ↓

Relevant dishes
```

Keep the explanation understandable to non-technical customers.

Do not oversell AI.

---

# PRICING PAGE

Create:

```text
hawker.com/pricing
```

The pricing page must be designed for conversion.

Use 2–3 plans maximum for V1.

Do NOT invent final prices if pricing has not been decided.

Use clearly marked placeholder pricing if necessary.

Example structure:

```text
Starter
For small operators

RM XX / month

✓ Booth management
✓ Menu management
✓ Order management
✓ Basic analytics

[Start free]
```

```text
Business
For growing hawker centres

RM XX / month

✓ Everything in Starter
✓ Multiple booths
✓ Advanced analytics
✓ Staff management
✓ Priority support

[Start free]
```

If a free trial is supported, clearly communicate its duration.

The pricing page should also explain:

- monthly billing
- annual billing if supported
- number of booths
- included features
- what happens when a subscription ends

Do not implement billing logic until the subscription architecture is approved.

---

# SUBSCRIPTION ARCHITECTURE

The subscription belongs to:

```text
Restaurant / Shop
```

NOT:

```text
User
```

and NOT:

```text
Booth
```

Conceptually:

```text
User
 ↓
Restaurant Membership
 ↓
Restaurant
 ↓
Subscription
```

A shop owner pays for the shop.

Booth owners do not independently subscribe to the booth.

---

# SIGNUP FLOW

The primary CTA from the marketing website should lead into a Shop Owner onboarding flow.

Recommended:

```text
hawker.com
      ↓
Start free
      ↓
Sign up
      ↓
Create your shop
      ↓
Choose plan / trial
      ↓
Shop dashboard
```

Do not require the user to understand the database structure.

The onboarding should feel like:

```text
Welcome to Hawker

Let's set up your hawker centre.

Shop name: __________

[Continue]
```

Then:

```text
Add your first booth

Booth name: __________

[Create booth]
```

Then:

```text
Your booth is ready.

Invite your booth owner:

[X7K9-PQ2M]

[Copy invitation]
```

---

# BOOTH OWNER FLOW

A booth owner should have a separate onboarding path:

```text
Login / Sign up
      ↓
Join a booth
      ↓
Enter invitation code
      ↓
Validate invitation
      ↓
Create booth membership
      ↓
Booth dashboard
```

Do not create a separate account type.

The same Supabase Auth system should be used.

---

# APP DOMAIN

The authenticated product should eventually live at:

```text
app.hawker.com
```

The marketing site should remain:

```text
hawker.com
```

The application should have:

```text
Dashboard
Booths
Orders
Menu
Analytics
Settings
Billing
```

Use the existing owner application where possible.

Do not rebuild existing owner functionality.

---

# BILLING

Do not implement production billing in this phase unless explicitly instructed.

Prepare the architecture for Stripe.

Recommended future flow:

```text
Pricing Page
     ↓
Stripe Checkout
     ↓
Payment
     ↓
Stripe Webhook
     ↓
Supabase
     ↓
Restaurant subscription updated
     ↓
App checks subscription status
```

Stripe Checkout and webhook-based subscription synchronization are consistent with current Vercel SaaS patterns. citeturn0search1turn0search4

Do not put Stripe secret keys in client-side code.

---

# BILLING PAGE

Prepare the authenticated application for:

```text
app.hawker.com/billing
```

It should eventually show:

```text
Current plan
Subscription status
Price
Billing interval
Next billing date

[Manage subscription]
```

A Stripe Customer Portal can eventually handle billing management.

Do not implement this unless the current task specifically requires it.

---

# DOMAIN / ROUTING

Design the application so it can support:

```text
hawker.com
app.hawker.com
```

without duplicating the application.

Do not implement wildcard tenant domains yet.

Do not create:

```text
shop1.hawker.com
shop2.hawker.com
```

yet.

That is a future feature.

---

# DESIGN DIRECTION

The design should feel:

- Modern
- Premium
- Clean
- Malaysian
- Food/business oriented
- SaaS-quality
- Trustworthy

Avoid:

- generic AI landing-page aesthetics
- excessive gradients
- excessive animations
- fake testimonials
- fake customer logos
- fake statistics
- stock-photo overload
- unnecessary glassmorphism

Use the actual product UI as the primary visual asset.

---

# RESPONSIVE DESIGN

The marketing site must work on:

- Desktop
- Tablet
- Mobile

The SaaS application must continue working on desktop and mobile.

---

# SEO

Implement proper metadata for:

```text
hawker.com
hawker.com/features
hawker.com/pricing
```

Include:

- title
- description
- Open Graph metadata
- appropriate canonical URLs
- sitemap consideration
- robots configuration

Do not make unsupported SEO claims.

---

# PERFORMANCE

The marketing pages should be optimized for fast loading.

Prefer:

- Server Components where appropriate
- optimized images
- minimal JavaScript
- reusable components
- no unnecessary client-side state

---

# ANALYTICS

Do not install analytics yet unless an existing analytics system is already present.

Instead, identify where future conversion events should be tracked:

```text
Landing page viewed
CTA clicked
Pricing viewed
Signup started
Signup completed
Trial started
Subscription started
```

Document these events for future implementation.

---

# IMPLEMENTATION STRATEGY

Do NOT build the entire SaaS billing system in one task.

Implement in phases.

### Phase 1

Marketing homepage.

### Phase 2

Features page.

### Phase 3

Pricing page UI.

### Phase 4

Signup/onboarding flow.

### Phase 5

Domain-aware routing for:

```text
hawker.com
app.hawker.com
```

### Phase 6

Stripe subscription integration.

### Phase 7

Billing management.

Each phase should be independently testable.

---

# IMPORTANT

Before coding, inspect the existing application.

Do not:

- destroy existing routes
- replace Supabase
- replace authentication
- rewrite the owner dashboard
- create a second repository
- expose secret keys
- implement fake payment processing
- hardcode subscription authorization
- use localStorage for authorization
- create fake testimonials or statistics

The marketing website is the acquisition layer.

The application is the product layer.

The architecture should clearly separate these concerns while keeping the codebase maintainable.

---

# FIRST TASK

For this task, ONLY implement the first phase:

## Build the Hawker marketing homepage.

Do NOT implement Stripe.

Do NOT implement subscription payments.

Do NOT redesign the existing owner application.

Do NOT implement app.hawker.com routing yet unless it is required to prevent conflicts.

Build a polished, production-quality homepage at:

```text
/
```

The homepage should include:

1. Navigation
2. Hero
3. Product dashboard visual
4. Problem
5. Solution
6. How it works
7. Features
8. Shop Owner section
9. Booth Owner section
10. AI discovery section
11. Pricing teaser
12. Final CTA
13. Footer

All CTAs should be wired to sensible existing or placeholder routes without creating fake functionality.

After implementation:

- run typecheck
- run lint
- run production build
- verify existing application routes still work
- verify authentication is not broken
- verify mobile responsiveness
- check for console errors

Then commit the changes.

Report:

- files changed
- routes added
- components created
- validation results
- any remaining TODOs

Do not proceed to Stripe or subscription implementation after this phase.

Important architecture clarification before you continue:

The intended Hawker architecture is:

```text
hawker.com
→ PUBLIC MARKETING WEBSITE
→ used to explain and sell Hawker
→ pricing
→ features
→ signup/login entry points

app.hawker.com
→ AUTHENTICATED SAAS WEB APP
→ used by shop owners, booth owners and customers
```

For the Next.js codebase, organize the application conceptually using route groups like:

```text
app/
├── (marketing)/
│   ├── page.tsx
│   ├── pricing/
│   ├── features/
│   ├── about/
│   └── contact/
│
└── (app)/
    ├── dashboard/
    ├── booths/
    ├── orders/
    ├── menu/
    ├── analytics/
    ├── settings/
    └── billing/
```

Important:

- `(marketing)` represents the public `hawker.com` experience.
- `(app)` represents the authenticated `app.hawker.com` experience.
- These are Next.js route groups; the parentheses do NOT appear in the URL.
- Do not expose the authenticated SaaS pages as part of the marketing navigation.
- Do not create a second repository just for this.
- Keep both experiences in the current Next.js project for now.
- The eventual production domains are:
  - `hawker.com` → marketing
  - `app.hawker.com` → SaaS application

Use domain-aware middleware/routing where necessary to map the two domains to the appropriate route groups.

Before changing the existing routing structure, inspect the current repository and preserve all existing working routes and functionality.

Do not implement the domain routing yet unless necessary for the current task. First establish the correct route architecture and make sure the marketing and application concerns are cleanly separated.

The product architecture should ultimately be:

```text
hawker.com
    │
    ├── Home
    ├── Features
    ├── Pricing
    ├── About
    └── Start Free
            │
            ↓
    app.hawker.com/signup
            │
            ↓
    app.hawker.com/dashboard
```

Do not start Stripe/payment implementation yet.