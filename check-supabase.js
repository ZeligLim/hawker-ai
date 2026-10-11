const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from('merchant_orders')
    .select(`
      id,
      order_id,
      food_outlet_id,
      status,
      previous_status,
      subtotal,
      merchant_payout_amount,
      created_at,
      updated_at,
      orders(
        table_session_id
      ),
      order_items(
        id,
        dish_id,
        dish_name,
        unit_price,
        quantity,
        customizations,
        notes
      )
    `)
    .limit(1);

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Data:", data);
  }
}
main();
