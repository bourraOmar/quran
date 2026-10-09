const fs = require('fs');
let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');
code = code.replace(/\\`/g, '`');
fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed backslashes');
