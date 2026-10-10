const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

c = c.replace(
  'className="flex-1 flex items-center justify-center overflow-y-auto"',
  'className="flex-1 flex items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"'
);

// I'll also decrease the font size slightly for long text by making 'text-2xl' into 'text-xl md:text-2xl'
c = c.replace(
  '${fontSize === \'small\' ? \'text-xl\' : fontSize === \'large\' ? \'text-4xl\' : \'text-2xl\'}',
  '${fontSize === \'small\' ? \'text-lg\' : fontSize === \'large\' ? \'text-3xl\' : \'text-xl md:text-2xl\'}'
);

fs.writeFileSync('src/app/dhikr/page.tsx', c);
console.log('Fixed scrollbar and font size');
