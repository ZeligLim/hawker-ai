import Link from 'next/link';

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Orders</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">Your order status</h1>
        <div className="mt-5 rounded-[22px] border border-dashed border-[#dfe3ea] bg-[#f7f7f7] p-4 text-sm text-[#6e6e73]">
          You do not have any active orders yet.
        </div>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Browse dishes
        </Link>
      </div>
    </main>
  );
}
