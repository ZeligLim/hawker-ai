const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

// Replace the placeholder string
content = content.replace(
  /placeholder="vendor@email\.com to send setup link"/g,
  'placeholder="vendor@email.com"'
);

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
