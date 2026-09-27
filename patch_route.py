with open("app/api/owner/shops/route.ts", "r") as f:
    content = f.read()

# For GET, add phone, lat, lng to the select query of restaurants
content = content.replace(
    ".select('id, name, slug, address, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')",
    ".select('id, name, slug, address, phone, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at')"
)

content = content.replace(
    ".select('restaurant_id, role, restaurants(name, slug, address, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at)')",
    ".select('restaurant_id, role, restaurants(name, slug, address, phone, lat, lng, is_active, schedule, status, fee_payer, platform_fee_fixed, platform_fee_percent, ai_enabled, created_at)')"
)

content = content.replace(
    ".select('restaurant_id, role, restaurants(name, slug, address, created_at)')",
    ".select('restaurant_id, role, restaurants(name, slug, address, phone, lat, lng, created_at)')"
)

# In the map, add phone, lat, lng
content = content.replace(
    "address: restaurant?.address ?? null,",
    "address: restaurant?.address ?? null,\n      phone: restaurant?.phone ?? null,\n      lat: restaurant?.lat ?? 0,\n      lng: restaurant?.lng ?? 0,"
)

# For POST insert
content = content.replace(
    ".select('id, name, slug, address, lat, lng, created_at')",
    ".select('id, name, slug, address, phone, lat, lng, created_at')"
)

with open("app/api/owner/shops/route.ts", "w") as f:
    f.write(content)
print("Patched route")
