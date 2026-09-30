const fs = require('fs');
let code = fs.readFileSync('src/app/reciter/[id]/page.tsx', 'utf8');

const regex = /async function getReciterInfo\(id: string\) \{[\s\S]*?return reciter;\r?\n\}/;
const replacement = `async function getReciterInfo(id: string) {
  const res = await fetch("https://api.qurancdn.com/api/qdc/audio/reciters?locale=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  
  const reciterData = json.reciters.find((r: any) => r.id.toString() === id);
  if (!reciterData) return null;

  return {
    id: reciterData.id,
    name: reciterData.translated_name?.name || reciterData.name,
    style: reciterData.style || null,
    translated_name: reciterData.translated_name
  };
}`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/app/reciter/[id]/page.tsx', code);
