const fs = require('fs');

const files = [
  'src/app/(center)/shop-owner/page.tsx',
  'src/app/(center)/shop-owner/analytics/page.tsx',
  'src/app/(stall)/owner/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Reduce mt-6 to mt-5
  content = content.replace(/className="mt-6 /g, 'className="mt-5 ');
  
  // Reduce gap-6 to gap-4 or gap-5
  content = content.replace(/gap-6/g, 'gap-4');
  
  // Reduce padding p-5 sm:p-6 -> p-4 sm:p-5
  content = content.replace(/p-5 sm:p-6/g, 'p-4 sm:p-5');
  
  // Reduce container rounded corners slightly
  content = content.replace(/rounded-\[26px\]/g, 'rounded-[20px]');
  content = content.replace(/rounded-\[24px\]/g, 'rounded-[20px]');
  content = content.replace(/rounded-\[22px\]/g, 'rounded-[16px]');
  
  // Specific blocks
  content = content.replace(/p-8/g, 'p-6'); // Empty state padding
  
  // Kpi ribbon if inline
  const oldKpiCard = /className="rounded-\[22px\] bg-white p-4 sm:p-5 flex flex-col justify-between"/g;
  content = content.replace(oldKpiCard, 'className="rounded-[16px] bg-white p-3 sm:p-4"');
  
  // If there's an mt-3 inside KPI cards
  content = content.replace(/<div className="mt-3">/g, '<div className="mt-1.5">');
  
  fs.writeFileSync(file, content);
  console.log("Updated", file);
}
