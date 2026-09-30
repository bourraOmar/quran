const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const regex = /const activeVerse = verses\.find\(verse => \{[\s\S]*?\}\);/;
const replacement = `let activeVerse = null;
    const currentTimeMs = currentTime * 1000;
    
    // Find the current active verse, persisting highlight during gaps between verses
    let currentActiveKey = null;
    for (let i = 0; i < verseTimings.length; i++) {
      const current = verseTimings[i];
      const next = verseTimings[i+1];
      
      if (currentTimeMs >= current.timestamp_from) {
        if (!next || currentTimeMs < next.timestamp_from) {
          currentActiveKey = current.verse_key;
        }
      }
    }
    
    if (currentActiveKey) {
      activeVerse = verses.find(v => v.verse_key === currentActiveKey);
    }`;

player = player.replace(regex, replacement);

const verseMapRegex = /verses\.map\(\(verse\) => \{[\s\S]*?const isActive = timing && currentTimeMs >= timing\.timestamp_from && currentTimeMs <= timing\.timestamp_to;/;

const verseMapReplacement = `verses.map((verse) => {
                    const isActive = activeVerse?.verse_key === verse.verse_key;`;
player = player.replace(verseMapRegex, verseMapReplacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
