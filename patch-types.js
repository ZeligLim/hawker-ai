const fs = require('fs');
const file = 'lib/database.types.ts';
let content = fs.readFileSync(file, 'utf8');

// Patch orders
content = content.replace(
  /orders: \{\n\s*Row: \{\n\s*created_at: string/g,
  'orders: {\n        Row: {\n          payment_id?: string | null;\n          payment_provider?: string | null;\n          payment_status?: string | null;\n          created_at: string'
);

content = content.replace(
  /orders: \{\n\s*Row: ([\s\S]*?)Insert: \{\n\s*created_at\?: string/g,
  (match, p1) => `orders: {\n        Row: ${p1}Insert: {\n          payment_id?: string | null;\n          payment_provider?: string | null;\n          payment_status?: string | null;\n          created_at?: string`
);

content = content.replace(
  /orders: \{\n\s*Row: ([\s\S]*?)Update: \{\n\s*created_at\?: string/g,
  (match, p1) => `orders: {\n        Row: ${p1}Update: {\n          payment_id?: string | null;\n          payment_provider?: string | null;\n          payment_status?: string | null;\n          created_at?: string`
);

fs.writeFileSync(file, content);
