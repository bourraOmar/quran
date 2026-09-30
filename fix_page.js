const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace getRecitations
const getRecitationsRegex = /async function getRecitations\(\) \{[\s\S]*?\}\n\n/;
const getRecitationsReplacement = `async function getRecitations() {
  const res = await fetch("https://api.qurancdn.com/api/qdc/audio/reciters?locale=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  
  return json.reciters.map((r: any) => ({
    id: r.id,
    reciter_name: r.translated_name?.name || r.name,
    style: r.style?.name || "",
  }));
}

`;
code = code.replace(getRecitationsRegex, getRecitationsReplacement);

// Replace filter line
const filterRegex = /recitations\.filter\(\(r: any\) => r\.style\.includes\('مجود'\)\)\.slice\(0, 6\)\.map/g;
code = code.replace(filterRegex, `recitations.slice(0, 6).map`);

fs.writeFileSync('src/app/page.tsx', code);
