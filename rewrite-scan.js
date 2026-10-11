const fs = require('fs');

let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');
code = code.replace(
  "    } catch {\n      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });\n      setStatus('success');\n      setMessage(`Saved ${label}. Proceeding to stall...`);\n      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  };",
  "    } catch {\n      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });\n      setStatus('success');\n      setMessage(`Saved ${label}. Proceeding to stall...`);\n      setTimeout(() => {\n        router.push('/stall' as any);\n      }, 600);\n    }\n  }, [router]);"
);

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
