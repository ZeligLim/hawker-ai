const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace("const linkTable = async (rawTable: string, rawCentre?: string) => {", "const linkTable = React.useCallback(async (rawTable: string, rawCentre?: string) => {");

const target = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04";
const replacement = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router, supabase]);\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04";

code = code.replace(target, replacement);

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
