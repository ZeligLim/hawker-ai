import re

with open("app/(website)/apply/page.tsx", "r") as f:
    content = f.read()

# 1. Add ArrowLeft import
content = content.replace("ArrowRight,", "ArrowLeft,\n  ArrowRight,")

# 2. Replace Header right side with Back button
header_target = """          <div className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-[#1d1d1f] flex items-center justify-center font-bold">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-[#1d1d1f] font-semibold truncate max-w-[140px] sm:max-w-none">
                  {displayName}
                </span>
              </div>
            ) : (
              <Link
                href="/auth?redirect=/apply"
                className="text-[#0071e3] hover:underline px-2 py-1 font-semibold"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#1d1d1f]/[0.08] hover:bg-black/[0.04] text-[#1d1d1f] text-xs font-semibold transition-colors"
            >
              Exit
            </Link>
          </div>"""

header_replace = """          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#1d1d1f]/[0.08] hover:bg-black/[0.04] text-[#1d1d1f] text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
          </div>"""
content = content.replace(header_target, header_replace)

# 3. Remove Header Info & Account Separation Banner
header_info_pattern = r"\{/\* Header info \*/\}.*?\{/\* Error banner if any \*/\}"
content = re.sub(header_info_pattern, "{/* Error banner if any */}", content, flags=re.DOTALL)

# 4. Modify Venue Profile Fields (just in case they want it simplified too, or just the location ones)
# Venue Name
venue_name_target = """                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Hawker Centre / Food Hall Name <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lot 10 Hutong Food Hall\""""
venue_name_replace = """                  <div className="space-y-1.5 sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Hawker Centre / Food Hall Name *\""""
content = content.replace(venue_name_target, venue_name_replace)

# 5. Modify Location Fields
city_target = """                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      City / Region <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kuala Lumpur\""""
city_replace = """                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="City / Region *\""""
content = content.replace(city_target, city_replace)

phone_target = """                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Operator Contact / WhatsApp <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +60 12-345 6789\""""
phone_replace = """                  <div className="space-y-1.5">
                    <input
                      type="tel"
                      required
                      placeholder="Operator Contact / WhatsApp *\""""
content = content.replace(phone_target, phone_replace)

address_target = """                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Full Street Address <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50 Jalan Sultan, City Centre\""""
address_replace = """                  <div className="space-y-1.5 sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Street Address (Use Google Maps to find location address) *\""""
content = content.replace(address_target, address_replace)

# 6. Remove Seating Capacity
seating_pattern = r"<div className=\"space-y-1\.5 sm:col-span-2\">\s*<label className=\"text-xs font-semibold text-\[#1d1d1f\]\">\s*Estimated Seating / Table Capacity\s*</label>\s*<input\s*type=\"text\"\s*placeholder=\"e.g. 40 tables \(approx. 160 diners\)\"\s*value=\{tableCount\}\s*onChange=\{\(e\) => setTableCount\(e.target.value\)\}\s*className=\"[^\"]*\"\s*/>\s*</div>"
content = re.sub(seating_pattern, "", content, flags=re.DOTALL)

# 7. Remove Section 3 (Activation & stall policy)
section3_pattern = r"\{/\* Section 3: Status & Review \*/\}.*?(?=\{/\* Submit Button \*/\})"
content = re.sub(section3_pattern, "", content, flags=re.DOTALL)

# 8. Button text
btn_target = """                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Registering Hawker Shop...
                  </>
                ) : (
                  <>
                    Register Hawker Shop
                    <ArrowRight className="w-4 h-4" />
                  </>"""
btn_replace = """                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register
                    <ArrowRight className="w-4 h-4" />
                  </>"""
content = content.replace(btn_target, btn_replace)

with open("app/(website)/apply/page.tsx", "w") as f:
    f.write(content)
print("Patched apply page")
