const fs = require('fs');
let modal = fs.readFileSync('components/operating-schedule-modal.tsx', 'utf-8');

// When user scrolls up, there is an issue with the background colour.
// `className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"`
// The problem is likely that the sticky footer has a white bg, but the modal body doesn't, or the modal is bleeding through.
// Actually, `bg-[#f5f5f7]` is common. If the scroll background is different, we should check `OperatingScheduleModal` parent container.
// It has:
// <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//   <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//   <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
// This seems fine. But wait, `overflow-hidden` is on the parent, `overflow-y-auto` is on the body.

// The user also mentioned: "when scroll up in user app, background colour different"
// Ah, they might be talking about `app/(customer)/home/page.tsx` or similar? Wait, "user app" could mean the customer-facing side, or maybe just the modal in general. Let's fix the modal here first.

// Also `app/(stall)/owner/page.tsx` has the configure text.
