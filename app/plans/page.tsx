import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for a single hawker stall or a small booth.',
    features: ['Menu management', 'Order notifications', 'Basic analytics', '1 staff profile'],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$79',
    description: 'Built for venues with multiple stalls and repeat customers.',
    features: ['Everything in Starter', 'Multi-booth management', 'Advanced analytics', 'Guest loyalty tools'],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$149',
    description: 'For larger food halls and enterprise operators.',
    features: ['Everything in Growth', 'Priority onboarding', 'Custom reporting', 'Dedicated support'],
    featured: false,
  },
];

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#1d1d1f]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            hawker.com
          </Link>
          <Link
            href="https://app.hawker.com"
            className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a3a3c]"
          >
            app.hawker.com
          </Link>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[#626262]">Simple pricing</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Choose the plan that fits your stall</h1>
          <p className="mt-5 text-lg text-[#4c4c4d]">
            Launch your digital menu, manage orders, and turn customer demand into repeat business with fewer admin headaches.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[28px] border p-6 shadow-sm ${
                plan.featured
                  ? 'border-[#121212] bg-[#1d1d1f] text-white'
                  : 'border-[#e4ddd4] bg-white text-[#1d1d1f]'
              }`}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className={`mt-2 text-sm ${plan.featured ? 'text-[#d7d7d7]' : 'text-[#636363]'}`}>{plan.description}</p>
                </div>
                {plan.featured ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-[#f5f3ef]">Popular</span> : null}
              </div>

              <div className="mb-6 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                <span className={`pb-1 text-sm ${plan.featured ? 'text-[#d7d7d7]' : 'text-[#636363]'}`}>/month</span>
              </div>

              <ul className={`space-y-3 ${plan.featured ? 'text-[#f2f2f2]' : 'text-[#373737]'}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${plan.featured ? 'bg-[#f7d45a]' : 'bg-[#1d1d1f]'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/shop-owner/profile"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-[#f7d45a] text-[#1d1d1f] hover:bg-[#f4c641]'
                    : 'bg-[#1d1d1f] text-white hover:bg-[#3a3a3c]'
                }`}
              >
                {plan.featured ? 'Start free trial' : 'Choose plan'}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] border border-[#e4ddd4] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#676767]">Need a custom setup?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Talk to us about larger food halls</h2>
            </div>
            <Link
              href="/shop-owner/profile"
              className="inline-flex items-center justify-center rounded-full bg-[#f7d45a] px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f4c641]"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
