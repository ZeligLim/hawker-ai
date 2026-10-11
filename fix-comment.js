const fs = require('fs');

let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');
homePage = homePage.replace(/\/\* Full-Screen List View \(Only shown when toggled to List view\) \*\//, '{/* Full-Screen List View */}');
homePage = homePage.replace(/\{\/\* 2\. Main Content: Map View or List View \*\/\}/, '{/* 2. Main Content */}');
fs.writeFileSync('src/components/home-page.tsx', homePage);
