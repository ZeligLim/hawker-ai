const fs = require('fs');

let content = fs.readFileSync('app/(center)/shop-owner/booths/page.tsx', 'utf-8');

// Remove description from the venue hours button
content = content.replace(
  "description: 'Configure automated operating hours and weekly schedule for the hawker centre.',",
  "description: '',"
);

fs.writeFileSync('app/(center)/shop-owner/booths/page.tsx', content);

let modal = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');
// "Disabled. Manual status toggle is in full effect." -> remove it
modal = modal.replace(
  /\{enabled\s*\?\s*'Status switches automatically based on configured hours\.'\s*:\s*'Disabled\. Manual status toggle is in full effect\.'\}/g,
  "{enabled ? 'Status switches automatically based on configured hours.' : ''}"
);
// "Apply Monday to all days" -> change the UI. The user said: "Apply Monday to all days -> better ui the parent div of save schedule have diff background colour, when scroll up in user app, background colour different"

// Let's check how it looks
fs.writeFileSync('components/operating-schedule-modal.tsx', modal);
