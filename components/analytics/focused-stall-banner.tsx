import { Store, X } from 'lucide-react';

export function FocusedStallBanner({
  selectedBooth,
  selectedBoothIndex,
  totalBooths,
  activePeriodDescription,
  totalRevenue,
  totalOrders,
  onClear,
}: {
  selectedBooth: any;
  selectedBoothIndex: number;
  totalBooths: number;
  activePeriodDescription: string;
  totalRevenue: number;
  totalOrders: number;
  onClear: () => void;
}) {
  if (!selectedBooth) return null;

  return (
    <div className="mt-4 rounded-[24px] bg-[#111827] text-white p-5 sm:p-6 shadow-sm border border-black/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shrink-0">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{selectedBooth.name}</h2>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                Rank #{selectedBoothIndex + 1} of {totalBooths}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Individual booth metrics for {activePeriodDescription.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition-all self-start sm:self-auto cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          <span>Show All Stalls</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-[11px] text-white/60">Stall Sales</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            RM {selectedBooth.periodRevenue.toFixed(2)}
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">
            {totalRevenue > 0 ? ((selectedBooth.periodRevenue / totalRevenue) * 100).toFixed(1) : 0}% of venue total
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-[11px] text-white/60">Orders Fulfilled</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            {selectedBooth.periodOrders.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">
            {totalOrders > 0 ? ((selectedBooth.periodOrders / totalOrders) * 100).toFixed(1) : 0}% of venue orders
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-[11px] text-white/60">Average Ticket</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            RM {selectedBooth.periodOrders > 0 ? (selectedBooth.periodRevenue / selectedBooth.periodOrders).toFixed(2) : '0.00'}
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">Spend per order</p>
        </div>

        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-[11px] text-white/60">Operational Status</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {selectedBooth.periodOrders > 0 ? 'Active' : 'Idle'}
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">
            {selectedBooth.periodOrders > 0 ? 'Processing orders' : 'No orders in period'}
          </p>
        </div>
      </div>
    </div>
  );
}
