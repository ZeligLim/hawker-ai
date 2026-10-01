const fs = require('fs');
const file = 'lib/database.types.ts';
let content = fs.readFileSync(file, 'utf8');

// Find exactly the orders table
const ordersRowIndex = content.indexOf('orders: {\n        Row: {\n          created_at: string');
if (ordersRowIndex !== -1) {
  content = content.replace('orders: {\n        Row: {\n          created_at: string', 'orders: {\n        Row: {\n          payment_id?: string | null\n          payment_provider?: string | null\n          payment_status?: string | null\n          created_at: string');
  content = content.replace('Insert: {\n          created_at?: string\n          customer_id: string', 'Insert: {\n          payment_id?: string | null\n          payment_provider?: string | null\n          payment_status?: string | null\n          created_at?: string\n          customer_id: string');
  content = content.replace('Update: {\n          created_at?: string\n          customer_id?: string', 'Update: {\n          payment_id?: string | null\n          payment_provider?: string | null\n          payment_status?: string | null\n          created_at?: string\n          customer_id?: string');
  fs.writeFileSync(file, content);
} else {
  console.log("Could not find orders table");
}
