const fs = require('fs');
let content = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// I notice the previous patch for "Apply Monday to all days" didn't hit because it failed due to not escaping characters? 
// Or maybe I missed it.
// Oh wait, `handleApplyToAll('mon')` button match was failing in `patch_apply.js` possibly. Let's do it simply string replace.

const applyBtn = `<button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  Apply Monday to all days
                </button>`;

const newApplyBtn = `<button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 shadow-xs"
                >
                  <Copy className="w-3 h-3" />
                  Apply Monday to all
                </button>`;

content = content.replace(applyBtn, newApplyBtn);

// Also remove borders from `<div className="divide-y divide-black/5 rounded-xl border border-black/5 bg-[#fafafa] overflow-hidden">`
content = content.replace(
  'className="divide-y divide-black/5 rounded-xl border border-black/5 bg-[#fafafa] overflow-hidden"',
  'className="rounded-2xl bg-[#f5f5f7] overflow-hidden p-1 flex flex-col gap-1"'
);

// We need to fix the children `div` of `DAYS_OF_WEEK.map`.
// It has: className={`p-3 transition-colors ${day.isOpen ? 'bg-white' : 'bg-[#f5f5f7]/60'}`}
content = content.replace(
  /className=\{`p-3 transition-colors \$\{[\s\S]*?day\.isOpen \? 'bg-white' : 'bg-\[\#f5f5f7\]\/60'[\s\S]*?\}`\}/g,
  "className={`rounded-xl p-3 transition-colors ${day.isOpen ? 'bg-white shadow-sm' : 'bg-transparent'}`}"
);

fs.writeFileSync('components/operating-schedule-modal.tsx', content);
