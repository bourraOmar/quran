const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// 1. Remove the dead code `if (selectedStyle === "Mujawwad") { ... } else { ... }`
const ifRegex = /if \(selectedStyle === "Mujawwad"\) \{[\s\S]*?\} else \{([\s\S]*?)\}/;
code = code.replace(ifRegex, (match, elseBlock) => {
  return elseBlock.trim(); // Just return the contents of the 'else' block
});

// 2. Remove selectedStyle entirely from the dependency arrays
code = code.replace(/, selectedStyle/g, '');
code = code.replace(/selectedStyle, /g, '');
code = code.replace(/const selectedStyle = "Murattal";\r?\n/, '');

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
