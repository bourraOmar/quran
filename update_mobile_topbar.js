const fs = require('fs');
let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const topBarRegex = /<div className="flex justify-between items-center w-full mb-auto text-white\/80">\s*<div><\/div>\s*<button onClick=\{toggleFullscreen\}/;
const newTopBar = `<div className="flex justify-between items-center w-full mb-auto text-white/80">
            {showLyrics ? (
              <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">تلاوة سورة</span>
                <span className="font-bold text-white text-lg">{activeSurah.name_simple}</span>
              </div>
            ) : (
              <div></div>
            )}
            <button onClick={toggleFullscreen}`;

player = player.replace(topBarRegex, newTopBar);
fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
