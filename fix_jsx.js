const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Remove the invalid block from JSX
player = player.replace(
  /\{verses\.length > 0 \? \([\s\S]*?return verses\.map\(\(verse\) => \{/,
  '{verses.length > 0 ? (\n                  verses.map((verse) => {'
);

// 2. Add the calculation right before the `return (` of the component
const calculation = `
  let currentActiveKey = null;
  if (showLyrics && verses.length > 0 && verseTimings.length > 0) {
    const currentTimeMs = currentTime * 1000;
    for (let i = 0; i < verseTimings.length; i++) {
      const current = verseTimings[i];
      const next = verseTimings[i+1];
      if (currentTimeMs >= current.timestamp_from && (!next || currentTimeMs < next.timestamp_from)) {
        currentActiveKey = current.verse_key;
        break;
      }
    }
  }

  return (
`;

player = player.replace(/return \(\r?\n\s*<>\r?\n\s*\{\/\* ---------------------------------------------------------------------- \*\/\}/, calculation + '    <>\n      {/* ---------------------------------------------------------------------- */}');

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
