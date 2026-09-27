import re

with open("lib/database.types.ts", "r") as f:
    content = f.read()

# Row
content = re.sub(
    r'(restaurants:\s*\{\s*Row:\s*\{.*?)(name:\s*string)',
    r'\1name: string\n          phone: string | null',
    content,
    flags=re.DOTALL
)

# Insert
content = re.sub(
    r'(restaurants:\s*\{\s*Row:\s*\{.*?Insert:\s*\{.*?)(name:\s*string)',
    r'\1name: string\n          phone?: string | null',
    content,
    flags=re.DOTALL
)

# Update
content = re.sub(
    r'(restaurants:\s*\{\s*Row:\s*\{.*?Update:\s*\{.*?)(name\?:.*?string)',
    r'\1name?: string\n          phone?: string | null',
    content,
    flags=re.DOTALL
)

with open("lib/database.types.ts", "w") as f:
    f.write(content)
print("Updated database.types.ts")
