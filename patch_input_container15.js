const fs = require('fs');
let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const regex = /<div className="mt-4 rounded-\[20px\] bg-\[#f5f5f7\] p-3\.5 border border-black\/\[0\.04\]">([\s\S]*?)<\/div>\s*\{\/\* Authorized Emails List \*\/\}/g;

content = content.replace(regex, (match, inner) => {
  // We need to keep the feedback block intact, but remove the outer wrapper div.
  // And replace the send setup link part.
  
  let newInner = inner;
  // Strip out the header
  newInner = newInner.replace(/<div className="mb-2">\s*<p className="text-xs font-semibold text-\[#1d1d1f\]">Send Setup Link<\/p>\s*<p className="text-\[11px\] text-\[#6e6e73\] truncate">\s*Enter the vendor&apos;s email to send a setup link\. Only the recipient can claim\.\s*<\/p>\s*<\/div>\s*/g, '');
  
  // Replace the input container
  newInner = newInner.replace(/<div className="mt-2\.5 flex items-center gap-2">[\s\S]*?<div className="relative flex-1 min-w-0">[\s\S]*?<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 h-3\.5 w-3\.5 text-\[#86868b\]" \/>[\s\S]*?<input[\s\S]*?type="email"[\s\S]*?value=\{emailInputs\[booth\.id\] \?\? ''\}[\s\S]*?onChange=\{\(e\) =>[\s\S]*?setEmailInputs\(\(prev\) => \(\{ \.\.\.prev, \[booth\.id\]: e\.target\.value \}\)\)[\s\S]*?\}[\s\S]*?onKeyDown=\{\(e\) => \{[\s\S]*?if \(e\.key === 'Enter'\) \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?void handleSendSetupLink\(booth\.id\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?placeholder="vendor@stall\.com"[\s\S]*?className="w-full rounded-full border border-black\/10 bg-white py-1\.5 pl-8 pr-3 text-xs text-\[#1d1d1f\] placeholder:text-\[#86868b\] focus:border-black\/30 focus:outline-none"[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?type="button"[\s\S]*?disabled=\{isSending\}[\s\S]*?onClick=\{\(\) => void handleSendSetupLink\(booth\.id\)\}[\s\S]*?className="flex h-8 w-8 items-center justify-center rounded-full bg-\[#111827\] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"[\s\S]*?aria-label="Send setup link"[\s\S]*?title="Send setup link"[\s\S]*?>[\s\S]*?\{isSending \? \([\s\S]*?<LoaderCircle className="h-3\.5 w-3\.5 animate-spin" \/>[\s\S]*?\) : \([\s\S]*?<Send className="h-3\.5 w-3\.5" \/>[\s\S]*?\)\}[\s\S]*?<\/button>[\s\S]*?<\/div>/g, 
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
                        className="h-11 w-full rounded-full bg-[#f5f5f7] py-2 pl-9 pr-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors hover:bg-neutral-200 focus:bg-neutral-200"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => void handleSendSetupLink(booth.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white transition-colors hover:bg-black disabled:opacity-50 shadow-xs"
                      aria-label="Send setup link"
                      title="Send setup link"
                    >
                      {isSending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>`);
                  
  return `<div className="mt-2 flex flex-col">${newInner}</div>\n                  {/* Authorized Emails List */}`;
});

// Also let's fix borders in the feedback block
content = content.replace(/border border-\[\#30d158\]\/20/g, 'shadow-xs');
content = content.replace(/border border-red-200/g, 'shadow-xs');
content = content.replace(/border-t border-black\/\[0\.04\]/g, '/[0.04]');

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
