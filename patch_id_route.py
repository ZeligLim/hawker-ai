with open("app/api/owner/shops/[id]/route.ts", "r") as f:
    content = f.read()

# PATCH update
content = content.replace(
    ".select('id, name, slug, address, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')",
    ".select('id, name, slug, address, phone, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')"
)

# GET update
content = content.replace(
    ".select('id, name, slug, address, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')",
    ".select('id, name, slug, address, phone, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')"
)

# Add update.phone if present
update_replacement = """
  if (typeof body.address === 'string') {
    update.address = body.address.trim() || 'Address not set';
  }

  if (typeof body.phone === 'string') {
    update.phone = body.phone.trim();
  }
"""

content = content.replace(
    "  if (typeof body.address === 'string') {\n    update.address = body.address.trim() || 'Address not set';\n  }",
    update_replacement
)

# Update the type
type_replacement = """  const update: {
    is_active?: boolean;
    status?: string;
    name?: string;
    slug?: string;
    address?: string;
    phone?: string;
    lat?: number;
    lng?: number;"""

content = content.replace(
    """  const update: {
    is_active?: boolean;
    status?: string;
    name?: string;
    slug?: string;
    address?: string;
    lat?: number;
    lng?: number;""",
    type_replacement
)

with open("app/api/owner/shops/[id]/route.ts", "w") as f:
    f.write(content)
print("Patched id route")
