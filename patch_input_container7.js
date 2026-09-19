const fs = require('fs');
let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const regex = /<div className="mt-4 rounded-\[20px\] bg-\[#f5f5f7\] p-3\.5 \/\[0\.04\]">\s*<div className="flex items-center gap-2">([\s\S]*?)<\/div>\s*<\/div>/g;

content = content.replace(regex, (match) => {
  let newInner = match
    .replace('<div className="mt-4 rounded-[20px] bg-[#f5f5f7] p-3.5 /[0.04]">\n                    <div className="flex items-center gap-2">', '<div className="mt-4 flex items-center gap-2">')
    .replace('className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868b]"', 'className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]"')
    .replace('className="w-full rounded-full bg-white shadow-sm py-1.5 pl-8 pr-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus: focus:outline-none"', 'className="h-11 w-full rounded-full bg-[#f5f5f7] py-2 pl-9 pr-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors hover:bg-neutral-200 focus:bg-neutral-200"')
    .replace('placeholder="vendor@email.com to send setup link"', 'placeholder="vendor@email.com"')
    .replace('className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"', 'className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white transition-colors hover:bg-black disabled:opacity-50 shadow-xs"')
    .replace('className="h-3.5 w-3.5 animate-spin"', 'className="h-4 w-4 animate-spin"')
    .replace('className="h-3.5 w-3.5 -ml-0.5"', 'className="h-4 w-4 -ml-0.5"')
    .replace('className="h-3.5 w-3.5"', 'className="h-4 w-4"');
  
  // Note: the regex matches `</div>\n                  </div>`. We need to just remove one `</div>`
  newInner = newInner.replace(/<\/div>\s*<\/div>$/, '</div>');
  return newInner;
});

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
