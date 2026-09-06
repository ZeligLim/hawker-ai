import Link from 'next/link';

const planOptions = ['Starter', 'Growth', 'Scale'];

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#1d1d1f]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            hawker.com
          </Link>
          <Link href={'/plans' as any} className="rounded-full border border-[#1d1d1f]/15 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:border-[#1d1d1f]/35">
            Back to plans
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-[#e4ddd4] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f5e5e]">Website subscription onboarding</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Set up your stall or venue in minutes</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#4d4d4d]">
              Start your free onboarding, pick the best plan for your business, and let Hawker turn your menu into a modern ordering experience.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#303030]">Business name</label>
                <input className="w-full rounded-2xl border border-[#e4ddd4] bg-[#faf8f5] px-4 py-3 outline-none ring-0 placeholder:text-[#808080]" placeholder="Hawker Centre No. 1" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#303030]">Your name</label>
                <input className="w-full rounded-2xl border border-[#e4ddd4] bg-[#faf8f5] px-4 py-3 outline-none ring-0 placeholder:text-[#808080]" placeholder="Alicia Tan" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#303030]">Email</label>
                <input type="email" className="w-full rounded-2xl border border-[#e4ddd4] bg-[#faf8f5] px-4 py-3 outline-none ring-0 placeholder:text-[#808080]" placeholder="you@business.com" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#303030]">Select a plan</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {planOptions.map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      className="rounded-2xl border border-[#e4ddd4] bg-[#faf8f5] px-4 py-3 text-left transition hover:border-[#1d1d1f]/30 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-[#1d1d1f]">{plan}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] bg-[#1d1d1f] p-6 text-white shadow-[0_20px_50px_rgba(17,17,17,0.12)] sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d8d8d8]">What you get</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Everything you need to launch fast</h2>

            <ul className="mt-8 space-y-4 text-[#ededed]">
              {[
                'Digital menu and ordering flow for each stall',
                'Order notifications and owner dashboard',
                'Booth analytics and performance insights',
                'Free setup guidance and onboarding support',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f7d45a] text-xs font-black text-[#1d1d1f]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-[#d7d7d7]">Starting from</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight">$29</span>
                <span className="pb-1 text-sm text-[#d7d7d7]">/month</span>
              </div>
            </div>

            <Link href={'/subscribe' as any} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#f7d45a] px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f4c641]">
              Continue onboarding
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
