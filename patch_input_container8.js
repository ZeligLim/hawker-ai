const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

const target = `<div className="mt-4 rounded-[20px] bg-[#f5f5f7] p-3.5 /[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868b]" />
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
                          className="w-full rounded-full bg-white shadow-sm py-1.5 pl-8 pr-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus: focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => void handleSendSetupLink(booth.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                      >
                        {isSending ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5 -ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>`;

const replacement = `<div className="mt-4 flex items-center gap-2">
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
                          className="h-11 w-full rounded-full bg-[#f5f5f7] shadow-sm py-2 pl-9 pr-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors hover:bg-neutral-200 focus:bg-neutral-200"
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

content = content.replace(target, replacement);

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
