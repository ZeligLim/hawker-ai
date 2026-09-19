import { TrendingUp, ShoppingBag, Receipt, Store, Coins } from 'lucide-react';

export function KpiRibbon({
  totalRevenue,
  totalOrders,
  averageTicket,
  activeBoothCount,
  averageStallRevenue,
}: {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  activeBoothCount: number;
  averageStallRevenue: number;
}) {
  return (
    <section className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868b]">
          <span className="text-xs font-medium">Gross Revenue</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            RM {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868b]">
          <span className="text-xs font-medium">Total Orders</span>
          <ShoppingBag className="w-4 h-4 text-[#111827]" />
        </div>
        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {totalOrders.toLocaleString()}
          </p>
          
        </div>
      </div>

      <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868b]">
          <span className="text-xs font-medium">Average Ticket</span>
          <Receipt className="w-4 h-4 text-[#111827]" />
        </div>
        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            RM {averageTicket.toFixed(2)}
          </p>
          
        </div>
      </div>

      <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868b]">
          <span className="text-xs font-medium">Active Stalls</span>
          <Store className="w-4 h-4 text-[#111827]" />
        </div>
        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {activeBoothCount}
          </p>
          
        </div>
      </div>

      <div className="col-span-2 md:col-span-1 lg:col-span-1 rounded-[22px] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868b]">
          <span className="text-xs font-medium">Stall Avg. Sales</span>
          <Coins className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            RM {averageStallRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          
        </div>
      </div>
    </section>
  );
}
