const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

// The file currently ends with the injected modal block. I just need to append `\n  );\n}\n` to the end.
if (!code.endsWith('  );\n}\n')) {
  code += '\n  );\n}\n';
  fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
  console.log('Fixed syntax error.');
} else {
  console.log('Already fixed.');
}
