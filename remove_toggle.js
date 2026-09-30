const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// 1. Remove the Style Toggle UI
const styleToggleRegex = /\{\/\* Style Toggle \*\/\}\r?\n\s*<div className="flex bg-\[\#f4f7f9\][\s\S]*?<\/div>/;
code = code.replace(styleToggleRegex, '');

// 2. Remove the selectedStyle state and set it to a constant if needed
// const [selectedStyle, setSelectedStyle] = useState<"Murattal" | "Mujawwad">("Murattal");
code = code.replace(
  /const \[selectedStyle, setSelectedStyle\] = useState<"Murattal" \| "Mujawwad">\("Murattal"\);/,
  'const selectedStyle = "Murattal";'
);

// We can just keep selectedStyle = "Murattal" so the rest of the code works as is.
// Let's verify this is all we need.

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
