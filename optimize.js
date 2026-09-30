const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const regex = /verses\.map\(\(verse\) => \{[\s\S]*?const isActive = timing && currentTimeMs >= timing\.timestamp_from && \(!nextTiming \|\| currentTimeMs < nextTiming\.timestamp_from\);/;

const replacement = `let currentActiveKey = null;
                  const currentTimeMs = currentTime * 1000;
                  for (let i = 0; i < verseTimings.length; i++) {
                    const current = verseTimings[i];
                    const next = verseTimings[i+1];
                    if (currentTimeMs >= current.timestamp_from && (!next || currentTimeMs < next.timestamp_from)) {
                      currentActiveKey = current.verse_key;
                      break;
                    }
                  }

                  return verses.map((verse) => {
                    const isActive = currentActiveKey === verse.verse_key;`;

player = player.replace(regex, replacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
