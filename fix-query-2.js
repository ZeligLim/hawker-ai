const fs = require('fs');

const f1 = 'app/api/payment/[paymentId]/route.ts';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/\.from\('orders'\)/g, `.from('orders' as any)`);
fs.writeFileSync(f1, c1);

const f2 = 'app/api/payment/webhook/route.ts';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/\.from\('orders'\)/g, `.from('orders' as any)`);
c2 = c2.replace(/\.from\('merchant_orders'\)/g, `.from('merchant_orders' as any)`);
fs.writeFileSync(f2, c2);

const f3 = 'app/api/payment/route.ts';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/\.from\('orders'\)/g, `.from('orders' as any)`);
c3 = c3.replace(/\.from\('merchant_orders'\)/g, `.from('merchant_orders' as any)`);
c3 = c3.replace(/\.from\('order_items'\)/g, `.from('order_items' as any)`);
fs.writeFileSync(f3, c3);

