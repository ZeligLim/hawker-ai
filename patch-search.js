const fs = require('fs');
let file = 'components/hawker-search.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  " const = isDark ? ']' : ']';",
  " const borderClass = isDark ? 'border-none' : 'border-none';"
);
text = text.replace(/\$\{undefined\}/g, '');
text = text.replace(/\$\{\}/g, '');

fs.writeFileSync(file, text);
