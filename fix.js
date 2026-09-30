const fs = require('fs');
let code = fs.readFileSync('src/app/reciters/page.tsx', 'utf8');
const regex = /async function getAllReciters\(\) \{[\s\S]*?return Array\.from\(recitersMap\.values\(\)\);\r?\n\}/;
const replacement = `async function getAllReciters() {
  const res = await fetch("https://api.qurancdn.com/api/qdc/audio/reciters?locale=ar", { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.reciters.map((r: any) => ({
    id: r.id,
    reciter_name: r.translated_name?.name || r.name,
    reciter_name_eng: r.name,
    style: r.style?.name || "",
  }));
}`;
fs.writeFileSync('src/app/reciters/page.tsx', code.replace(regex, replacement));
