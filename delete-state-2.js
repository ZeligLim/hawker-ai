const fs = require('fs');

let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');

homePage = homePage.replace(/const selectedCentre = useMemo\(\s*\(\) => filteredCentres\.find\(\(c\) => c\.id === selectedCentreId\) \?\? null,\s*\[filteredCentres, selectedCentreId\]\s*\);\n/g, '');

homePage = homePage.replace(/const handleSelectCentre = useCallback\(\(c: HawkerCentreSummary\) => \{\n setSelectedCentreId\(c\.id\);\n \}, \[\]\);\n/g, '');

// Clean up wrapping `viewMode === 'list' ? 'bg-[#f5f5f7]' : 'bg-white'`
homePage = homePage.replace(
  /className=\{\`fixed inset-0 w-screen h-screen overflow-hidden text-black \$\{viewMode === 'list' \? 'bg-\[#f5f5f7\]' : 'bg-white'\}\`\}/g,
  'className="fixed inset-0 w-screen h-screen overflow-hidden text-black bg-[#f5f5f7]"'
);

// Remove toggle UI
homePage = homePage.replace(/<div className="flex items-center bg-white p-1 rounded-full shadow-md">[\s\S]*?<\/button>\n\s*<\/div>\n\s*<div className="flex items-center gap-2">/, '<div className="flex items-center gap-2">');

fs.writeFileSync('src/components/home-page.tsx', homePage);
