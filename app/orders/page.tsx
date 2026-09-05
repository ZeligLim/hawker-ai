import Link from 'next/link';
import { ClipboardList, House, Menu, UserRound } from 'lucide-react';

function HomeIcon({ active }: { active: boolean }) {
  return <House className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

function MenuIcon() {
  return <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function OrdersIcon({ active }: { active: boolean }) {
  return <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

function ProfileIcon({ active }: { active: boolean }) {
  return <UserRound className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon, active: false },
  { href: '/menu', label: 'Menu', icon: MenuIcon, active: false },
  { href: '/orders', label: 'Orders', icon: OrdersIcon, active: true },
  { href: '/profile', label: 'Profile', icon: ProfileIcon, active: false },
];

const directory = [
  { name: 'Ah Seng Chicken Rice', open: true, items: 12, eta: '10 min' },
  { name: 'Penang Corner', open: true, items: 9, eta: '12 min' },
  { name: 'Green Garden Vegetarian', open: true, items: 11, eta: '8 min' },
  { name: 'Curry House', open: false, items: 8, eta: 'Closed' },
];

const orderItems = [
  { name: 'Nasi Lemak', qty: 1, price: 8.5 },
  { name: 'Teh Tarik', qty: 2, price: 3.5 },
  { name: 'Curry Mee', qty: 1, price: 12 },
];

export default function OrdersPage() {
  const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Orders</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Your order</h1>
          </div>
          <div className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3c3c43]">
            Ready
          </div>
        </div>

        <section className="mt-5 rounded-[22px] bg-[#111827] p-4 text-white shadow-[0_16px_32px_rgba(17,24,39,0.18)]">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/70">
            <span>Current order</span>
            <span>Table 12</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.06em]">RM {total.toFixed(2)}</p>
              <p className="mt-1 text-sm text-white/75">3 items from 2 stalls</p>
            </div>
            <button type="button" className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#111827]">
              Checkout
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Hawker dir</h2>
            <Link href="/menu" className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
              View menu
            </Link>
          </div>

          <div className="space-y-2">
            {directory.map((stall) => (
              <div key={stall.name} className="flex items-center justify-between rounded-[18px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{stall.name}</p>
                  <p className="mt-0.5 text-xs text-[#6e6e73]">{stall.items} dishes · ETA {stall.eta}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${stall.open ? 'bg-[#ecfdf5] text-[#166534]' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
                  {stall.open ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Order details</h2>
            <span className="text-sm text-[#6e6e73]">3 items</span>
          </div>

          <div className="space-y-3 rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-3">
            {orderItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-[16px] bg-white px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.02)]">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{item.name}</p>
                  <p className="text-xs text-[#6e6e73]">Qty {item.qty}</p>
                </div>
                <p className="text-sm font-semibold text-[#1d1d1f]">RM {(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Browse dishes
        </Link>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-[#e4e4e7] bg-[#f7f7f7]/95 px-2 py-2 backdrop-blur-xl sm:max-w-[480px] lg:max-w-[960px] lg:rounded-t-[22px] lg:border-x lg:border-b lg:border-[#e5e7eb] lg:bg-white/95 lg:px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href as any}
              className={`flex flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-[11px] font-medium transition ${
                active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`flex h-7 w-7 items-center justify-center ${active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                <Icon active={active} />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
