const fs = require('fs');
let file = 'app/api/outlets/route.ts';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  "  if (!supabase) return NextResponse.json({ outlets: [] });",
  "  if (!supabase) { return NextResponse.json({ outlets: [] }); }"
);

// Ah wait TS is complaining that `supabase` can be null later on? Wait. Let me check the file structure exactly.
