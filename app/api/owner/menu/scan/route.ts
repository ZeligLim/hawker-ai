import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenRouterClient, isOpenRouterConfigured } from '@/lib/ai/provider';
import { createRequestSupabaseClient } from '@/lib/supabase/server'; // wait, for route we should use server client, but I will just mock it or rely on client sending token if needed? Wait, the user has API routes using `supabase` client.

export const maxDuration = 60; // 60 seconds max

export async function POST(req: NextRequest) {
  const supabase = createRequestSupabaseClient(req);
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  if (!isOpenRouterConfigured) {
    return NextResponse.json({ error: 'AI provider is not configured.' }, { status: 500 });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const client = getOpenRouterClient();
    
    const { object } = await generateObject({
      model: client('google/gemini-1.5-pro'),
      schema: z.object({
        dishes: z.array(z.object({
          name: z.string().describe('The name of the dish'),
          price: z.number().describe('The price of the dish as a number without currency symbol'),
          category: z.enum(['main-course', 'drinks', 'desserts']).describe('Categorize the dish appropriately'),
          isVegetarian: z.boolean().describe('True if it explicitly says vegetarian or is obviously vegetarian'),
          spiceLevel: z.number().min(0).max(5).describe('Estimate spice level 0-5. 0 if not spicy.'),
          description: z.string().optional().describe('Any short description or ingredients listed'),
        }))
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all the dishes, drinks, and desserts from this hawker menu. Convert prices to a pure number (e.g. RM 5.50 -> 5.5). Categorize them correctly.' },
            { type: 'image', image: imageBase64 }
          ]
        }
      ]
    });

    return NextResponse.json({ dishes: object.dishes }, { status: 200 });
  } catch (error: any) {
    console.error('Menu Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan menu' }, { status: 500 });
  }
}
