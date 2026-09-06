import Link from 'next/link';
import { BarChart3, Store } from 'lucide-react';

export function ShopOwnerNav({ active }: { active: 'booths' | 'analytics' }) {
  return (
    <nav aria-label="Shop owner navigation" className="mb-6 flex gap-2 rounded-[18px] bg-white p-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
      <Link
        href={'/booths' as any}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition ${
          active === 'booths' ? 'bg-[#111827] text-white' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
        }`}
        aria-current={active === 'booths' ? 'page' : undefined}
      >
        <Store className="h-4 w-4" />
        Booths
      </Link>
      <Link
        href={'/analytics' as any}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition ${
          active === 'analytics' ? 'bg-[#111827] text-white' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
        }`}
        aria-current={active === 'analytics' ? 'page' : undefined}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Link>
    </nav>
  );
}
