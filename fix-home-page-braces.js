const fs = require('fs');

let homePage = fs.readFileSync('src/components/home-page.tsx', 'utf8');
homePage = homePage.replace(/ \)\}\n      \{pendingNavCentre/, '      {pendingNavCentre');
fs.writeFileSync('src/components/home-page.tsx', homePage);
