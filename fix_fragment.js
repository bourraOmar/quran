const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

player = player.replace(
  /\}\)\r?\n\s*\) : \(/,
  '})\n                  </>\n                ) : ('
);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
