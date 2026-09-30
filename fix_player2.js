const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

code = code.replace(/reciter\.reciter_name/g, 'reciter.name');

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
