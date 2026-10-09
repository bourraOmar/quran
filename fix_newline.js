const fs = require('fs');
let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const startIdx = code.indexOf('<p className={`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 ${');
if (startIdx !== -1) {
  const endIdx = code.indexOf('</p>', startIdx);
  
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  
  const newMiddle = "<p className={`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 ${" +
    "\n                  fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'" +
    "\n                }`}>\n                  {readingData[currentCardIndex].text.split('\\\\n').map((line, i) => (\n" +
    "                    <span key={i}>\n                      {line}\n                      <br />\n                    </span>\n" +
    "                  ))}\n                ";
  
  fs.writeFileSync('src/app/dhikr/page.tsx', before + newMiddle + after);
  console.log("REPLACED!");
} else {
  console.log("NOT FOUND");
}
