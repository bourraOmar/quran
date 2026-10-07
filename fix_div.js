const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

code = code.replace(
  '    </div>\n  );\n}',
  '    </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
console.log('Fixed missing div.');
