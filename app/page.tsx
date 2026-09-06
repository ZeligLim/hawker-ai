import Link from 'next/link';

const features = [
  {
    title: 'Digital menus that convert',
    description: 'Keep every stall discoverable with live menus, menu photos, and fast order flows built for mobile customers.',
  },
  {
    title: 'Orders without chaos',
    description: 'Give shop owners a single view of incoming orders, stall performance, and customer demand across the venue.',
  },
  {
    title: 'Data your team can act on',
    description: 'Track daily sales, booth performance, and peak demand so operators can make better staffing and stock decisions.',
  },
];

const stats = [
  { value: '15 min', label: 'average setup' },
  { value: '3x', label: 'more repeat orders' },
  { value: '24/7', label: 'digital storefront' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#1d1d1f]">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
        <header className="flex items-center justify-between gap-4 rounded-full border border-[#e4ddd4] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d1d1f] text-sm font-black text-[#f5f3ef]">H</div>
            <div>
              <p className="text-lg font-black tracking-tight">hawker.com</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-[#4d4d4d] md:flex">
            <Link href="#features">Features</Link>
            <Link href="#plans">Plans</Link>
            <Link href="#why-hawker">Why Hawker</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={'/plans' as any} className="rounded-full border border-[#1d1d1f]/15 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:border-[#1d1d1f]/35">
              Plans
            </Link>
            <Link href={'/subscribe' as any} className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a3a3c]">
              Start free
            </Link>
          </div>
        </header>

        <div className="grid items-center gap-10 pb-12 pt-12 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#dfd6ca] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[#515151]">
              Built for hawker centres & food halls
            </p>
            <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Turn every stall into a better customer experience.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4b4b4d]">
              Hawker helps customers discover food faster, helps stall owners manage orders without stress, and gives operators a clear view of performance across the whole venue.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={'/subscribe' as any} className="rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3a3c]">
                Start free trial
              </Link>
              <Link href={'/plans' as any} className="rounded-full border border-[#1d1d1f]/15 bg-white px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:border-[#1d1d1f]/35">
                View plans
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-sm text-[#5c5c5d]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#e4ddd4] bg-white p-5 shadow-[0_20px_50px_rgba(17,17,17,0.08)]">
            <div className="rounded-[26px] bg-[#1d1d1f] p-5 text-[#f5f3ef]">
              <div className="mb-6 flex items-center justify-between text-sm text-[#d6d6d6]">
                <span>Live hawker centre</span>
                <span className="rounded-full bg-[#f7d45a] px-2 py-1 font-medium text-[#1d1d1f]">+18.4%</span>
              </div>

              <div className="space-y-4">
                {[
                  { stall: 'Nasi Lemak', order: '42 orders', amount: '$288' },
                  { stall: 'Char Kway Teow', order: '38 orders', amount: '$261' },
                  { stall: 'Satay Corner', order: '27 orders', amount: '$198' },
                ].map((item) => (
                  <div key={item.stall} className="rounded-2xl bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{item.stall}</p>
                        <p className="text-sm text-[#d6d6d6]">{item.order}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#f7d45a]">{item.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f5e5e]">Why operators choose Hawker</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything you need to run a food venue more smoothly</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7d45a] text-lg font-black text-[#1d1d1f]">✓</div>
              <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#4b4b4d]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="why-hawker" className="bg-[#171718] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#d7d7d7]">For customers</p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">Faster discovery. Simpler ordering.</h3>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-2xl font-black">Browse by vibe</p>
              <p className="mt-3 text-[#d9d9d9]">Search by food type, stall, or craving to find the right dish in seconds.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-2xl font-black">Track in real time</p>
              <p className="mt-3 text-[#d9d9d9]">Know when your order is accepted, prepared, and ready to collect.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#5f5e5e]">Pricing</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Launch your shop in a few clicks</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            ['Starter', '$29', 'For one stall or a compact booth.'],
            ['Growth', '$79', 'For multi-booth venues and growing demand.'],
            ['Scale', '$149', 'For larger operators managing multiple locations.'],
          ].map(([name, price, blurb], index) => (
            <div key={name} className={`rounded-[28px] border p-6 ${index === 1 ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-[#e4ddd4] bg-white text-[#1d1d1f]'}`}>
              <p className="text-lg font-semibold">{name}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight">{price}</span>
                <span className={`pb-1 text-sm ${index === 1 ? 'text-[#d7d7d7]' : 'text-[#636363]'}`}>/month</span>
              </div>
              <p className={`mt-4 text-sm ${index === 1 ? 'text-[#d7d7d7]' : 'text-[#575757]'}`}>{blurb}</p>
              <Link
                href={'/plans' as any}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  index === 1 ? 'bg-[#f7d45a] text-[#1d1d1f] hover:bg-[#f4c641]' : 'bg-[#1d1d1f] text-white hover:bg-[#3a3a3c]'
                }`}
              >
                {index === 1 ? 'Start free trial' : 'Choose plan'}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
