const fs = require('fs');
const file = 'app/api/orders/[id]/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.select\(\`[\s\S]*?`\)/, `.select(\`
        id,
        created_at,
        subtotal,
        service_fee,
        total,
        payment_status,
        merchant_orders (
          id,
          food_outlet_id,
          food_outlets (
            name,
            restaurants ( name )
          ),
          order_items (
            id,
            dish_name,
            quantity,
            unit_price,
            customizations
          )
        )
      \` as any)`);

fs.writeFileSync(file, content);
