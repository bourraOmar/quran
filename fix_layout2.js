const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Remove unused AmbientSoundMenu import
c = c.replace('import AmbientSoundMenu from "./components/AmbientSoundMenu";\r\n', '');
c = c.replace('import AmbientSoundMenu from "./components/AmbientSoundMenu";\n', '');

// Add viewport export after the metadata export
const viewportExport = `
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};
`;

c = c.replace(
  'import { GlobalAudioProvider }',
  viewportExport + 'import { GlobalAudioProvider }'
);

fs.writeFileSync('src/app/layout.tsx', c);
console.log('Done!');
