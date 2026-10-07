const fs = require('fs');

let audioPlayerCode = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

const imperativeBefore = `  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      const index = verseAudios.findIndex(v => v.verse_key === verseKey);
      if (index !== -1) {`;

const imperativeAfter = `  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      console.log("playVerse called with:", verseKey);
      console.log("verseAudios length:", verseAudios.length);
      const index = verseAudios.findIndex(v => v.verse_key === verseKey);
      console.log("Found index:", index);
      if (index !== -1) {`;

audioPlayerCode = audioPlayerCode.replace(imperativeBefore, imperativeAfter);
fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', audioPlayerCode);


let surahReaderCode = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

const clickBefore = `             onClick={() => {
               if (playerRef.current) playerRef.current.playVerse(popupMenu.verseKey);
               setPopupMenu(null);
             }}`;

const clickAfter = `             onClick={() => {
               console.log("Listen clicked. verseKey:", popupMenu.verseKey);
               console.log("playerRef current:", playerRef.current);
               if (playerRef.current) {
                 playerRef.current.playVerse(popupMenu.verseKey);
               } else {
                 alert("Player reference is missing!");
               }
               setPopupMenu(null);
             }}`;

surahReaderCode = surahReaderCode.replace(clickBefore, clickAfter);
fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', surahReaderCode);
console.log('Injected debug logs.');
