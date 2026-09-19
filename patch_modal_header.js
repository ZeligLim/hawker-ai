const fs = require('fs');

let content = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// The `description` prop here is:
// <p className="text-xs text-[#6e6e73]">{description}</p>
// We need to conditionally render it if it's there.
content = content.replace(
  '<p className="text-xs text-[#6e6e73]">{description}</p>',
  '{description ? <p className="text-xs text-[#6e6e73]">{description}</p> : null}'
);

// We should also remove borders globally from this modal:
// border-b border-black/5
content = content.replace(/border-b border-black\/5/g, '');
// border border-black/10
content = content.replace(/border border-black\/10/g, '');
// border border-black/5
content = content.replace(/border border-black\/5/g, '');
// border border-red-200
content = content.replace(/border border-red-200/g, 'shadow-xs');

fs.writeFileSync('components/operating-schedule-modal.tsx', content);
