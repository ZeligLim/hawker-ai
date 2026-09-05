export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20">
        <header className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
            Hawker Menu Intelligence
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Discover dishes by taste, budget, and dietary needs.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            This foundation sets up the app shell, environment boundaries, and database schema
            needed for the AI-powered hawker search experience.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm font-semibold text-amber-300">Budget</p>
            <p className="mt-2 text-2xl font-bold">RM5–RM25</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm font-semibold text-amber-300">Dietary</p>
            <p className="mt-2 text-2xl font-bold">Vegetarian, Halal, Spice</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm font-semibold text-amber-300">Search</p>
            <p className="mt-2 text-2xl font-bold">Natural language</p>
          </div>
        </section>
      </div>
    </main>
  );
}
