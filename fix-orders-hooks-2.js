const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The hooks are currently at lines 65 and 67
// Let's remove them from there and place them at the top.
content = content.replace(/  const \{ cartItems, setCartItems \} = useCartItems\(\);\n/, '');
content = content.replace(/  const router = useRouter\(\);\n/, '');

// Now add them exactly after returnOrderId
content = content.replace(/const returnOrderId = searchParams.get\('orderId'\);\n/, `const returnOrderId = searchParams.get('orderId');\n  const { cartItems, setCartItems } = useCartItems();\n  const router = useRouter();\n`);

fs.writeFileSync(file, content);
