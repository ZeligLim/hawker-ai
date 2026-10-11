const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from('supabase_migrations.schema_migrations')
    .select('*')
    .limit(10);
  
  console.log(error || data);
}
main();
