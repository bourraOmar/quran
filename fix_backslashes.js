const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\${/g, '${');

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
console.log('Fixed backslashes.');
