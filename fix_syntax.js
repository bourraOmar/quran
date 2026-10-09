const fs = require('fs');
let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// The write_to_file tool inserted literal backslashes: {\`flex-1 ... \${...}\`}
// We need to replace {\` with {` and \${ with ${ and \`} with `}
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed syntax errors');
