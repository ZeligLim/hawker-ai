import re

with open("app/api/owner/shops/route.ts", "r") as f:
    content = f.read()

target1 = """  const address = typeof body?.address === 'string' ? body.address.trim() : null;"""
replace1 = """  const address = typeof body?.address === 'string' ? body.address.trim() : null;
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : null;"""
content = content.replace(target1, replace1)

target2 = """  const { data: restaurant, error: insertRestaurantError } = await dbClient
    .from('restaurants')
    .insert({
      name,
      slug,
      address,
      lat: typeof body?.lat === 'number' ? body.lat : 0,
      lng: typeof body?.lng === 'number' ? body.lng : 0,
    })"""
replace2 = """  const { data: restaurant, error: insertRestaurantError } = await dbClient
    .from('restaurants')
    .insert({
      name,
      slug,
      address,
      phone,
      lat: typeof body?.lat === 'number' ? body.lat : 0,
      lng: typeof body?.lng === 'number' ? body.lng : 0,
    })"""
content = content.replace(target2, replace2)

with open("app/api/owner/shops/route.ts", "w") as f:
    f.write(content)
print("Patched route.ts POST")
