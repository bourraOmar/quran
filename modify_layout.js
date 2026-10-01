const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

c = c.replace('import { GlobalAudioProvider } from "./context/GlobalAudioContext";', 
`import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import { AmbientAudioProvider } from "./context/AmbientAudioContext";
import AmbientSoundMenu from "./components/AmbientSoundMenu";`);

c = c.replace('<GlobalAudioProvider>', '<AmbientAudioProvider>\n        <GlobalAudioProvider>');
c = c.replace('</GlobalAudioProvider>', '</GlobalAudioProvider>\n        </AmbientAudioProvider>');
c = c.replace('<GlobalPlayer />', '<GlobalPlayer />\n          <AmbientSoundMenu />');

fs.writeFileSync('src/app/layout.tsx', c);
