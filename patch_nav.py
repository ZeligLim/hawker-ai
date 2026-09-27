with open("components/marketing-nav.tsx", "r") as f:
    content = f.read()

content = content.replace("href={'/apply' as any}", "href={'/shop-owner/profile' as any}")
content = content.replace("Start Free (Register Shop)", "Open Settings")
content = content.replace(">\\n            Start Free\\n          </Link>", ">\\n            Open Settings\\n          </Link>")

with open("components/marketing-nav.tsx", "w") as f:
    f.write(content)
print("Patched nav")
