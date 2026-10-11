const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace("import { Suspense, useEffect, useState } from 'react';", "import { Suspense, useEffect, useState, useCallback } from 'react';");
code = code.replace("const linkTable = async (rawTable: string, rawCentre?: string) => {", "const linkTable = useCallback(async (rawTable: string, rawCentre?: string) => {");

const target = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };";
const replacement = "      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router]);";

const parts = code.split(target);
if (parts.length > 1) {
  const lastPart = parts.pop();
  code = parts.join(target) + replacement + lastPart;
}

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
