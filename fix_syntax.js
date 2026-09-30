const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

player = player.replace('React.\n  const hasTimings', 'const hasTimings');

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
