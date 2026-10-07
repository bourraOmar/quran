const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

const clickBefore = `             onClick={() => {
               console.log("Listen clicked. verseKey:", popupMenu.verseKey);
               console.log("playerRef current:", playerRef.current);
               if (playerRef.current) {
                 playerRef.current.playVerse(popupMenu.verseKey);
               } else {
                 alert("Player reference is missing!");
               }
               setPopupMenu(null);
             }}`;

const clickAfter = `             onClick={() => {
               if (playerRef.current) {
                 playerRef.current.playVerse(popupMenu.verseKey);
               }
               setPopupMenu(null);
             }}`;

code = code.replace(clickBefore, clickAfter);
fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
console.log('Removed alert.');
