const fs = require('fs');

// --- src/app/page.tsx ---
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
const pageRegex = /async function getRecitations\(\) \{[\s\S]*?return json\.reciters\.map\(\(r: any\) => \(\{[\s\S]*?\}\)\);\r?\n\}/;
const pageReplacement = `async function getRecitations() {
  const res = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  
  const recitations: any[] = [];
  json.reciters.forEach((r: any) => {
    r.moshaf.forEach((m: any) => {
      recitations.push({
        id: m.id,
        reciter_id: r.id,
        reciter_name: r.name,
        style: m.name,
        server: m.server,
        surah_list: m.surah_list
      });
    });
  });
  return recitations;
}`;
page = page.replace(pageRegex, pageReplacement);
fs.writeFileSync('src/app/page.tsx', page);

// --- src/app/reciters/page.tsx ---
let recitersPage = fs.readFileSync('src/app/reciters/page.tsx', 'utf8');
const recitersRegex = /async function getAllReciters\(\) \{[\s\S]*?return json\.reciters\.map\(\(r: any\) => \(\{[\s\S]*?\}\)\);\r?\n\}/;
const recitersReplacement = `async function getAllReciters() {
  const [resAr, resEn] = await Promise.all([
    fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", { next: { revalidate: 3600 } }),
    fetch("https://www.mp3quran.net/api/v3/reciters?language=eng", { next: { revalidate: 3600 } })
  ]);

  if (!resAr.ok || !resEn.ok) return [];
  
  const jsonAr = await resAr.json();
  const jsonEn = await resEn.json();
  
  const engNames = new Map();
  if (jsonEn.reciters) {
    jsonEn.reciters.forEach((r: any) => {
      engNames.set(r.id, r.name);
    });
  }
  
  const recitersMap = new Map();
  jsonAr.reciters.forEach((r: any) => {
    if (r.moshaf && r.moshaf.length > 0) {
      const bestMoshaf = r.moshaf.find((m: any) => m.name.includes('مجود')) || r.moshaf[0];
      recitersMap.set(r.id, {
        id: bestMoshaf.id,
        reciter_name: r.name,
        reciter_name_eng: engNames.get(r.id) || "",
        style: bestMoshaf.name,
      });
    }
  });
  
  return Array.from(recitersMap.values());
}`;
recitersPage = recitersPage.replace(recitersRegex, recitersReplacement);
fs.writeFileSync('src/app/reciters/page.tsx', recitersPage);

// --- src/app/reciter/[id]/page.tsx ---
let reciterPage = fs.readFileSync('src/app/reciter/[id]/page.tsx', 'utf8');
const reciterRegex = /async function getReciterInfo\(id: string\) \{[\s\S]*?return \{[\s\S]*?\};\r?\n\}/;
const reciterReplacement = `async function getReciterInfo(id: string) {
  const res = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  
  let reciter: any = null;
  json.reciters.forEach((r: any) => {
    r.moshaf.forEach((m: any) => {
      if (m.id.toString() === id) {
        reciter = {
          id: m.id,
          reciter_id: r.id,
          name: r.name,
          style: m.name,
          server: m.server,
          surah_list: m.surah_list
        };
      }
    });
  });
  return reciter;
}`;
reciterPage = reciterPage.replace(reciterRegex, reciterReplacement);
fs.writeFileSync('src/app/reciter/[id]/page.tsx', reciterPage);
