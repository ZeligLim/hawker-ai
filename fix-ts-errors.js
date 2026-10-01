const fs = require('fs');

// 1. Fix app/api/orders/[id]/route.ts
let ordersRoute = fs.readFileSync('app/api/orders/[id]/route.ts', 'utf8');
ordersRoute = ordersRoute.replace(/subtotal,\s*customizations/g, 'customizations');
ordersRoute = ordersRoute.replace(/subtotal:\s*i\.subtotal,/g, 'subtotal: i.quantity * i.unit_price,');
fs.writeFileSync('app/api/orders/[id]/route.ts', ordersRoute);

// 2. Fix app/api/payment/route.ts
let paymentRoute = fs.readFileSync('app/api/payment/route.ts', 'utf8');
paymentRoute = paymentRoute.replace(/subtotal: i.subtotal,/g, ''); // Remove subtotal from orderItemsInsert
// For the group type issue:
paymentRoute = paymentRoute.replace(/for \(const \[outletId, group\] of Object\.entries\(outletGroups\)\) \{/, 'for (const [outletId, group] of Object.entries(outletGroups) as [string, any][]) {');
fs.writeFileSync('app/api/payment/route.ts', paymentRoute);

// 3. Fix components/rent-invoices.tsx
let rentInvoices = fs.readFileSync('components/rent-invoices.tsx', 'utf8');
rentInvoices = rentInvoices.replace(/import { init as initAirwallex, createElement as createAirwallexElement } from '@airwallex\/components-sdk';\n/, '');
rentInvoices = rentInvoices.replace(/const \[airwallexElement, setAirwallexElement\] = useState<any>\(null\);\n/, '');
rentInvoices = rentInvoices.replace(/useEffect\(\(\) => \{\n\s*if \(paymentStatus === 'ready'.*?\}\n\s*\}, \[paymentStatus, airwallexElement, payingInvoice\]\);\n/s, '');
rentInvoices = rentInvoices.replace(/const handlePay = async \(invoice: RentInvoice\) => \{[\s\S]*?catch \(err\) \{\n\s*setPaymentStatus\('error'\);\n\s*\}\n\s*\};/, `const handlePay = async (invoice: RentInvoice) => {
    setPayingInvoice(invoice);
    setPaymentStatus('generating');
    try {
      await authenticatedFetch(\`/api/owner/rent/\${invoice.id}/pay\`, { method: 'POST' });
      setPaymentStatus('success');
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'paid' } : inv));
    } catch (err) {
      setPaymentStatus('error');
    }
  };`);
rentInvoices = rentInvoices.replace(/\{paymentStatus === 'ready' && payingInvoice && \([\s\S]*?<\/[a-zA-Z]+>\n\s*\)\}\n/, '');
fs.writeFileSync('components/rent-invoices.tsx', rentInvoices);

