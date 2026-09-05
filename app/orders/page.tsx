import Link from 'next/link';

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
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.06em]">Your order</h1>
            </div>
            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3c3c43]">
              Ready
            </span>
          </div>

          <div className="mt-5 rounded-[22px] bg-[#111827] p-4 text-white shadow-[0_16px_32px_rgba(17,24,39,0.18)]">
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
          </div>
        </section>

        <section className="mt-6 rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Details</h2>
            <span className="text-sm text-[#6e6e73]">{orderItems.length} items</span>
          </div>

          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-[16px] bg-[#f5f5f7] px-3 py-2.5">
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
    </main>
  );
}
