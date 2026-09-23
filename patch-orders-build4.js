const fs = require('fs');
let text = fs.readFileSync('app/(customer)/orders/page.tsx', 'utf8');

text = text.replace('      orderId: result.order.id,\n      queueNumber: result.order.queue_number,', '      id: result.order.id,\n      queueNumber: result.order.queue_number,');

fs.writeFileSync('app/(customer)/orders/page.tsx', text);
