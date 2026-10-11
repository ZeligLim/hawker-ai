const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace(
  "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04\n  useEffect(() => {",
  "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router]);\n\n  // If table was passed directly via QR scan URL e.g. /scan?table=04\n  useEffect(() => {"
);

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
console.log('Done');
