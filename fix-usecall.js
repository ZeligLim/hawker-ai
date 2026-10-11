const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

const target = `    } catch {\n      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });\n      setStatus('success');\n      setMessage(\`Saved \${label}. Proceeding to stall...\`);\n      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };`;

const replacement = `    } catch {\n      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });\n      setStatus('success');\n      setMessage(\`Saved \${label}. Proceeding to stall...\`);\n      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router, supabase]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
  console.log('Replaced correctly');
} else {
  console.log('Target not found!');
}
