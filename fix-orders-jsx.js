const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the lonely '(' and ')}' around the button
content = content.replace(/\n\s*\(\n\s*<button/, '\n              <button');
content = content.replace(/Pay with TNG"\}\n\s*<\/button>\n\s*\)\}/, 'Pay with TNG"}\n                </button>');

// Also change onClick={() => void checkout()} to onClick={handleCheckout} which is what it should be
content = content.replace(/onClick=\{.*?checkout\(\)\}/, 'onClick={handleCheckout}');

fs.writeFileSync(file, content);
