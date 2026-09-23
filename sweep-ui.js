const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let originalText = fs.readFileSync(filePath, 'utf8');
  let text = originalText;

  // Rule: Strictly 0 border
  // Remove border, border-t, border-b, border-l, border-r, border-*, divide-*, ring-*
  text = text.replace(/\bborder-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bborder-t-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bborder-b-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bborder-l-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bborder-r-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bborder\b/g, '');
  text = text.replace(/\bborder-[trbl]\b/g, '');
  text = text.replace(/\bdivide-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bring-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bhover:border-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bfocus:border-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  text = text.replace(/\bfocus:ring-[a-zA-Z0-9\/\[\]#-]+\b/g, '');
  
  // Rule: No Unnecessary Animations
  text = text.replace(/\btransition-all\b/g, '');
  text = text.replace(/\btransition-colors\b/g, '');
  text = text.replace(/\btransition\b/g, '');
  text = text.replace(/\bduration-[0-9]+\b/g, '');
  text = text.replace(/\bease-in-out\b/g, '');
  text = text.replace(/\banimate-[a-zA-Z0-9-]+\b/g, '');
  text = text.replace(/\bzoom-in-[0-9]+\b/g, '');
  text = text.replace(/\bfade-in\b/g, '');

  // Rule: Standard 44px (h-11) Height for interactables
  // We'll cautiously replace h-10 and h-12 with h-11, mostly on buttons/inputs
  // Actually, a simpler way is to find h-10 and h-12 and replace with h-11 globally, though it might affect icons.
  // Wait, let's only replace h-10 or h-12 or h-14 if it's next to w-full, or inside button/input classNames.
  // I will skip global height replacement to avoid breaking layout, but will do it for typical form inputs/buttons.
  
  text = text.replace(/className="([^"]*(?:button|input|select|Link|Link)[^"]*)\bh-10\b/g, 'className="$1h-11');
  text = text.replace(/className="([^"]*(?:button|input|select|Link|Link)[^"]*)\bh-12\b/g, 'className="$1h-11');

  // Fix pure white/black if needed, but this is harder to automate accurately without knowing context.
  
  // Clean up double spaces from regex replacements
  text = text.replace(/  +/g, ' ');
  text = text.replace(/ className=" "/g, '');
  text = text.replace(/ className=""/g, '');

  if (text !== originalText) {
    fs.writeFileSync(filePath, text);
    console.log(`Updated ${filePath}`);
  }
}

walkDir('app', processFile);
walkDir('components', processFile);
