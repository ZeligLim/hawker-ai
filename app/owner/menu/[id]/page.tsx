'use client';

import Link from 'next/link';
import { ImagePlus, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  vegetarian?: boolean;
  description?: string;
  tags?: string[];
  customizations?: { label: string; price: number }[];
  spiceLevels?: number;
};

const storageKey = 'hawker-owner-menu';
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

function loadCustomizations(dish: Dish | null) {
  return Array.isArray(dish?.customizations) ? dish.customizations : [];
}

export default function OwnerDishEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const [dish, setDish] = useState<Dish | null>(() => isNew ? {
    id: `dish-${Date.now()}`, name: '', category: 'Main course', price: 0, available: true,
  } : loadDish(params.id));
  const [customizations, setCustomizations] = useState<{ label: string; price: number }[]>(() => loadCustomizations(dish));
  const [spiceLevels, setSpiceLevels] = useState(() => dish?.spiceLevels ?? 1);
  const [vegetarian, setVegetarian] = useState(() => dish?.vegetarian ?? false);
  const [description, setDescription] = useState(() => dish?.description ?? '');
  const [tags, setTags] = useState(() => dish?.tags?.join(', ') ?? '');
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
    const saved = {
      ...dish,
      name: dish.name.trim(),
      vegetarian,
      description: description.trim(),
      tags: [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))],
      customizations: customizations.filter((option) => option.label.trim()),
      spiceLevels,
    };
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
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[620px]">
        <header className="flex items-center gap-3">
          <div><h1 className="text-3xl font-semibold tracking-[-0.06em]">{isNew ? 'Add dish' : 'Edit dish'}</h1></div>
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
            <label className="mt-4 flex items-center gap-3 rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium">
              <input type="checkbox" checked={vegetarian} onChange={(event) => setVegetarian(event.target.checked)} className="h-5 w-5 accent-[#111827]" />
              Vegetarian dish
            </label>
            <label className="mt-4 block text-sm font-medium">
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the dish, ingredients, and flavour." rows={3} className="mt-2 w-full resize-none rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Search tags
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="e.g. halal, no onion, breakfast" className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none" />
              <span className="mt-1 block text-xs font-normal text-[#6e6e73]">Separate tags with commas. These will support future AI search.</span>
            </label>
          </section>
          <section className="rounded-[24px] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Customisation</h2>
            <p className="mt-1 text-sm text-[#6e6e73]">Add up to 10 options. Enter the label and extra price for each option.</p>
            <div className="mt-4 space-y-3">
              {customizations.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input value={option.label} onChange={(event) => setCustomizations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="e.g. Add egg or Large" className="min-w-0 flex-1 rounded-[12px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none" />
                  <input type="number" min="0" step="0.10" value={option.price || ''} onChange={(event) => setCustomizations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: Number(event.target.value) } : item))} placeholder="RM" className="w-20 rounded-[12px] bg-[#f5f5f7] px-2 py-3 text-sm outline-none" aria-label={`Price for customisation ${index + 1}`} />
                  <button type="button" onClick={() => setCustomizations((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full p-2 text-[#6e6e73]" aria-label={`Remove customisation ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            {customizations.length < 10 ? (
              <button type="button" onClick={() => setCustomizations((current) => [...current, { label: '', price: 0 }])} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm font-semibold"><Plus className="h-4 w-4" /> Add customisation</button>
            ) : <p className="mt-4 text-xs text-[#6e6e73]">Maximum of 10 customisations reached.</p>}
            <div className="mt-6 border-t border-[#f0f0f2] pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Spicy level</p>
                  <p className="mt-1 text-xs text-[#6e6e73]">Allow customers to choose up to five levels.</p>
                </div>
                <span className="text-sm font-semibold">{spiceLevels} / 5</span>
              </div>
              <input type="range" min="1" max="5" value={spiceLevels} onChange={(event) => setSpiceLevels(Number(event.target.value))} className="mt-3 w-full accent-[#111827]" aria-label="Number of spicy levels" />
            </div>
          </section>
          {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Save dish'}</button>
        </form>
      </div>
    </main>
  );
}
