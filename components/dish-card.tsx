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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_8px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all"
    >
      {/* Visual Picture-Only Card Area */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-gradient-to-br from-[#f8f6f0] to-[#eee8db]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center">
            <UtensilsCrossed className="h-8 w-8 text-[#a8a29e]" strokeWidth={1.5} />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute left-2.5 top-2.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
          RM {price.toFixed(2)}
        </div>

        {/* Dietary / Spicy Badges */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          {/* Vegetarian Badge */}
          {isVegetarian ? (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
              title="Vegetarian"
              aria-label="Vegetarian"
            >
              <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          ) : null}

          {/* Spicy Badge (shown when spicy level is 1 or higher) */}
          {spiceLevel !== undefined && spiceLevel >= 1 ? (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm border border-red-200"
              title={`Spicy Level ${spiceLevel}`}
              aria-label={`Spicy Level ${spiceLevel}`}
            >
              <Flame className="h-3.5 w-3.5 fill-red-500/20" strokeWidth={2} />
            </div>
          ) : null}
        </div>

        {/* Quantity Controls Floating on Image Bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          {quantity > 0 ? (
            <div className="flex w-full items-center justify-between rounded-full bg-white/95 px-2 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-md border border-black/5">
              <button
                type="button"
                aria-label={`Decrease ${name} quantity`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(-1);
                }}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-base sm:text-lg font-bold text-[#1d1d1f] hover:bg-[#e5e5ea] active:scale-95 transition-all"
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
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#111827] text-base sm:text-lg font-bold text-white hover:bg-black active:scale-95 transition-all"
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
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#111827] text-white shadow-[0_8px_18px_rgba(17,24,39,0.2)] hover:bg-black hover:scale-105 active:scale-95 transition-all"
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
