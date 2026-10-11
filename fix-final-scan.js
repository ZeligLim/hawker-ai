const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace("const linkTable = async (rawTable: string, rawCentre?: string) => {", "const linkTable = React.useCallback(async (rawTable: string, rawCentre?: string) => {");

const target = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };";
const replacement = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router, supabase]);";

const idx = code.lastIndexOf(target);
if (idx !== -1) {
  code = code.substring(0, idx) + replacement + code.substring(idx + target.length);
  fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
  console.log('Fixed');
} else {
  console.log('Not found');
}
