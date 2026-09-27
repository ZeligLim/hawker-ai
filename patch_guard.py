with open("components/owner/owner-guard.tsx", "r") as f:
    content = f.read()

import re

target1 = r"<Link\n href=\{'/apply' as any\}\n className=\"w-full rounded-2xl bg-\[#f5f5f7\] py-3 text-sm font-medium text-\[#1d1d1f\] hover:bg-\[#e8e8ed\] \"\n >\n Register Your Hawker Centre\n </Link>"
replace1 = """<Link
 href={'/shop-owner/profile' as any}
 className="w-full rounded-2xl bg-[#f5f5f7] py-3 text-sm font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] "
 >
 Register Your Hawker Centre
 </Link>"""

content = re.sub(target1, replace1, content)

target_block = r"  // Authenticated, but not registered as a shop owner[\s\S]*?  return <>{children}</>;"

replace_block = """  // Authenticated, but not registered as a shop owner
  if (!roles.hasShopOwner) {
    if (pathname !== '/shop-owner/profile') {
      if (typeof window !== 'undefined') {
        router.push('/shop-owner/profile');
      }
      return null;
    }
    return <>{children}</>;
  }

  return <>{children}</>;"""

content = re.sub(target_block, replace_block, content)

with open("components/owner/owner-guard.tsx", "w") as f:
    f.write(content)
print("Patched guard again")
