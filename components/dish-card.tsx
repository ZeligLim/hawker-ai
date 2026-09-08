'use client';

import React from 'react';
import { Leaf, Plus } from 'lucide-react';

export interface DishCardProps {
  id: string;
  name: string;
  price: number;
  isVegetarian?: boolean;
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
  imageUrl,
  quantity = 0,
  onAdd,
  onUpdateQuantity,
}: DishCardProps) {
  const initial = name.trim().split(/\s+/)[0] || 'Dish';

  return (
    <article
      data-dish-id={id}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[24px] bg-white border border-black/[0.04] shadow-[0_8px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all"
    >
      {/* Top Image / Media Area */}
      <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden bg-gradient-to-br from-[#fbf8f3] to-[#f2ede4]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center">
            <span className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-[#6b582b] select-none">
              {initial}
            </span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute left-2.5 top-2.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
          RM {price.toFixed(2)}
        </div>

        {/* Vegetarian Badge */}
        {isVegetarian ? (
          <div
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
            title="Vegetarian"
            aria-label="Vegetarian"
          >
            <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        ) : null}

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

      {/* Dish Name & Info Below */}
      <div className="flex flex-col justify-between p-3 sm:p-3.5">
        <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-[#1d1d1f] leading-snug">
          {name}
        </h3>
      </div>
    </article>
  );
}
