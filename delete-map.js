const fs = require('fs');

let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');

// Remove HawkerMap import
homePage = homePage.replace(/import \{ HawkerMap \} from '@\/components\/hawker-map';\n/, '');

// Remove viewMode state
homePage = homePage.replace(/const \[viewMode, setViewMode\] = useState<'map' \| 'list'>\('map'\);\n/, '');

// Remove selectedCentreId state
homePage = homePage.replace(/const \[selectedCentreId, setSelectedCentreId\] = useState<string \| null>\(null\);\n/, '');

// Remove map-related derived state (selectedCentre)
homePage = homePage.replace(/const selectedCentre = useMemo\(\(\) => \{\n    return centres\.find\(\(c\) => c\.id === selectedCentreId\) \|\| null;\n  \}, \[centres, selectedCentreId\]\);\n/, '');

// Remove handleSelectCentre
homePage = homePage.replace(/const handleSelectCentre = useCallback\(\(c: HawkerCentreSummary\) => \{\n    setSelectedCentreId\(c\.id\);\n  \}, \[\]\);\n/, '');

// Remove the map/list toggle UI block
const toggleUI = `              {/* View Mode Toggle: Map vs List (Pure White inactive, Pure Black active, h-11, 0 border) */}
              <div className="flex items-center bg-white p-1 rounded-full shadow-md">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={\`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold \${
                    viewMode === 'map'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-transparent text-black hover:bg-neutral-100'
                  }\`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={\`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold \${
                    viewMode === 'list'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-transparent text-black hover:bg-neutral-100'
                  }\`}
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
              </div>`;
homePage = homePage.replace(toggleUI, '');

// Clean up wrapping `viewMode === 'list' ? 'bg-[#f5f5f7]' : 'bg-white'`
homePage = homePage.replace(
  /className=\{\`fixed inset-0 w-screen h-screen overflow-hidden text-black \$\{viewMode === 'list' \? 'bg-\[#f5f5f7\]' : 'bg-white'\}\`\}/,
  'className="fixed inset-0 w-screen h-screen overflow-hidden text-black bg-[#f5f5f7]"'
);

// We need to replace the entire rendering of `viewMode === 'map'` with just the list view.
// It's probably easier to read the file, locate the `{viewMode === 'map' ? (` block, and extract the else branch.
