import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ outlets: [] });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || searchParams.get('centre');
  const restaurantId = searchParams.get('restaurantId');
  const outletId = searchParams.get('id');

  // Domain / subdomain resolution for per-hawker-centre customer apps
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const hostParts = host.split(':')[0].split('.');
  const subdomain = hostParts.length > 2 && !['www', 'app', 'api', 'admin'].includes(hostParts[0])
    ? hostParts[0].toLowerCase()
    : null;

  let query = supabase
    .from('food_outlets')
    .select(`
      id,
      name,
      restaurant_id,
      is_open,
      restaurants (
        id,
        name,
        slug,
        address,
        is_active
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

  // Filter strictly by target centre to prevent mixing stalls across venues
  const targetSlug = slug || subdomain;
  if (restaurantId) {
    results = results.filter((o: any) => o.restaurant_id === restaurantId);
  } else if (targetSlug) {
    const s = decodeURIComponent(targetSlug).toLowerCase().trim();
    const sNorm = s.replace(/[^a-z0-9]/g, '');

    const matchedOutlets = results.filter((outlet: any) => {
      const restSlug = outlet.restaurants?.slug?.toLowerCase() ?? '';
      const restSlugNorm = restSlug.replace(/[^a-z0-9]/g, '');
      const restName = outlet.restaurants?.name?.toLowerCase() ?? '';
      const restNameNorm = restName.replace(/[^a-z0-9]/g, '');
      const outletSlug = outlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      return (
        restSlug === s ||
        restSlugNorm === sNorm ||
        restNameNorm === sNorm ||
        (sNorm.length >= 3 && (restSlugNorm.includes(sNorm) || sNorm.includes(restSlugNorm))) ||
        (sNorm.length >= 3 && (restNameNorm.includes(sNorm) || sNorm.includes(restNameNorm))) ||
        outletSlug === s ||
        outlet.restaurant_id === s
      );
    });

    if (matchedOutlets.length > 0) {
      results = matchedOutlets;
    }
  } else if (results.length > 0) {
    // If no centre parameter or subdomain is specified, isolate to the first/active hawker centre
    // so stalls from different food courts are never mixed in the same customer app domain
    const activeCentreId = results.find((o: any) => o.restaurants?.is_active !== false)?.restaurant_id || results[0].restaurant_id;
    results = results.filter((o: any) => o.restaurant_id === activeCentreId);
  }

  return NextResponse.json({ outlets: results });
}
