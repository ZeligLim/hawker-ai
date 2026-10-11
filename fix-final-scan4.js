const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

const target = "    }\n  };\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04";
const rep = "    }\n  }, [router, supabase]);\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04";

if (code.includes(target)) {
  code = code.replace(target, rep);
  fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
  console.log("Replaced");
} else {
  console.log("NOT FOUND");
}
