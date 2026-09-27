with open("components/owner/owner-guard.tsx", "r") as f:
    content = f.read()

start = content.find(" // Authenticated, but not registered as a shop owner")
end = content.find(" return <>{children}</>;", start)

replace = """ // Authenticated, but not registered as a shop owner
 if (!roles.hasShopOwner) {
   if (pathname !== '/shop-owner/profile') {
     if (typeof window !== 'undefined') {
       router.push('/shop-owner/profile');
     }
     return null;
   }
   return <>{children}</>;
 }

"""

content = content[:start] + replace + content[end:]

with open("components/owner/owner-guard.tsx", "w") as f:
    f.write(content)
