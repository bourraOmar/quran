const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

c = c.replace('import AmbientSoundMenu from "./components/AmbientSoundMenu";\n', '');
c = c.replace('<GlobalPlayer />\n          <AmbientSoundMenu />', '<GlobalPlayer />');

fs.writeFileSync('src/app/layout.tsx', c);
