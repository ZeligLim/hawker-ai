const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import useSearchParams
if (!content.includes('useSearchParams')) {
    content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";');
}

// Add inside OrdersPage
content = content.replace('export default function OrdersPage() {', `export default function OrdersPage() {
  const searchParams = useSearchParams();
  const returnOrderId = searchParams.get('orderId');

  useEffect(() => {
    if (returnOrderId) {
      // Poll or fetch receipt
      let active = true;
      const fetchReceipt = async () => {
        try {
          const res = await fetch(\`/api/orders/\${returnOrderId}\`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.receipt) {
              setPlacedReceipt(data.receipt);
              saveActiveOrder(data.receipt, getCurrentTableSession().tableId ?? null);
              if (data.receipt.paymentStatus === 'PAID') {
                setCartItems([]);
                setCheckoutState("success");
                router.replace('/orders'); // Clean URL
              }
            }
          }
        } catch(e) {}
      };
      
      const timer = setInterval(() => {
         if (active && !placedReceipt) fetchReceipt();
      }, 2000);
      
      fetchReceipt();
      return () => { active = false; clearInterval(timer); };
    }
  }, [returnOrderId, router, setCartItems]);
`);

fs.writeFileSync(file, content);
