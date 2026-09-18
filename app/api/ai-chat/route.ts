import { streamText, tool } from 'ai';
import { getOpenRouterClient } from '@/lib/ai/provider';
import { z } from 'zod';
import { SearchService } from '@/lib/search/search-service';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const client = getOpenRouterClient();

  const result = await streamText({
    model: client('google/gemini-1.5-pro'),
    messages,
    system: "You are Hawker AI, a friendly assistant helping the user order food. If the user asks for food (e.g. 'I want pan mee extra spice'), use the addToCart tool to find the food and add it to their cart. Be concise.",
    tools: {
      addToCart: tool({
        description: 'Add a dish to the user cart. Provide a search query to find the dish, and list any customizations requested (like extra spicy, large, etc).',
        parameters: z.object({
          dishQuery: z.string().describe('The name of the food to search for.'),
          customizations: z.array(z.string()).optional().describe('Any requested customizations.'),
        }),
        // @ts-expect-error
        execute: async ({ dishQuery, customizations }: { dishQuery: string; customizations?: string[] }) => {
          const results = await SearchService.search({ query: dishQuery, limit: 1 });
          if (results.length > 0) {
            return { dish: results[0], customizations };
          }
          return { error: `Could not find any dish matching "${dishQuery}".` };
        }
      })
    }
  });

  return result.toUIMessageStreamResponse();
}
