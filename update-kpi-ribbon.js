const fs = require('fs');

const path = 'src/components/analytics/kpi-ribbon.tsx';
let content = fs.readFileSync(path, 'utf8');

// The user wants a compact design. 
// "Reduce the height of the three statistics cards. Keep labels, values and supporting text visually grouped. Use consistent spacing across all three cards."

// Replace outer section gap/margin
content = content.replace(/className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"/, 'className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"');

// Replace card padding and flex
const oldCardRegex = /className="col-span-2 md:col-span-1 lg:col-span-1 rounded-\[22px\] bg-white p-4 sm:p-5 flex flex-col justify-between"|className="rounded-\[22px\] bg-white p-4 sm:p-5 flex flex-col justify-between"/g;
content = content.replace(oldCardRegex, (match) => {
  if (match.includes('col-span-2')) {
    return 'className="col-span-2 md:col-span-1 lg:col-span-1 rounded-[16px] bg-white p-3 sm:p-4"';
  }
  return 'className="rounded-[16px] bg-white p-3 sm:p-4"';
});

// Replace mt-3 with a tighter margin
content = content.replace(/<div className="mt-3">/g, '<div className="mt-1.5">');

// Make text slightly more compact
content = content.replace(/text-xl sm:text-2xl lg:text-3xl/g, 'text-lg sm:text-xl lg:text-2xl');

fs.writeFileSync(path, content);
console.log("Updated KPI Ribbon");
