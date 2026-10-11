const fs = require('fs');

const path = 'src/app/(stall)/owner/orders/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update the initial error fetching block
content = content.replace(
  /if \(\!response\.ok\) \{ console\.error\("Frontend Orders Fetch Error:", await response\.text\(\)\);\n[ \t]*if \(active\) setError\('Failed to load orders\.'\);\n[ \t]*return;\n[ \t]*\}/,
  `if (!response.ok) {
          const errText = await response.text();
          console.error("Frontend Orders Fetch Error:", errText);
          let userMsg = 'Failed to load orders.';
          try {
            const parsed = JSON.parse(errText);
            if (parsed.error) userMsg = parsed.error;
          } catch (e) {}
          if (active) setError(userMsg);
          return;
        }`
);

// We need to change the rendering logic
// Instead of showing the error as just a little banner and then showing the empty state, 
// if there is an error during fetch and orders are empty, show a dedicated error state.
const oldSection = `{error ? (
 <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 text-xs font-medium text-rose-800 flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
 <span>{error}</span>
 </div>
 ) : null}

 {/* Tickets Section */}
 <section className="mt-6">
 {loading ? (
 <PageLoader text="Loading kitchen tickets" fullHeight={false} />
 ) : visibleOrders.length === 0 ? (`;

const newSection = `{error && orders.length > 0 ? (
 <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 text-xs font-medium text-rose-800 flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
 <span>{error}</span>
 </div>
 ) : null}

 {/* Tickets Section */}
 <section className="mt-6">
 {loading ? (
 <PageLoader text="Loading kitchen tickets" fullHeight={false} />
 ) : error && orders.length === 0 ? (
 <div className="rounded-[24px] bg-white p-10 text-center ">
 <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
 <p className="mt-3 text-sm font-medium text-[#1d1d1f]">Failed to load orders</p>
 <p className="text-xs text-[#86868b] mt-1">{error}</p>
 <button 
   onClick={() => { setLoading(true); setError(''); setRefreshTrigger(c => c + 1); }}
   className="mt-5 inline-flex items-center justify-center rounded-full bg-[#111827] px-5 py-2 text-xs font-semibold text-white hover:bg-black"
 >
   <RefreshCw className="mr-2 h-3.5 w-3.5" />
   Retry
 </button>
 </div>
 ) : visibleOrders.length === 0 ? (`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  fs.writeFileSync(path, content);
  console.log("Updated Orders page");
} else {
  console.log("Could not find old section to replace in Orders page.");
  // Let's do it with regex
  console.log("Doing regex replacement");
}

