'use client';

import React from 'react';
import { Flame, Leaf, Plus, UtensilsCrossed } from 'lucide-react';

export interface DishCardProps {
 id: string;
 name: string;
 price: number;
 isVegetarian?: boolean;
 spiceLevel?: number;
 imageUrl?: string | null;
 quantity?: number;
 onAdd: () => void;
 onUpdateQuantity: (delta: number) => void;
}

export function DishCard({
 id,
 name,
 price,
 isVegetarian,
 spiceLevel,
 imageUrl,
 quantity = 0,
 onAdd,
 onUpdateQuantity,
}: DishCardProps) {
 return (
 <article
 data-dish-id={id}
 aria-label={name}
 className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.03)]"
 >
 {/* Visual Picture-Only Card Area */}
 <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
 {imageUrl ? (
 <img
 src={imageUrl}
 alt={name}
 className="h-full w-full object-cover"
 loading="lazy"
 />
 ) : (
 <div className="flex h-full w-full items-center justify-center p-3 text-center">
 <UtensilsCrossed className="h-8 w-8 text-[#a8a29e]" strokeWidth={1.5} />
 </div>
 )}

 {/* Price Badge */}
 <div className="absolute left-2.5 top-2.5 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
 RM {price.toFixed(2)}
 </div>

 {/* Dietary / Spicy Badges */}
 <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
 {/* Vegetarian Badge */}
 {isVegetarian ? (
 <div
 className="flex h-7 w-7 items-center justify-center rounded-full bg-[#34c759]/15 text-[#248a3d]"
 title="Vegetarian"
 aria-label="Vegetarian"
 >
 <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
 </div>
 ) : null}

 {/* Spicy Badge (shown when spicy level is 1 or higher) */}
 {spiceLevel !== undefined && spiceLevel >= 1 ? (
 <div
 className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff3b30]/15 text-[#ff3b30]"
 title={`Spicy Level ${spiceLevel}`}
 aria-label={`Spicy Level ${spiceLevel}`}
 >
 <Flame className="h-3.5 w-3.5 fill-[#ff3b30]/20" strokeWidth={2} />
 </div>
 ) : null}
 </div>

 {/* Quantity Controls Floating on Image Bottom */}
 <div className="absolute bottom-2.5 left-2.5 right-2.5">
 {quantity > 0 ? (
 <div className="flex w-full items-center justify-between rounded-full bg-white/95 px-2 py-1 shadow-md backdrop-blur-md">
 <button
 type="button"
 aria-label={`Decrease ${name} quantity`}
 onClick={(e) => {
 e.stopPropagation();
 onUpdateQuantity(-1);
 }}
 className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f7] text-base font-bold text-[#1d1d1f] hover:bg-[#e5e5ea] "
 >
 −
 </button>
 <span className="min-w-6 text-center text-xs sm:text-sm font-bold text-[#1d1d1f]">
 {quantity}
 </span>
 <button
 type="button"
 aria-label={`Increase ${name} quantity`}
 onClick={(e) => {
 e.stopPropagation();
 onUpdateQuantity(1);
 }}
 className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-base font-bold text-white hover:bg-neutral-800 "
 >
 +
 </button>
 </div>
 ) : (
 <div className="flex justify-end">
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 onAdd();
 }}
 className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-xs hover:bg-neutral-800 "
 aria-label={`Add ${name} to cart`}
 >
 <Plus className="h-4 w-4" strokeWidth={2.2} />
 </button>
 </div>
 )}
 </div>
 </div>
 </article>
 );
}
