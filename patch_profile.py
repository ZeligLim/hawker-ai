with open("app/(center)/shop-owner/profile/page.tsx", "r") as f:
    content = f.read()

# 1. Update draft state
target1 = """  const [draft, setDraft] = useState({
    name: '',
    address: '',
    slug: '',
  });"""
replace1 = """  const [draft, setDraft] = useState({
    name: '',
    address: '',
    slug: '',
    phone: '',
    lat: 0,
    lng: 0,
  });"""
content = content.replace(target1, replace1)

# 2. Update loadShop
target2 = """          name: nextShop.name,
          address: nextShop.address ?? '',
          slug: nextShop.slug ?? '',
        });"""
replace2 = """          name: nextShop.name,
          address: nextShop.address ?? '',
          slug: nextShop.slug ?? '',
          phone: (nextShop as any).phone ?? '',
          lat: (nextShop as any).lat ?? 0,
          lng: (nextShop as any).lng ?? 0,
        });"""
content = content.replace(target2, replace2)

# 3. Update handleSave
target3 = """        name: draft.name,
        address: draft.address,
        slug: draft.slug,
      }),"""
replace3 = """        name: draft.name,
        address: draft.address,
        slug: draft.slug,
        phone: draft.phone,
        lat: draft.lat,
        lng: draft.lng,
      }),"""
content = content.replace(target3, replace3)

# 4. Add fields
target4 = """              <label className="block text-sm font-medium">
                Address
                <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
              </label>"""
replace4 = """              <label className="block text-sm font-medium">
                Address
                <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
              </label>
              <label className="block text-sm font-medium">
                Phone
                <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
              </label>
              <div className="flex gap-4">
                <label className="block text-sm font-medium w-full">
                  Latitude
                  <input type="number" step="any" value={draft.lat} onChange={(event) => setDraft({ ...draft, lat: parseFloat(event.target.value) || 0 })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
                </label>
                <label className="block text-sm font-medium w-full">
                  Longitude
                  <input type="number" step="any" value={draft.lng} onChange={(event) => setDraft({ ...draft, lng: parseFloat(event.target.value) || 0 })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
                </label>
              </div>"""
content = content.replace(target4, replace4)

with open("app/(center)/shop-owner/profile/page.tsx", "w") as f:
    f.write(content)
print("Patched profile")
