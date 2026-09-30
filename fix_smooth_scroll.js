const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const regex = /if \(activeVerse && activeVerse\.id !== lastActiveVerseId\.current\) \{[\s\S]*?el\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\r?\n\s+\}\r?\n\s+\}/;

const replacement = `if (activeVerse && activeVerse.id !== lastActiveVerseId.current) {
      lastActiveVerseId.current = activeVerse.id;
      // Slight delay to allow CSS class to apply before calculating scroll position
      setTimeout(() => {
        const el = document.getElementById(\`verse-\${activeVerse.id}\`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
