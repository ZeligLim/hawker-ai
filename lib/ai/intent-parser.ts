import { generateObject } from 'ai';
import { SearchIntentSchema, SearchIntent } from '@/lib/search/schema';
import { getOpenRouterClient, isOpenRouterConfigured } from '@/lib/ai/provider';

const parseHeuristicIntent = (rawQuery: string): SearchIntent => {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  const priceMatch = lower.match(/(?:rm\s*)?(\d+(?:\.\d+)?)\s*(?:ringgit|myr)?/i);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;

  const vegetarianMatch = lower.match(/non-vegetarian|non vegetarian|not vegetarian|meat/i);
  const vegetarian = vegetarianMatch ? false : lower.includes('vegetarian') || lower.includes('veggie') ? true : undefined;

  const halalMatch = lower.match(/non-halal|not halal|non halal/i);
  const halal = halalMatch ? false : lower.includes('halal') ? true : undefined;

  const spiceLevel =
    lower.includes('non-spicy') || lower.includes('not spicy') || lower.includes('no spice') || lower.includes('no spicy') || lower.includes('zero spice')
      ? 0
      : lower.includes('very spicy') || lower.includes('spicy hot') || lower.includes('hot')
      ? 5
      : lower.includes('spicy')
        ? 4
        : lower.includes('medium') || lower.includes('normal')
          ? 3
          : lower.includes('mild') || lower.includes('low heat')
            ? 1
            : undefined;

  const cleanQuery = query
    .replace(/\b(?:rm|ringgit|myr)\b/gi, '')
    .replace(/\b(?:under|below|less than|max|budget|for|with|around|about)\b/gi, '')
    .replace(/\d+(?:\.\d+)?/g, '')
    .replace(/[,.;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return SearchIntentSchema.parse({
    query: cleanQuery,
    maxPrice,
    vegetarian,
    halal,
    spiceLevel,
    limit: 10,
  });
};

export async function parseSearchIntent(rawQuery: string): Promise<SearchIntent> {
  if (!isOpenRouterConfigured) {
    return parseHeuristicIntent(rawQuery);
  }

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

  try {
    const client = getOpenRouterClient();
    const { object } = await generateObject({
      model: client('openrouter/free'),
      schema: SearchIntentSchema,
      system:
        'You are a cautious Malaysian hawker search intent parser. Return only valid JSON matching SearchIntentSchema.',
      prompt,
    });

    return SearchIntentSchema.parse(object);
  } catch {
    return parseHeuristicIntent(rawQuery);
  }
}
