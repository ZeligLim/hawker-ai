import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ outlets: [] });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const outletId = searchParams.get('id');

  let query = supabase
    .from('food_outlets')
    .select(`
      id,
      name,
      restaurant_id,
      restaurants (
        id,
        name,
        slug,
        address
      ),
      dishes (
        id,
        name,
        price,
        description,
        is_vegetarian,
        is_halal,
        spice_level,
        protein_grams,
        image_url,
        is_available,
        tags,
        customizations
      )
    `);

  if (outletId) {
    query = query.eq('id', outletId);
  }

  const { data: outlets, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let results = outlets ?? [];

  if (slug) {
    results = results.filter((outlet: any) => {
      const shopSlug = outlet.restaurants?.slug;
      const outletSlug = outlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return shopSlug === slug || outletSlug === slug;
    });
  }

  return NextResponse.json({ outlets: results });
}
