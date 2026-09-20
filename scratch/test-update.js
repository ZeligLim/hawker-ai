const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k) acc[k] = v.join('=').replace(/^"|"$/g, '');
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data: shops, error: shopsError } = await supabase.from('restaurants').select('id').limit(1);
  if (shopsError) { console.error('Shops error', shopsError); return; }
  console.log('shop:', shops[0].id);
  const { data, error } = await supabase.from('restaurants').update({ platform_fee_percent: 0.10 }).eq('id', shops[0].id).select();
  console.log('Update result:', { data, error });
}
run();
