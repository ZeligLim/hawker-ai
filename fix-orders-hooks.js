const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Move hooks before useEffect
content = content.replace(/export default function OrdersPage\(\) \{\n  const searchParams = useSearchParams\(\);\n  const returnOrderId = searchParams.get\('orderId'\);\n\n  useEffect\(\(\) => \{/, `export default function OrdersPage() {
  const searchParams = useSearchParams();
  const returnOrderId = searchParams.get('orderId');
  const router = useRouter();
  const { cartItems, setCartItems } = useCartItems();

  useEffect(() => {`);

// Remove the old hooks declaration
content = content.replace(/  const \{ cartItems, setCartItems \} = useCartItems\(\);\n/, '');
content = content.replace(/  const router = useRouter\(\);\n/, '');

// Fix specialInstructions
content = content.replace(/specialInstructions: item.specialInstructions/g, 'specialInstructions: item.notes');

fs.writeFileSync(file, content);
