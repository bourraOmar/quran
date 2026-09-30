const fs = require('fs');
let code = fs.readFileSync('src/app/context/GlobalAudioContext.tsx', 'utf8');

const interfaceRegex = /export interface Reciter \{[\s\S]*?\}/;
const interfaceReplacement = `export interface Reciter {
  id: number;
  reciter_id: number;
  name: string;
  style: string;
  server: string;
  surah_list: string;
}`;
code = code.replace(interfaceRegex, interfaceReplacement);

const fetchRegex = /fetch\(\`https:\/\/api\.qurancdn\.com\/api\/qdc\/audio\/reciters\/\$\{reciter\.id\}\/audio_files\?chapter=\$\{activeSurahId\}&segments=true\`\)[\s\S]*?\.catch\(err => console\.error\("Failed to fetch audio info:", err\)\);/;

const fetchReplacement = `const paddedId = activeSurahId.toString().padStart(3, "0");
    setAudioUrl(\`\${reciter.server}\${paddedId}.mp3\`);
    
    // Fetch mp3quran timing
    fetch(\`https://www.mp3quran.net/api/v3/ayat_timing?read=\${reciter.id}&surah=\${activeSurahId}\`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedTimings = data.map((t: any) => ({
            verse_key: \`\${activeSurahId}:\${t.ayah}\`,
            timestamp_from: t.start_time,
            timestamp_to: t.end_time,
            duration: t.end_time - t.start_time
          }));
          setVerseTimings(mappedTimings);
        }
      })
      .catch(err => console.error("Failed to fetch timing:", err));`;
code = code.replace(fetchRegex, fetchReplacement);

fs.writeFileSync('src/app/context/GlobalAudioContext.tsx', code);
