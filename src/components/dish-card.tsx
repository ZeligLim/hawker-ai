'use client';

import React from 'react';
import { Flame, Leaf, Plus, UtensilsCrossed } from 'lucide-react';

export interface DishCardProps {
 isAvailable?: boolean;
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
 isAvailable = true,
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
 className={`group relative overflow-hidden rounded-[22px] bg-white sm:rounded-[26px] ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
 >
 {/* Visual Picture-Only Card Area */}
 <div className="relative aspect-square w-full bg-neutral-100">
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

 {/* Floating Dish Name Island */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start max-w-[calc(100%-60px)] z-10">
          <div className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-[#1d1d1f] backdrop-blur-md truncate max-w-full ">
            {name}
          </div>
          <div className="rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md ">
            RM {price.toFixed(2)}
          </div>
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

 {/* Controls float over the image; the article alone clips the card corners. */}
 <div className="absolute inset-x-0 bottom-0 z-10 h-[50px] sm:h-[58px]">
 <div className="absolute bottom-2.5 left-2.5 right-2.5 flex h-10 items-center justify-between sm:h-12">
 {quantity > 0 ? (
 <>
 <button
 type="button"
 aria-label={`Decrease ${name} quantity`}
 onClick={(e) => {
 e.stopPropagation();
 onUpdateQuantity(-1);
 }}
 className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f7] text-xl font-bold text-[#1d1d1f] hover:bg-[#e5e5ea] sm:h-12 sm:w-12 sm:text-2xl"
 >
 −
 </button>
 <button
 type="button"
 aria-label={`Increase ${name} quantity`}
 onClick={(e) => {
 e.stopPropagation();
 onUpdateQuantity(1);
 }}
 className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 sm:h-12 sm:w-12"
 >
 <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
 </button>
 <span className="absolute left-1/2 top-0 flex h-10 min-w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white/95 px-3 text-sm font-bold text-[#1d1d1f] shadow-sm backdrop-blur-md sm:h-12 sm:min-w-16 sm:px-4 sm:text-base">
 {quantity}
 </span>
 </>
 ) : isAvailable ? (
                <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 onAdd();
                  }}
 className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 sm:h-12 sm:w-12"
 aria-label={`Add ${name} to cart`}
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
                </button>
              ) : (
                <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 sm:h-12 sm:w-12">
                  <span className="text-[10px] font-bold uppercase">OUT</span>
                </div>
              )}
 </div>
 </div>
 </div>
 </article>
 );
}
