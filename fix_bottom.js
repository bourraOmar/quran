const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

player = player.replace('bottom-[90px] md:bottom-0', 'bottom-24 md:bottom-0');

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
