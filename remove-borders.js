const fs = require('fs');
const glob = require('glob');

const borderRegex = /\s(border(-[a-z0-9/\[\]\.-]+)?|divide(-[a-z0-9/\[\]\.-]+)?|ring(-[a-z0-9/\[\]\.-]+)?|outline-[a-z0-9/\[\]\.-]+|focus:border-[a-z0-9/\[\]\.-]+|hover:border-[a-z0-9/\[\]\.-]+|focus:ring-[a-z0-9/\[\]\.-]+|hover:ring-[a-z0-9/\[\]\.-]+)(?=\s|"|'|`|}|\})/g;

function cleanString(str) {
  let initial = str;
  let current = initial.replace(borderRegex, '');
  while (current !== initial) {
    initial = current;
    current = initial.replace(borderRegex, '');
  }
  return current;
}

const files = glob.sync('src/**/*.{tsx,ts,jsx,js}', { ignore: 'node_modules/**' });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = cleanString(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Removed borders from ${file}`);
  }
}
