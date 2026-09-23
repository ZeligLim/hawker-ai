const fs = require('fs');
let file = 'app/(customer)/orders/page.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  "id: result.order.id,",
  "id: result.orderId || (result.order && result.order.id),"
);

fs.writeFileSync(file, text);
