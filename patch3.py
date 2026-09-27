import re

with open("app/(website)/apply/page.tsx", "r") as f:
    content = f.read()

# Venue Name
content = re.sub(
    r'<label className="text-xs font-semibold text-\[#1d1d1f\]">\s*Hawker Centre / Food Hall Name <span className="text-\[#ff3b30\]">\*</span>\s*</label>',
    '',
    content
)
content = re.sub(r'placeholder="e.g. Lot 10 Hutong Food Hall"', 'placeholder="Hawker Centre / Food Hall Name *"', content)

# City / Region
content = re.sub(
    r'<label className="text-xs font-semibold text-\[#1d1d1f\]">\s*City / Region <span className="text-\[#ff3b30\]">\*</span>\s*</label>',
    '',
    content
)
content = re.sub(r'placeholder="e.g. Kuala Lumpur"', 'placeholder="City / Region *"', content)

# Phone
content = re.sub(
    r'<label className="text-xs font-semibold text-\[#1d1d1f\]">\s*Operator Contact / WhatsApp <span className="text-\[#ff3b30\]">\*</span>\s*</label>',
    '',
    content
)
content = re.sub(r'placeholder="e.g. \+60 12-345 6789"', 'placeholder="Operator Contact / WhatsApp *"', content)

# Address
content = re.sub(
    r'<label className="text-xs font-semibold text-\[#1d1d1f\]">\s*Full Street Address <span className="text-\[#ff3b30\]">\*</span>\s*</label>',
    '',
    content
)
content = re.sub(r'placeholder="e.g. 50 Jalan Sultan, City Centre"', 'placeholder="Full Street Address (Use Google Maps to find location address) *"', content)

with open("app/(website)/apply/page.tsx", "w") as f:
    f.write(content)
