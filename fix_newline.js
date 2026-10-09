const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// The original buggy text rendering
const oldCode = `{readingData[currentCardIndex].text.replace(/\\\\n/g, '\\\\n')}`;

// The new mapped rendering for actual HTML breaks
const newCode = `{readingData[currentCardIndex].text.split('\\\\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed literal \\n characters');
