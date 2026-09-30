const fs = require('fs');

// 1. Fix context duplicate
let ctx = fs.readFileSync('src/app/context/GlobalAudioContext.tsx', 'utf8');
ctx = ctx.replace('verseTimings, isTimingLoading, isTimingLoading,', 'verseTimings, isTimingLoading,');
ctx = ctx.replace('verseTimings, isTimingLoading, isRepeating,', 'verseTimings, isTimingLoading,\n      isRepeating,'); // Just in case it's messed up
ctx = ctx.replace(/verseTimings, isTimingLoading,[\s\n]*isTimingLoading,/, 'verseTimings, isTimingLoading,');
fs.writeFileSync('src/app/context/GlobalAudioContext.tsx', ctx);

// 2. Fix player missing extraction
let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');
player = player.replace(
  'verseTimings,\n    isRepeating',
  'verseTimings,\n    isTimingLoading,\n    isRepeating'
);
fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
