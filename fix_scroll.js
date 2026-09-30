const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Add ref back
player = player.replace(
  /id=\{\`verse-\$\{verse\.id\}\`\}/,
  'id={`verse-${verse.id}`} ref={isActive ? (activeVerseRef as any) : null}'
);

// 2. Fix activeVerseRef import or definition if needed
// We can just rely on the existing useRef if it exists.
if (!player.includes('activeVerseRef = React.useRef')) {
  if (player.includes('activeVerseRef = useRef')) {
    // it exists
  } else {
    player = player.replace('const lastActiveVerseId = React.useRef<number | null>(null);', 'const lastActiveVerseId = React.useRef<number | null>(null);\n  const activeVerseRef = React.useRef<any>(null);');
  }
}

// 3. Ensure the smooth scroll useEffect is correctly linked
const scrollEffect = `
  React.useEffect(() => {
    if (activeVerseRef.current && showLyrics) {
      activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, showLyrics]);
`;
if (!player.includes("activeVerseRef.current.scrollIntoView")) {
  player = player.replace('// Auto-scroll logic', scrollEffect + '\n  // Auto-scroll logic');
}

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);

// --- Also fix reciter/[id]/page.tsx missing reciter_name
let reciterPage = fs.readFileSync('src/app/reciter/[id]/page.tsx', 'utf8');
reciterPage = reciterPage.replace(/name: r\.name,/, 'reciter_name: r.name,');
fs.writeFileSync('src/app/reciter/[id]/page.tsx', reciterPage);
