const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const regex = /\{\/\* Send Setup Link Section \*\/\}\s*<div className="mt-4 rounded-\[20px\] bg-\[#f5f5f7\] p-3\.5 border border-black\/\[0\.04\]">[\s\S]*?<div className="mb-2">[\s\S]*?<p className="text-xs font-semibold text-\[#1d1d1f\]">Send Setup Link<\/p>[\s\S]*?<p className="text-\[11px\] text-\[#6e6e73\] truncate">[\s\S]*?Enter the vendor&apos;s email to send a setup link\. Only the recipient can claim\.[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<div className="mt-2\.5 flex items-center gap-2">[\s\S]*?<div className="relative flex-1 min-w-0">[\s\S]*?<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 h-3\.5 w-3\.5 text-\[#86868b\]" \/>[\s\S]*?<input[\s\S]*?type="email"[\s\S]*?value=\{emailInputs\[booth\.id\] \?\? ''\}[\s\S]*?onChange=\{\(e\) =>[\s\S]*?setEmailInputs\(\(prev\) => \(\{ \.\.\.prev, \[booth\.id\]: e\.target\.value \}\)\)[\s\S]*?\}[\s\S]*?onKeyDown=\{\(e\) => \{[\s\S]*?if \(e\.key === 'Enter'\) \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?void handleSendSetupLink\(booth\.id\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?placeholder="vendor@email\.com to send setup link"[\s\S]*?className="w-full rounded-full bg-white shadow-sm py-1\.5 pl-8 pr-3 text-xs text-\[#1d1d1f\] placeholder:text-\[#86868b\] focus: focus:outline-none"[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?type="button"[\s\S]*?disabled=\{isSending\}[\s\S]*?onClick=\{\(\) => void handleSendSetupLink\(booth\.id\)\}[\s\S]*?className="flex h-8 w-8 items-center justify-center rounded-full bg-\[#111827\] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"[\s\S]*?>[\s\S]*?\{isSending \? \([\s\S]*?<LoaderCircle className="h-3\.5 w-3\.5 animate-spin" \/>[\s\S]*?\) : \([\s\S]*?<Send className="h-3\.5 w-3\.5 -ml-0\.5" \/>[\s\S]*?\)\}[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const replacement = `{/* Send Setup Link Section */}
                  <div className="mt-4 flex items-center gap-2">
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
                        className="h-11 w-full rounded-full bg-white shadow-sm py-2 pl-9 pr-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors hover:bg-neutral-50 focus:bg-neutral-50"
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
                  </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
