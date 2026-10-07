const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// Use regex to remove src={currentAudioUrl}
code = code.replace(/src={currentAudioUrl}/g, '');

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
console.log('Removed src prop.');
