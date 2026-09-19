const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const regex = /<div className="mt-4 rounded-\[20px\] bg-\[#f5f5f7\] p-3\.5 border border-black\/\[0\.04\]">[\s\S]*?<div className="mt-2\.5 flex items-center gap-2">\s*<div className="relative flex-1 min-w-0">\s*<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 h-3\.5 w-3\.5 text-\[#86868b\]" \/>\s*<input[\s\S]*?className="w-full rounded-full border border-black\/10 bg-white py-1\.5 pl-8 pr-3 text-xs text-\[#1d1d1f\] placeholder:text-\[#86868b\] focus:border-black\/30 focus:outline-none"[\s\S]*?\/>\s*<\/div>\s*<button[\s\S]*?className="flex h-8 w-8 items-center justify-center rounded-full bg-\[#111827\] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"[\s\S]*?>[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/g;

content = content.replace(/<div className="mt-4 rounded-\[20px\] bg-\[#f5f5f7\] p-3\.5 border border-black\/\[0\.04\]">\s*<div className="mb-2">\s*<p className="text-xs font-semibold text-\[#1d1d1f\]">Send Setup Link<\/p>\s*<p className="text-\[11px\] text-\[#6e6e73\] truncate">\s*Enter the vendor&apos;s email to send a setup link\. Only the recipient can claim\.\s*<\/p>\s*<\/div>\s*<div className="mt-2\.5 flex items-center gap-2">\s*<div className="relative flex-1 min-w-0">\s*<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 h-3\.5 w-3\.5 text-\[#86868b\]" \/>\s*<input\s*type="email"\s*value=\{emailInputs\[booth\.id\] \?\? ''\}\s*onChange=\{\(e\) =>\s*setEmailInputs\(\(prev\) => \(\{ \.\.\.prev, \[booth\.id\]: e\.target\.value \}\)\)\s*\}\s*onKeyDown=\{\(e\) => \{\s*if \(e\.key === 'Enter'\) \{\s*e\.preventDefault\(\);\s*void handleSendSetupLink\(booth\.id\);\s*\}\s*\}\}\s*placeholder="vendor@stall\.com"\s*className="w-full rounded-full border border-black\/10 bg-white py-1\.5 pl-8 pr-3 text-xs text-\[#1d1d1f\] placeholder:text-\[#86868b\] focus:border-black\/30 focus:outline-none"\s*\/>\s*<\/div>\s*<button\s*type="button"\s*disabled=\{isSending\}\s*onClick=\{\(\) => void handleSendSetupLink\(booth\.id\)\}\s*className="flex h-8 w-8 items-center justify-center rounded-full bg-\[#111827\] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"\s*>\s*\{isSending \? \(\s*<LoaderCircle className="h-3\.5 w-3\.5 animate-spin" \/>\s*\) : \(\s*<Send className="h-3\.5 w-3\.5 -ml-0\.5" \/>\s*\)\}\s*<\/button>\s*<\/div>\s*<\/div>/g, 
`<div className="mt-4 flex items-center gap-2">
  <div className="relative flex-1 min-w-0">
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
    <input
      type="email"
      value={emailInputs[booth.id] ?? ''}
      onChange={(e) =>
        setEmailInputs((prev) => ({ ...prev, [booth.id]: e.target.value }))
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void handleSendSetupLink(booth.id);
        }
      }}
      placeholder="vendor@email.com"
      className="h-11 w-full rounded-full bg-white shadow-xs py-2 pl-9 pr-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors hover:bg-neutral-50"
    />
  </div>
  <button
    type="button"
    disabled={isSending}
    onClick={() => void handleSendSetupLink(booth.id)}
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white transition-colors hover:bg-black disabled:opacity-50 shadow-xs"
  >
    {isSending ? (
      <LoaderCircle className="h-4 w-4 animate-spin" />
    ) : (
      <Send className="h-4 w-4 -ml-0.5" />
    )}
  </button>
</div>`
);

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
