import { LoaderCircle, Store, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const rankMedalStyles: Record<number, string> = {
  0: 'bg-amber-100 text-amber-800 ', // Gold
  1: 'bg-slate-100 text-slate-700 ', // Silver
  2: 'bg-orange-100 text-orange-800 ', // Bronze
};

export function StallLeaderboard({
  booths,
  loading,
  selectedBoothId,
  setSelectedBoothId,
  totalRevenue,
}: {
  booths: any[];
  loading: boolean;
  selectedBoothId: string;
  setSelectedBoothId: (id: string) => void;
  totalRevenue: number;
}) {
  const [showAllBooths, setShowAllBooths] = useState(false);

  const displayedBooths = showAllBooths ? booths : booths.slice(0, 6);
  const maxRevenue = booths.length > 0 ? booths[0].periodRevenue : 0;

  return (
    <div className="rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f]">
            Stall Performance Leaderboard
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#86868b]">
          <LoaderCircle className="w-4 h-4 animate-spin mr-2 text-[#111827]" />
          Loading performance data…
        </div>
      ) : booths.length === 0 ? (
        <div className="rounded-2xl bg-[#f5f5f7] p-8 text-center text-xs text-[#6e6e73]">
          <Store className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm text-[#1d1d1f]">No booth orders yet</p>
          <p className="mt-1">
            Sales data will appear here once stalls begin processing orders.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayedBooths.map((booth, index) => {
              const relativeWidth = maxRevenue > 0 ? (booth.periodRevenue / maxRevenue) * 100 : 0;
              const stallAvgTicket =
                booth.periodOrders > 0 ? booth.periodRevenue / booth.periodOrders : 0;
              const medalClass = rankMedalStyles[index] ?? 'bg-black/5 text-[#1d1d1f] ';
              const isSelected = booth.id === selectedBoothId;

              return (
                <div
                  key={booth.id || booth.name}
                  onClick={() => setSelectedBoothId(isSelected ? '' : booth.id)}
                  className={`flex flex-col justify-between rounded-2xl cursor-pointer p-3.5 sm:p-4 transition-all ${
                    isSelected
                      ? 'bg-white shadow-md ring-0'
                      : 'bg-[#f5f5f7]/70 hover:bg-[#f5f5f7] hover:shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#1d1d1f] text-sm truncate">
                        {booth.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${medalClass}`}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#86868b]">
                      {booth.periodOrders} orders &bull; RM {stallAvgTicket.toFixed(2)} avg
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                      RM {booth.periodRevenue.toFixed(2)}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {booths.length > 6 && (
            <div className="mt-4 text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllBooths(!showAllBooths)}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/5 hover:bg-black/10 px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition-all"
              >
                {showAllBooths ? 'Collapse to Top 6 (2-3 Rows)' : `View All ${booths.length} Stalls`}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllBooths ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
