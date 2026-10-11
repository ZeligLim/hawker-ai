const fs = require('fs');

let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');

// Remove HawkerMap import
homePage = homePage.replace(/import \{ HawkerMap \} from '@\/components\/hawker-map';\n/g, '');

// Remove viewMode state
homePage = homePage.replace(/const \[viewMode, setViewMode\] = useState<'map' \| 'list'>\('map'\);\n/g, '');

// Remove selectedCentreId state
homePage = homePage.replace(/const \[selectedCentreId, setSelectedCentreId\] = useState<string \| null>\(null\);\n/g, '');

// Remove MapPin import
homePage = homePage.replace(/ MapPin,\n/g, '');

// Remove map-related derived state (selectedCentre)
homePage = homePage.replace(/const selectedCentre = useMemo\(\(\) => \{\n let active = true;/, 'let active = true;'); // wait, the selected centre was inside a useMemo. I need a broader regex.

fs.writeFileSync('src/components/home-page.tsx', homePage);
