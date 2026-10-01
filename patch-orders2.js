const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The first patch might not have removed airwallex_ready correctly because of formatting.
// Let's do it manually just in case
content = content.replace(/\{checkoutState === "airwallex_ready" \? \([\s\S]*?\) : \(/, '(');
content = content.replace(/ \: "Pay"\}/, ' : "Pay with TNG"}');

fs.writeFileSync(file, content);
