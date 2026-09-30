const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

player = player.replace(
  'verseTimings\n  } = useGlobalAudio();',
  'verseTimings,\n    isTimingLoading\n  } = useGlobalAudio();'
);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
