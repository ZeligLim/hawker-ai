const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace(
  "const linkTable = async (rawTable: string, rawCentre?: string) => {",
  "const linkTable = React.useCallback(async (rawTable: string, rawCentre?: string) => {"
);

// We find the LAST instance of "  };\n\n  // If table was passed directly"
const parts = code.split("  };\n\n  // If table was passed directly");
if (parts.length > 1) {
  const lastPart = parts.pop();
  code = parts.join("  };\n\n  // If table was passed directly") + "  }, [router, initialTable, initialCentre, supabase]);\n\n  // If table was passed directly" + lastPart;
}

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
console.log('Done');
