const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Revert the useEffect logic back to simple finding
const useEffectRegex = /let activeVerse: any = null;[\s\S]*?activeVerse = verses\.find\(v => v\.verse_key === currentActiveKey\);\r?\n\s*\}/;
const useEffectReplacement = `const activeVerse = verses.find(verse => {
      const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
      const index = verseTimings.findIndex(t => t.verse_key === verse.verse_key);
      const nextTiming = verseTimings[index + 1];
      
      if (!timing) return false;
      
      // Active if current time is past this verse's start, AND (there is no next verse, or current time is before next verse's start)
      return currentTimeMs >= timing.timestamp_from && (!nextTiming || currentTimeMs < nextTiming.timestamp_from);
    });`;
code = code.replace(useEffectRegex, useEffectReplacement);

// 2. Fix the render logic
const renderRegex = /verses\.map\(\(verse\) => \{[\s\S]*?const isActive = activeVerse\?\.verse_key === verse\.verse_key;/;
const renderReplacement = `verses.map((verse) => {
                    const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
                    const index = verseTimings.findIndex(t => t.verse_key === verse.verse_key);
                    const nextTiming = verseTimings[index + 1];
                    const currentTimeMs = currentTime * 1000;
                    
                    const isActive = timing && currentTimeMs >= timing.timestamp_from && (!nextTiming || currentTimeMs < nextTiming.timestamp_from);`;
code = code.replace(renderRegex, renderReplacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
