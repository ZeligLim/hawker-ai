#!/bin/bash
cat << 'PATCH' > /tmp/monetization.patch
--- app/(saas)/admin/monetization/page.tsx	2026-09-20 20:56:00.000000000 +0100
+++ app/(saas)/admin/monetization/page.tsx.new	2026-09-20 20:56:00.000000000 +0100
@@ -446,28 +446,28 @@
 
               {/* AI Capability Toggle */}
-              <div className="space-y-3 pt-3 border-t border-black/[0.06]">
-                <div className="flex items-center justify-between">
-                  <div>
-                    <h3 className="text-sm font-semibold text-[#1d1d1f]">AI Copilot Features</h3>
-                    <p className="mt-1 text-xs text-[#6e6e73]">
-                      Toggle AI smart scanning and search for this venue.
-                    </p>
-                  </div>
-                  <button
-                    type="button"
-                    role="switch"
-                    aria-checked={aiEnabled}
-                    onClick={() => setAiEnabled(!aiEnabled)}
-                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
-                      aiEnabled ? 'bg-emerald-600' : 'bg-gray-200'
-                    }`}
-                  >
-                    <span
-                      aria-hidden="true"
-                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
-                        aiEnabled ? 'translate-x-5' : 'translate-x-0'
-                      }`}
-                    />
-                  </button>
-                </div>
+              <div>
+                <label className="block text-xs font-semibold text-[#86868b] mb-2">
+                  AI Copilot Features
+                </label>
+                <div className="p-1 bg-black/[0.04] rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-1 border border-black/5">
+                  <button
+                    type="button"
+                    onClick={() => setAiEnabled(true)}
+                    className={`rounded-xl p-3 text-left transition-all ${
+                      aiEnabled
+                        ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
+                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40'
+                    }`}
+                  >
+                    <div className="flex items-center gap-1.5 text-xs font-semibold">
+                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
+                      AI Enabled
+                    </div>
+                    <p className="mt-0.5 text-[11px] text-[#86868b]">Smart scanning & search active.</p>
+                  </button>
+
+                  <button
+                    type="button"
+                    onClick={() => setAiEnabled(false)}
+                    className={`rounded-xl p-3 text-left transition-all ${
+                      !aiEnabled
+                        ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
+                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40'
+                    }`}
+                  >
+                    <div className="flex items-center gap-1.5 text-xs font-semibold">
+                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-[8px]">/</span>
+                      AI Disabled
+                    </div>
+                    <p className="mt-0.5 text-[11px] text-[#86868b]">Standard browsing only.</p>
+                  </button>
+                </div>
               </div>
 
@@ -491,10 +491,2 @@
                   <span>{saving ? 'Saving…' : 'Save'}</span>
                 </button>
-
-                {saveSuccess && (
-                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
-                    <Check className="h-3.5 w-3.5" />
-                    <span>Monetization settings updated</span>
-                  </span>
-                )}
               </div>
PATCH
patch app/(saas)/admin/monetization/page.tsx < /tmp/monetization.patch
