import re

with open("app/(center)/shop-owner/profile/page.tsx", "r") as f:
    content = f.read()

# 1. Update createForm state
content = content.replace(
    "const [createForm, setCreateForm] = useState({ name: '', address: '' });",
    "const [createForm, setCreateForm] = useState({ name: '', address: '', phone: '', lat: 0, lng: 0 });"
)

# 2. Update handleCreate body
target_body = """        name: createForm.name,
        address: createForm.address,
      }),"""
replace_body = """        name: createForm.name,
        address: createForm.address,
        phone: createForm.phone,
        lat: createForm.lat,
        lng: createForm.lng,
      }),"""
content = content.replace(target_body, replace_body)

# 3. Update handleCreate setCreateForm reset
content = content.replace(
    "setCreateForm({ name: '', address: '' });",
    "setCreateForm({ name: '', address: '', phone: '', lat: 0, lng: 0 });"
)

# 4. Add inputs to creation UI
target_ui = """ <label className="block text-sm font-medium">
 Address
 <input value={createForm.address} onChange={(event) => setCreateForm({ ...createForm, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
 </label>"""
replace_ui = """ <label className="block text-sm font-medium">
 Address
 <input value={createForm.address} onChange={(event) => setCreateForm({ ...createForm, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
 </label>
 <label className="block text-sm font-medium">
 Phone
 <input value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
 </label>
 <div className="flex gap-4">
 <label className="block text-sm font-medium w-full">
 Latitude
 <input type="number" step="any" value={createForm.lat} onChange={(event) => setCreateForm({ ...createForm, lat: parseFloat(event.target.value) || 0 })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
 </label>
 <label className="block text-sm font-medium w-full">
 Longitude
 <input type="number" step="any" value={createForm.lng} onChange={(event) => setCreateForm({ ...createForm, lng: parseFloat(event.target.value) || 0 })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
 </label>
 </div>"""
content = content.replace(target_ui, replace_ui)

with open("app/(center)/shop-owner/profile/page.tsx", "w") as f:
    f.write(content)
print("Patched create form")
