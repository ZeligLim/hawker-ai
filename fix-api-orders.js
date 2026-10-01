const fs = require('fs');
let file = 'app/api/orders/[id]/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/subtotal: i.customizations: i.customizations,/g, 'subtotal: i.quantity * i.unit_price,\n                customizations: i.customizations,');
fs.writeFileSync(file, content);
