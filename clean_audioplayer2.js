const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// 1. Remove the Style Toggle
code = code.replace(/\{\/\* Style Toggle \*\/\}\r?\n\s*<div className="flex bg-\[\#f4f7f9\][\s\S]*?<\/div>\r?\n\s*<\/div>/, '');
// Wait, `</div>\n</div>` ? No, just the inner `</div>`!
code = code.replace(/\{\/\* Style Toggle \*\/\}\s*<div className="flex bg-\[\#f4f7f9\][^>]*>[\s\S]*?<\/div>\s*<\/div>/, '');
// Actually let's just replace from `{/* Style Toggle */}` to `</button>\s*</div>`
code = code.replace(/\{\/\* Style Toggle \*\/\}[\s\S]*?<\/button>\s*<\/div>/, '');

// 2. Remove the auto-select effect that throws error TS2304: Cannot find name 'selectedStyle' on line 67
const autoSelectRegex = /\/\/ Auto-select first reciter if current selection doesn't match style[\s\S]*?\}, \[.*?\]\);\r?\n\r?\n/;
code = code.replace(autoSelectRegex, '');

// Also let's check for any `useEffect(() => { ... selectedStyle ... });`
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?selectedStyle[\s\S]*?\}, \[.*?\]\);/g, '');

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
