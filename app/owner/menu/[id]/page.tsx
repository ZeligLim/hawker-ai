'use client';

import Link from 'next/link';
import { ArrowLeft, ImagePlus, LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  customizations?: {
    large: { enabled: boolean; price: number };
    egg: { enabled: boolean; price: number };
    spice: { enabled: boolean; levels: number };
  };
};

const storageKey = 'hawker-owner-menu';
const defaultCustomization = {
  large: { enabled: false, price: 2 },
  egg: { enabled: false, price: 1.5 },
  spice: { enabled: false, levels: 5 },
};

function loadDish(id: string): Dish | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return null;
  try {
    const dishes = JSON.parse(stored) as Dish[];
    return dishes.find((dish) => dish.id === id) ?? null;
  } catch {
    return null;
  }
}

export default function OwnerDishEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const [dish, setDish] = useState<Dish | null>(() => isNew ? {
    id: `dish-${Date.now()}`, name: '', category: 'Main course', price: 0, available: true,
  } : loadDish(params.id));
  const [largePrice, setLargePrice] = useState(() => dish?.customizations?.large.price ?? defaultCustomization.large.price);
  const [eggPrice, setEggPrice] = useState(() => dish?.customizations?.egg.price ?? defaultCustomization.egg.price);
  const [spiceLevels, setSpiceLevels] = useState(() => dish?.customizations?.spice.levels ?? defaultCustomization.spice.levels);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!dish) {
    return <main className="min-h-screen bg-[#f5f5f7] p-5 text-[#1d1d1f]"><Link href="/owner/menu">Dish not found</Link></main>;
  }

  const updateDish = (changes: Partial<Dish>) => setDish((current) => current ? { ...current, ...changes } : current);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateDish({ imageUrl: typeof reader.result === 'string' ? reader.result : undefined });
    reader.readAsDataURL(file);
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dish.name.trim() || dish.price <= 0) {
      setError('Enter a dish name and a price greater than zero.');
      return;
    }
    setIsSaving(true);
    const saved = { ...dish, name: dish.name.trim(), customizations: {
      large: { enabled: dish.customizations?.large.enabled ?? false, price: largePrice },
      egg: { enabled: dish.customizations?.egg.enabled ?? false, price: eggPrice },
      spice: { enabled: dish.customizations?.spice.enabled ?? false, levels: spiceLevels },
    }};
    const stored = window.localStorage.getItem(storageKey);
    let dishes: Dish[] = [];
    if (stored) {
      try { dishes = JSON.parse(stored) as Dish[]; } catch { dishes = []; }
    }
    const next = dishes.some((item) => item.id === saved.id) ? dishes.map((item) => item.id === saved.id ? saved : item) : [...dishes, saved];
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setTimeout(() => router.replace('/owner/menu' as any), 300);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-8 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[620px]">
        <header className="flex items-center gap-3">
          <Link href="/owner/menu" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to menu"><ArrowLeft className="h-5 w-5" /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Owner app</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">{isNew ? 'Add dish' : 'Edit dish'}</h1></div>
        </header>
        <form onSubmit={save} className="mt-6 space-y-4">
          <section className="rounded-[24px] bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium">Dish photo
              <div className="mt-2 flex h-44 items-center justify-center overflow-hidden rounded-[18px] bg-[#f5f5f7]">
                {dish.imageUrl ? <img src={dish.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-[#6e6e73]" />}
              </div>
              <input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} className="mt-3 block w-full text-sm" />
            </label>
          </section>
          <section className="rounded-[24px] bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <input value={dish.name} onChange={(event) => updateDish({ name: event.target.value })} placeholder="Dish name" className="rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none" />
              <select value={dish.category} onChange={(event) => updateDish({ category: event.target.value })} className="rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none"><option>Main course</option><option>Drinks</option><option>Desserts</option></select>
              <input type="number" min="0.01" step="0.10" value={dish.price || ''} onChange={(event) => updateDish({ price: Number(event.target.value) })} placeholder="Price (RM)" className="rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none" />
            </div>
          </section>
          <section className="rounded-[24px] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Customisation</h2>
            <p className="mt-1 text-sm text-[#6e6e73]">Customers will see these options every time they add this dish.</p>
            {(['large', 'egg'] as const).map((key) => (
              <div key={key} className="mt-4 flex items-center gap-3">
                <input type="checkbox" checked={dish.customizations?.[key].enabled ?? false} onChange={(event) => updateDish({ customizations: { ...(dish.customizations ?? defaultCustomization), [key]: { enabled: event.target.checked, price: key === 'large' ? largePrice : eggPrice } } })} className="h-5 w-5 accent-[#111827]" />
                <span className="flex-1 text-sm font-medium">{key === 'large' ? 'Add large' : 'Add egg'}</span>
                <input type="number" min="0" step="0.10" value={key === 'large' ? largePrice : eggPrice} onChange={(event) => key === 'large' ? setLargePrice(Number(event.target.value)) : setEggPrice(Number(event.target.value))} className="w-24 rounded-[12px] bg-[#f5f5f7] px-2 py-2 text-sm" aria-label={`${key} price`} />
              </div>
            ))}
            <div className="mt-5 flex items-center gap-3">
              <input type="checkbox" checked={dish.customizations?.spice.enabled ?? false} onChange={(event) => updateDish({ customizations: { ...(dish.customizations ?? defaultCustomization), spice: { enabled: event.target.checked, levels: spiceLevels } } })} className="h-5 w-5 accent-[#111827]" />
              <span className="flex-1 text-sm font-medium">Spicy level</span>
              <span className="text-sm font-semibold">{spiceLevels} / 5</span>
            </div>
            <input type="range" min="1" max="5" value={spiceLevels} onChange={(event) => setSpiceLevels(Number(event.target.value))} className="mt-3 w-full accent-[#111827]" aria-label="Number of spicy levels" />
          </section>
          {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Save dish'}</button>
        </form>
      </div>
    </main>
  );
}
