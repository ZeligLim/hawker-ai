const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const startStr = '{/* Send Setup Link Section */}';
const endStr = 'aria-label="Send setup link"\n                        title="Send setup link"\n                      >\n                        {isSending ? (\n                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />\n                        ) : (\n                          <Send className="h-3.5 w-3.5" />\n                        )}\n                      </button>\n                    </div>\n                  </div>';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
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
                  </div>`;
  
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endStr.length);
  fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
} else {
  console.log("Could not find start or end index");
  console.log("Start idx:", startIdx);
  console.log("End idx:", endIdx);
}

