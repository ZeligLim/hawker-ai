const fs = require('fs');
let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');

const startStr = "{viewMode === 'map' ? (";
const startIdx = homePage.indexOf(startStr);
const dividerStr = `        </>
      ) : (
        /* Full-Screen List View (Only shown when toggled to List view) */`;
const divIdx = homePage.indexOf(") : (", startIdx);
const endIdx = homePage.indexOf("{pendingNavCentre && (");

const listViewJSX = homePage.substring(divIdx + 5, endIdx).trim();

// Keep everything before the toggle
homePage = homePage.substring(0, startIdx) + listViewJSX + '\n      ' + homePage.substring(endIdx);
fs.writeFileSync('src/components/home-page.tsx', homePage);
console.log('Success');
