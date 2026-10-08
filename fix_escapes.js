const fs = require('fs');

let c1 = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');
c1 = c1.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', c1);

let c2 = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');
c2 = c2.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/components/Dashboard.tsx', c2);

console.log('Fixed backticks and dollars.');
