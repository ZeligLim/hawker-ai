const fs = require('fs');

let page = fs.readFileSync('src/app/(customer)/orders/page.tsx', 'utf8');
page = page.replace(
  'setPlacedReceipt(active);',
  '// eslint-disable-next-line react-hooks/set-state-in-effect\n      setPlacedReceipt(active);'
);

fs.writeFileSync('src/app/(customer)/orders/page.tsx', page);
