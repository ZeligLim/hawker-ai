const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the checkout function completely
content = content.replace(/const checkout = async \(\) => \{[\s\S]*?setCheckoutState\("idle"\);\n\s*\}\n\s*\};/, `const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutError("");
    setCheckoutState("generating_intent");

    try {
      const session = getCurrentTableSession();
      if (!session || !session.tableId) {
        throw new Error("No active table session found");
      }

      const payloadItems = cartItems.map(item => ({
        dishId: item.dishId,
        name: item.name,
        quantity: item.quantity,
        customizations: item.customizations,
        specialInstructions: item.specialInstructions
      }));

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          tableSessionId: session.tableId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to payment provider
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "Payment service unavailable");
      setCheckoutState("idle");
    }
  };`);

// And I also noticed earlier there's `const [airwallexElement, setAirwallexElement] = useState<any>(null);` that I want to remove. Wait, let me check if it's there.
content = content.replace(/const \[airwallexElement, setAirwallexElement\] = useState<any>\(null\);\n/, '');

// Remove use of useEffect containing airwallexElement
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(checkoutState === "airwallex_ready".*?\}\n\s*\}, \[checkoutState, airwallexElement, submitFinalOrder\]\);/s, '');

// Also let's fix `import { init as initAirwallex, createElement as createAirwallexElement } from "@airwallex/components-sdk";`
content = content.replace(/import\s*\{\s*init\s*as\s*initAirwallex,\s*createElement\s*as\s*createAirwallexElement,?\s*\}\s*from\s*"@airwallex\/components-sdk";/, '');

fs.writeFileSync(file, content);
