const fs = require('fs');

let content = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// I also need to ensure that the modal header handles the description prop nicely if it's empty.
content = content.replace(
  '            <p className="mt-1.5 text-[13px] leading-relaxed text-[#6e6e73] pr-8">',
  '            {description && <p className="mt-1.5 text-[13px] leading-relaxed text-[#6e6e73] pr-8">'
);
content = content.replace(
  '              {description}\n            </p>',
  '              {description}\n            </p>}'
);

fs.writeFileSync('components/operating-schedule-modal.tsx', content);
