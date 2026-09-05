import { generateObject } from 'ai';
import { SearchIntentSchema, SearchIntent } from '@/lib/search/schema';
import { openRouter } from '@/lib/ai/provider';

export async function parseSearchIntent(rawQuery: string): Promise<SearchIntent> {
  const prompt = `
You are a strict extractor. Convert a Malaysian hawker food search request into a JSON object matching this schema:

{
  query: string,
  minPrice?: number,
  maxPrice?: number,
  vegetarian?: boolean,
  halal?: boolean,
  spiceLevel?: number,
  limit?: number
}

Rules:
- Convert currency like RM15, RM 15, 15 ringgit, or 15 MYR into maxPrice: 15.
- Convert terms like 'vegetarian', 'veggie', 'non-vegetarian' into vegetarian boolean.
- Convert 'halal' / 'non-halal' into halal boolean.
- Convert 'mild', 'medium', 'spicy' into spiceLevel values approximated as 1, 3, 5.
- Keep query as the natural-language text if relevant; otherwise use empty string.
- Only return valid JSON. Do not include explanation text.
- Try to infer intent conservatively and avoid inventing unsupported facts.

User request: ${rawQuery}
`;

  const { object } = await generateObject({
    model: openRouter('openrouter/free'),
    schema: SearchIntentSchema,
    system:
      'You are a cautious Malaysian hawker search intent parser. Return only valid JSON matching SearchIntentSchema.',
    prompt,
  });

  return SearchIntentSchema.parse(object);
}
