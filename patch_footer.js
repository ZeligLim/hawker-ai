const fs = require('fs');

let content = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// Fix border and background in the footer
content = content.replace(
  'className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#f5f5f7] border-t border-black/5"',
  'className="flex items-center justify-end gap-2.5 px-6 py-4 bg-white sticky bottom-0"'
);

// We need to make the container scroll properly without showing a different bg color behind the footer
content = content.replace(
  'className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"',
  'className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"'
);

// Oh, I see: `border-t border-black/5` violates 0-border rule. And `bg-[#f5f5f7]` is a diff color from the main white body.
// Wait, the main body is `<div className="flex-1 overflow-y-auto p-6 space-y-6">` but the parent modal wrapper is `bg-white`.
// Let's remove `border-t` and `bg-[#f5f5f7]`.

// Also the "Save Schedule" button is a blue square-ish one: `bg-blue-600 rounded-xl`. 
// The instructions say use `h-11 rounded-full bg-black`.
const saveBtnRegex = /className="inline-flex items-center gap-1\.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"/g;
content = content.replace(saveBtnRegex, 'className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white bg-black hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-xs"');

// And cancel button:
const cancelBtnRegex = /className="px-4 py-2 text-xs font-semibold text-\[#6e6e73\] hover:text-\[#1d1d1f\] rounded-xl transition"/g;
content = content.replace(cancelBtnRegex, 'className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"');

fs.writeFileSync('components/operating-schedule-modal.tsx', content);
