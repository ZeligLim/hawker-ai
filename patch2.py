with open("app/(website)/apply/page.tsx", "r") as f:
    content = f.read()

start_tag = '<div className="flex items-center gap-3 text-xs font-medium">'
end_tag = ' </div>\n </div>\n </header>'

start_idx = content.find(start_tag)
end_idx = content.find(end_tag, start_idx)

if start_idx != -1 and end_idx != -1:
    replace = """<div className="flex items-center gap-3 text-xs font-medium">
 <Link
 href="/"
 className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-black/[0.04] text-[#1d1d1f] text-xs font-semibold"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Back
 </Link>
"""
    content = content[:start_idx] + replace + content[end_idx:]
    with open("app/(website)/apply/page.tsx", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found", start_idx, end_idx)
