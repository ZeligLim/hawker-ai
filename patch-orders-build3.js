const fs = require('fs');
let text = fs.readFileSync('app/(customer)/orders/page.tsx', 'utf8');

text = text.replace('      id: result.order.id,\n      queueNumber: result.order.queue_number,', '      orderId: result.order.id,\n      queueNumber: result.order.queue_number,');

fs.writeFileSync('app/(customer)/orders/page.tsx', text);

let receiptText = fs.readFileSync('components/customer-receipt.tsx', 'utf8');
receiptText = receiptText.replace('  id: string;', '  orderId: string;\n  queueNumber: string;');
fs.writeFileSync('components/customer-receipt.tsx', receiptText);
