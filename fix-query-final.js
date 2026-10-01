const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  // Revert .from('... as any')
  c = c.replace(/\.from\('orders' as any\)/g, ".from('orders')");
  c = c.replace(/\.from\('merchant_orders' as any\)/g, ".from('merchant_orders')");
  c = c.replace(/\.from\('order_items' as any\)/g, ".from('order_items')");

  // Revert .select(`...` as any)
  c = c.replace(/ as any\)/g, ")");
  
  // Cast the entire result
  // Find `const { data: order, error } = await auth.client...` and append ` as any;` at the end
  // It's easier to just cast `order` as any when needed, but the compiler complains about the query.
  // Wait, if the query itself is wrong according to types, then `await client... as any` is enough.
  c = c.replace(/\.single\(\);/g, '.single() as any;');
  c = c.replace(/\.insert\(([\s\S]*?)\)\n\s*\.select\(\)\n\s*\.single\(\);/g, '.insert($1)\n      .select()\n      .single() as any;');
  
  fs.writeFileSync(file, c);
}

fixFile('app/api/orders/[id]/route.ts');
fixFile('app/api/payment/[paymentId]/route.ts');
fixFile('app/api/payment/route.ts');
fixFile('app/api/payment/webhook/route.ts');

