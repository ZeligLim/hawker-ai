import type { SearchResult } from '@/lib/search/schema';
import { Flame, Leaf, Plus } from 'lucide-react';

const spiceLabels: Record<number, string> = {
  0: 'Non-spicy',
  1: 'Mild',
  2: 'Medium',
  3: 'Spicy',
  4: 'Extra Spicy',
  5: 'Fire',
};

export function ResultCard({
  dish,
  onAddToCart,
}: {
  dish: SearchResult;
  onAddToCart?: (dish: SearchResult) => void;
}) {
  return (
    <article className="rounded-[28px] border border-[#e5e7eb] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      {dish.imageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#f5f5f7] mb-3">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            {dish.isVegetarian ? (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
                title="Vegetarian"
                aria-label="Vegetarian"
              >
                <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            ) : null}
            {dish.spiceLevel >= 1 ? (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm border border-red-200"
                title={`Spicy Level ${dish.spiceLevel}`}
                aria-label={`Spicy Level ${dish.spiceLevel}`}
              >
                <Flame className="h-3.5 w-3.5 fill-red-500/20" strokeWidth={2} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e8e93]">{dish.restaurantName}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">{dish.name}</h3>
        </div>
        <div className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-sm font-medium text-[#1d1d1f]">RM {dish.price.toFixed(2)}</div>
      </div>

      <p className="mt-3 text-sm text-[#4b5563]">{dish.stallName}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        {dish.isVegetarian ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[#065f46]">
            <Leaf className="h-3 w-3" strokeWidth={2} /> Vegetarian
          </span>
        ) : (
          <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[#4b5563]">Non-veg</span>
        )}
        <span className="rounded-full bg-[#ecfeff] px-2.5 py-1 text-[#0f766e]">{dish.isHalal ? 'Halal' : 'Non-halal'}</span>
        {dish.spiceLevel >= 1 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-700 border border-red-100">
            <Flame className="h-3 w-3 fill-red-500/20" strokeWidth={2} />
            {spiceLabels[dish.spiceLevel as keyof typeof spiceLabels] ?? `Spicy ${dish.spiceLevel}`}
          </span>
        ) : (
          <span className="rounded-full bg-[#f5f3ff] px-2.5 py-1 text-[#6d28d9]">
            {spiceLabels[dish.spiceLevel as keyof typeof spiceLabels] ?? 'Non-spicy'}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-[#f7f7f7] p-3">
          <p className="text-[#6e6e73]">Protein</p>
          <p className="mt-1 font-semibold text-[#1d1d1f]">{dish.proteinGrams}g</p>
        </div>
        <div className="rounded-2xl bg-[#f7f7f7] p-3">
          <p className="text-[#6e6e73]">Match</p>
          <p className="mt-1 font-semibold text-[#1d1d1f]">{dish.matchScore.toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Why it matches</p>
        <ul className="mt-2 space-y-2 text-sm text-[#374151]">
          {dish.reasons.map((reason) => (
            <li key={reason} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onAddToCart?.(dish)}
        aria-label={`Add ${dish.name} to your order`}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
      >
        <Plus className="h-5 w-5" strokeWidth={2} />
      </button>
    </article>
  );
}
