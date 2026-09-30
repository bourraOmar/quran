const fs = require('fs');
let code = fs.readFileSync('src/app/reciter/[id]/ReciterPlaylist.tsx', 'utf8');

code = code.replace(/interface Reciter \{[\s\S]*?\};\r?\n  server: string;\r?\n\}/, `interface Reciter {
  id: number;
  name: string;
  style: { name: string } | null;
  translated_name?: { name: string };
}`);

fs.writeFileSync('src/app/reciter/[id]/ReciterPlaylist.tsx', code);
