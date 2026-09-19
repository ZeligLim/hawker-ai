const fs = require('fs');

let content = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// Replace the button for "Apply Monday to all days" to make it look better
const applyBtnRegex = /<button\s*type="button"\s*onClick=\{\(\) => handleApplyToAll\('mon'\)\}\s*className="inline-flex items-center gap-1 text-\[11px\] font-medium text-blue-600 hover:text-blue-700 hover:underline"\s*>\s*<Copy className="w-3 h-3" \/>\s*Apply Monday to all days\s*<\/button>/g;

const betterBtn = `<button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-2.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200"
                >
                  <Copy className="w-3 h-3" />
                  Apply Monday to all
                </button>`;

content = content.replace(applyBtnRegex, betterBtn);

// Fix the "parent div of save schedule have diff background colour, when scroll up in user app, background colour different"
// Check where save button is.
