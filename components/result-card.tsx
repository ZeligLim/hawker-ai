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
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#34c759]/15 text-[#248a3d]"
                title="Vegetarian"
                aria-label="Vegetarian"
              >
                <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            ) : null}
            {dish.spiceLevel >= 1 ? (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff3b30]/15 text-[#ff3b30]"
                title={`Spicy Level ${dish.spiceLevel}`}
                aria-label={`Spicy Level ${dish.spiceLevel}`}
              >
                <Flame className="h-3.5 w-3.5 fill-[#ff3b30]/20" strokeWidth={2} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#8e8e93]">{dish.restaurantName}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">{dish.name}</h3>
        </div>
        <div className="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-sm font-medium text-[#1d1d1f]">RM {dish.price.toFixed(2)}</div>
      </div>

      <p className="mt-3 text-sm text-[#8e8e93]">{dish.stallName}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        {dish.isVegetarian ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#34c759]/12 px-2.5 py-1 text-[#248a3d]">
            <Leaf className="h-3 w-3" strokeWidth={2} /> Vegetarian
          </span>
        ) : (
          <span className="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-[#8e8e93]">Non-veg</span>
        )}
        <span className="rounded-full bg-[#007aff]/10 px-2.5 py-1 text-[#0071e3]">{dish.isHalal ? 'Halal' : 'Non-halal'}</span>
        {dish.spiceLevel >= 1 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ff3b30]/12 px-2.5 py-1 text-[#ff3b30]">
            <Flame className="h-3 w-3 fill-[#ff3b30]/20" strokeWidth={2} />
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
        <p className="text-xs font-semibold text-[#86868b]">Why it matches</p>
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
        className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[#007aff] hover:bg-[#0071e3] px-5 text-sm font-semibold text-white transition-all shadow-xs active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        <span>Add to order</span>
      </button>
    </article>
  );
}
