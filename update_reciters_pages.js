const fs = require('fs');

// 1. Update src/app/reciters/page.tsx
let recitersPage = fs.readFileSync('src/app/reciters/page.tsx', 'utf8');

const newGetAllReciters = `async function getAllReciters() {
  const res = await fetch("https://mp3quran.net/api/v3/ayat_timing/reads", { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  
  const json = await res.json();
  
  return json.map((r: any) => ({
    id: r.id,
    reciter_name: r.name,
    reciter_name_eng: "", // English name not provided by this endpoint, fallback to empty
    style: r.rewaya
  }));
}`;

recitersPage = recitersPage.replace(
  /async function getAllReciters\(\) \{[\s\S]*?return Array\.from\(recitersMap\.values\(\)\);\n\}/,
  newGetAllReciters
);

fs.writeFileSync('src/app/reciters/page.tsx', recitersPage);
console.log('Updated /reciters/page.tsx');

// 2. Update src/app/reciter/[id]/page.tsx
let reciterPage = fs.readFileSync('src/app/reciter/[id]/page.tsx', 'utf8');

const newGetReciterInfo = `async function getReciterInfo(id: string) {
  const res = await fetch("https://mp3quran.net/api/v3/ayat_timing/reads", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  
  const r = json.find((r: any) => r.id.toString() === id);
  if (!r) return null;

  return {
    id: r.id,
    reciter_id: r.id,
    reciter_name: r.name,
    style: r.rewaya,
    server: r.folder_url,
    surah_list: Array.from({length: r.soar_count}, (_, i) => (i + 1).toString()).join(",")
  };
}`;

reciterPage = reciterPage.replace(
  /async function getReciterInfo\(id: string\) \{[\s\S]*?return reciter;\n\}/,
  newGetReciterInfo
);

fs.writeFileSync('src/app/reciter/[id]/page.tsx', reciterPage);
console.log('Updated /reciter/[id]/page.tsx');
