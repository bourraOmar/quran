const fs = require('fs');
let code = fs.readFileSync('src/app/reciter/[id]/ReciterPlaylist.tsx', 'utf8');

const regex = /interface Reciter \{[\s\S]*?\}/;
const replacement = `interface Reciter {
  id: number;
  name: string;
  style: { name: string } | null;
  translated_name?: { name: string };
}`;
code = code.replace(regex, replacement);
code = code.replace(/reciter\.reciter_name/g, 'reciter.name');
code = code.replace(/reciter\.style \|\| 'حفص عن عاصم'/g, '(reciter.style?.name) || "حفص عن عاصم"');
fs.writeFileSync('src/app/reciter/[id]/ReciterPlaylist.tsx', code);
