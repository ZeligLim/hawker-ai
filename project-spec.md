# Hawker Menu Intelligence - Project Specification

## 1. Core Architecture & Constraints
This is a production-minded Next.js application for Malaysian hawker food discovery. 
*   **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
*   **Backend:** Next.js API Routes, Vercel AI SDK, Zod for strict validation.
*   **Database:** PostgreSQL via Supabase (Local/Free Tier).
*   **Security Boundary:** The AI must NEVER execute SQL, access the database directly, or bypass authorization. The AI only maps natural language to a strictly validated `SearchIntent` JSON object using Zod.

## 2. Engineering Principles for the AI Agent
*   **Phase-by-Phase:** Implement this document strictly in the phases outlined below. Do not jump ahead. Wait for human approval before starting the next phase.
*   **Verify Everything:** After writing code, run TypeScript checks (`npx tsc --noEmit`), linting, and tests. Fix errors before proceeding.
*   **No Placeholders:** Write production-ready code. Do not leave `// TODO: implement this` for core search or database logic.
*   **Ask for Clarification:** If a requirement is ambiguous, pause and ask the human user before writing code.

## 3. Tooling Configuration
### AI Provider Setup (OpenRouter)
Use the `@ai-sdk/openai` package configured for OpenRouter. 
*   **Base URL:** `https://openrouter.ai/api/v1`
*   **Model:** Use the Vercel AI SDK `generateObject` function with the model `openrouter/free`.
*   **Validation:** Output must be strictly validated against the Zod `SearchIntent` schema before being passed to the application logic.

```typescript
// lib/ai/provider.ts Example
import { createOpenAI } from '@ai-sdk/openai';

export const openRouter = createOpenAI({
  baseURL: '[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)',
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

### Database Schema (Supabase)
Use raw SQL migrations for:
*   `restaurants`: id, name, slug, address, lat, lng.
*   `food_outlets`: id, restaurant_id, name.
*   `dishes`: id, food_outlet_id, name, price, is_vegetarian, is_halal, spice_level, protein_grams.
*   `ingredients` & `dish_ingredients` (for allergy tracking).
*   Enforce constraints (price >= 0) and Row Level Security (RLS) policies allowing public read access.

## 4. Implementation Phases

### Phase 1: Foundation & Database
*   Initialize Next.js project with Tailwind and TypeScript.
*   Create Supabase SQL migrations for all tables, constraints, and RLS policies.
*   Generate Malaysian hawker seed data (e.g., Nasi Lemak, Curry Mee, Char Kway Teow) to test filtering.

### Phase 2: Deterministic Search API
*   Build a `SearchService` that queries Supabase based on parameters (price, dietary flags, spice).
*   Implement a deterministic ranking function (rating + relevance).
*   Expose this via `/api/search` validated by Zod. (This must work without AI).

### Phase 3: AI Intent Parsing
*   Integrate Vercel AI SDK with OpenRouter.
*   Create a prompt instructing the LLM to extract a `SearchIntent` object from queries like "vegetarian, RM15, spicy".
*   Validate the LLM output strictly with Zod before passing it to the `SearchService`.

### Phase 4: Frontend UI
*   Build a mobile-first search interface using shadcn/ui.
*   Create result cards showing price, stall, dietary badges, and "Why this matches" reasons.
*   Handle loading, empty, and error states gracefully (including rate-limit 429 catches).

### Phase 5: Conversational Context & Allergies
*   Add lightweight state to handle follow-up queries ("Which one has more protein?").
*   Implement strict, cautious disclaimers for allergy queries if exact ingredient data is missing. Do not let the AI invent allergy safety.
