import Link from 'next/link';
import type { Metadata } from 'next';
import { ShopDetailClient } from '@/components/shop-detail-client';

const shops = {
  'ah-seng-chicken-rice': {
    name: 'Ah Seng Chicken Rice',
    eta: '10 min',
    busy: 'Busy',
    description: 'Chicken rice, roasted meats & noodles',
    dishes: [
      { name: 'Nasi Lemak', price: 8.5, vegetarian: false },
      { name: 'Chicken Rice', price: 7, vegetarian: false },
      { name: 'Roasted Chicken', price: 9, vegetarian: false },
    ],
  },
  'penang-corner': {
    name: 'Penang Corner',
    eta: '12 min',
    busy: 'Moderate',
    description: 'Penang favourites',
    dishes: [
      { name: 'Curry Mee', price: 12, vegetarian: false },
      { name: 'Char Kway Teow', price: 11.5, vegetarian: false },
      { name: 'Teh Tarik', price: 3.5, vegetarian: true },
    ],
  },
  'curry-house': {
    name: 'Curry House',
    eta: 'Closed',
    busy: 'Closed',
    description: 'Curry noodles & rice dishes',
    dishes: [
      { name: 'Laksa', price: 10, vegetarian: false },
      { name: 'Curry Rice', price: 8, vegetarian: false },
      { name: 'Bandung', price: 3, vegetarian: true },
    ],
  },
  'green-garden-vegetarian': {
    name: 'Green Garden Vegetarian',
    eta: '8 min',
    busy: 'Quiet',
    description: 'Vegetarian staples',
    dishes: [
      { name: 'Vegetarian Curry Laksa', price: 13, vegetarian: true },
      { name: 'Vegetarian Bee Hoon', price: 9.5, vegetarian: true },
      { name: 'Cendol', price: 5, vegetarian: true },
    ],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const shop = shops[slug as keyof typeof shops];

  return {
    title: shop ? `${shop.name} | Hawker Menu Intelligence` : 'Shop | Hawker Menu Intelligence',
  };
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = shops[slug as keyof typeof shops];

  if (!shop) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Not found</h1>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
            Back to shops
          </Link>
        </div>
      </main>
    );
  }

  return <ShopDetailClient shop={shop} slug={slug} />;
}
