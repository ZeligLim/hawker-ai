const fs = require('fs');
const file = 'app/(customer)/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const orderLinks = useMemo(`;
const index1 = content.indexOf(target1);
if (index1 !== -1) {
  content = content.slice(0, index1) + `  const [showAllOrders, setShowAllOrders] = useState(false);\n\n` + content.slice(index1);
  console.log("Patched state correctly");
}

fs.writeFileSync(file, content);
