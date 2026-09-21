import { PieChart } from 'lucide-react';

const colorPalette = [
 'bg-[#111827]',
 'bg-emerald-600',
 'bg-blue-600',
 'bg-indigo-500',
 'bg-violet-500',
 'bg-amber-500',
 'bg-rose-500',
];

export function RevenueShare({
 totalRevenue,
 booths,
}: {
 totalRevenue: number;
 booths: any[];
}) {
 return (
 <div className="rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
 

 {totalRevenue === 0 ? (
 <p className="text-xs text-[#86868b] italic py-2">
 No sales recorded for this timeframe.
 </p>
 ) : (
 <>
 {/* Segmented Bar Chart */}
 <div className="flex h-3 w-full overflow-hidden rounded-full bg-black/5 gap-0.5">
 {booths.slice(0, 6).map((booth, idx) => {
 const pct = (booth.periodRevenue / totalRevenue) * 100;
 if (pct <= 0) return null;
 return (
 <div
 key={booth.id || booth.name}
 className={`h-full ${colorPalette[idx % colorPalette.length]} `}
 style={{ width: `${pct}%` }}
 title={`${booth.name}: ${pct.toFixed(1)}%`}
 />
 );
 })}
 </div>

 {/* Legend */}
 <div className="mt-4 space-y-2">
 {booths.slice(0, 5).map((booth, idx) => {
 const pct = totalRevenue > 0 ? (booth.periodRevenue / totalRevenue) * 100 : 0;
 return (
 <div key={booth.id || booth.name} className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2 min-w-0">
 <span
 className={`h-2.5 w-2.5 rounded-full shrink-0 ${
 colorPalette[idx % colorPalette.length]
 }`}
 />
 <span className="truncate font-medium text-[#1d1d1f]">{booth.name}</span>
 </div>
 <span className="font-semibold text-[#1d1d1f] shrink-0">
 {pct.toFixed(1)}%
 </span>
 </div>
 );
 })}
 </div>
 </>
 )}
 </div>
 );
}
