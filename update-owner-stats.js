const fs = require('fs');
const path = 'src/app/(stall)/owner/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="rounded-\[20px\] sm:rounded-\[20px\] bg-white p-3 sm:p-5 flex flex-col justify-between overflow-hidden"/g, 'className="rounded-[16px] sm:rounded-[16px] bg-white p-3 sm:p-4 flex flex-col justify-between overflow-hidden"');
content = content.replace(/text-lg sm:text-3xl font-semibold/g, 'text-lg sm:text-2xl font-semibold');

fs.writeFileSync(path, content);
console.log("Updated owner stats card");
