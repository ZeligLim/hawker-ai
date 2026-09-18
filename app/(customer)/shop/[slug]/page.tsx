import Link from 'next/link';
import type { Metadata } from 'next';
import { ShopDetailClient, type ShopData } from '@/components/shop-detail-client';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

async function fetchShopBySlug(slug: string): Promise<ShopData | null> {
  if (!supabase) return null;

  // Step 1: fetch outlets + restaurants (typed relation)
  const { data: outlets } = await supabase
    .from('food_outlets')
    .select('id, name, restaurant_id, is_open, restaurants ( id, name, slug, address, is_active )');

  const matched = outlets?.find((o) => {
    const rest = o.restaurants as { slug?: string; name?: string; is_active?: boolean } | null;
    const restSlug = rest?.slug;
    const outletSlug = o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return restSlug === slug || outletSlug === slug || o.id === slug;
  });

  if (!matched) return null;

  // Step 2: fetch dishes for this outlet separately
  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, name, price, is_vegetarian, is_available, description, image_url, spice_level, customizations')
    .eq('food_outlet_id', matched.id)
    .eq('is_available', true);

  const rest = matched.restaurants as { name?: string; is_active?: boolean } | null;
  const isStallOpen = matched.is_open ?? true;
  const isShopActive = rest?.is_active ?? true;
  const isClosed = !isStallOpen || !isShopActive;

  return {
    id: matched.id,
    restaurantId: matched.restaurant_id,
    restaurantName: rest?.name ?? matched.name,
    name: matched.name,
    eta: '10 min',
    busy: isClosed ? 'Closed' : 'Open',
    description: `${rest?.name ?? 'Hawker Stall'} · Freshly cooked daily`,
    dishes: (dishes ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      price: Number(d.price),
      vegetarian: Boolean(d.is_vegetarian),
      spiceLevel: Number(d.spice_level ?? 0),
      imageUrl: d.image_url ?? null,
      customizations: Array.isArray(d.customizations) ? d.customizations : [],
    })),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const shop = await fetchShopBySlug(slug);

  return {
    title: shop ? `${shop.name} | Hawker Menu Intelligence` : 'Shop | Hawker Menu Intelligence',
  };
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await fetchShopBySlug(slug);

  if (!shop) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Not found</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">This stall or shop could not be found in our database.</p>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
            Back to shops
          </Link>
        </div>
      </main>
    );
  }

  return <ShopDetailClient shop={shop} slug={slug} />;
}
