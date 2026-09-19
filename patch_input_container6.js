const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

// Fix the last remaining inner icon (Send icon) that didn't get caught because it had no -ml-0.5
content = content.replace('<Send className="h-3.5 w-3.5" />', '<Send className="h-4 w-4" />');

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);
