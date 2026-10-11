const fs = require('fs');

const path = 'src/components/analytics/stall-leaderboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container padding
content = content.replace(/className="rounded-\[26px\] bg-white p-5 sm:p-6 "/, 'className="rounded-[20px] bg-white p-4 sm:p-5"');

// Card padding and layout
const oldCardStr = 'className={`flex flex-col justify-between rounded-2xl cursor-pointer p-3.5 sm:p-4 ${ isSelected ? \'bg-white \' : \'bg-[#f5f5f7]/70 hover:bg-[#f5f5f7] \' }`}\n >\n <div>\n <div className="flex items-center justify-between gap-2">\n <h3 className="font-semibold text-[#1d1d1f] text-sm truncate">\n {booth.name}\n </h3>\n <span\n className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${medalClass}`}\n >\n #{index + 1}\n </span>\n </div>\n <p className="mt-1 text-xs text-[#86868b]">\n {booth.periodOrders} orders &bull; RM {stallAvgTicket.toFixed(2)} avg\n </p>\n </div>\n\n <div className="mt-4">\n <p className="text-lg font-bold tracking-tight text-[#1d1d1f]">\n RM {booth.periodRevenue.toFixed(2)}\n </p>\n <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">';

const newCardStr = 'className={`flex flex-col justify-between rounded-[16px] cursor-pointer p-3 ${ isSelected ? \'bg-white \' : \'bg-[#f5f5f7]/70 hover:bg-[#f5f5f7] \' }`}\n >\n <div>\n <div className="flex items-center justify-between gap-2">\n <h3 className="font-semibold text-[#1d1d1f] text-[13px] leading-tight truncate">\n {booth.name}\n </h3>\n <span\n className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${medalClass}`}\n >\n #{index + 1}\n </span>\n </div>\n <p className="text-[11px] leading-snug text-[#86868b] mt-0.5">\n {booth.periodOrders} orders &bull; RM {stallAvgTicket.toFixed(2)} avg\n </p>\n </div>\n\n <div className="mt-2.5 flex flex-col">\n <p className="text-sm font-bold tracking-tight text-[#1d1d1f] leading-none mb-1.5">\n RM {booth.periodRevenue.toFixed(2)}\n </p>\n <div className="h-1 w-full overflow-hidden rounded-full bg-black/5">';

content = content.replace(oldCardStr, newCardStr);

fs.writeFileSync(path, content);
console.log("Updated Stall Leaderboard");
