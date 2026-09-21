export function OperationalInsights({
 topBooth,
 totalRevenue,
 activeBoothCount,
 totalBooths,
 totalOrders,
}: {
 topBooth: any;
 totalRevenue: number;
 activeBoothCount: number;
 totalBooths: number;
 totalOrders: number;
}) {
 return (
 <div className="rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="rounded-2xl bg-[#f5f5f7] p-3.5 .02]">
 <p className="text-xs font-semibold text-[#86868b]">Top earner</p>
 <p className="mt-1 text-sm font-semibold text-[#1d1d1f] truncate">
 {topBooth?.name ?? '—'}
 </p>
 <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
 {topBooth && totalRevenue > 0
 ? `${((topBooth.periodRevenue / totalRevenue) * 100).toFixed(1)}% venue volume`
 : 'No trading activity'}
 </p>
 </div>

 <div className="rounded-2xl bg-[#f5f5f7] p-3.5 .02]">
 <p className="text-xs font-semibold text-[#86868b]">Occupancy rate</p>
 <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">
 {totalBooths > 0 ? `${((activeBoothCount / totalBooths) * 100).toFixed(0)}%` : '0%'}
 </p>
 <p className="text-[11px] text-[#6e6e73] mt-0.5">
 {activeBoothCount} of {totalBooths} stalls active
 </p>
 </div>

 <div className="rounded-2xl bg-[#f5f5f7] p-3.5 .02]">
 <p className="text-xs font-semibold text-[#86868b]">Average stall velocity</p>
 <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">
 {activeBoothCount > 0 ? (totalOrders / activeBoothCount).toFixed(1) : 0} orders
 </p>
 <p className="text-[11px] text-[#6e6e73] mt-0.5">Per active stall</p>
 </div>
 </div>
 </div>
 );
}
