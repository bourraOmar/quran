const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// Change the LCD color to golden yellow
code = code.replace(
  'bg-[#b5c7a3]',
  'bg-[#e2c673]' // more golden yellow LCD
);

// Change the large count button to Golden
code = code.replace(
  /w-32 h-32 bg-\[#4a6b8c\] rounded-full shadow-\[0_8px_0_#2a4054\] active:shadow-none active:translate-y-\[8px\] transition-all border-4 border-\[#395675\]/g,
  'w-32 h-32 bg-amber-400 rounded-full shadow-[0_8px_0_#b45309] active:shadow-[0_2px_0_#b45309] active:translate-y-[6px] transition-all border-4 border-amber-600'
);

// Change the inner ring on active
code = code.replace(
  /w-24 h-24 rounded-full bg-\[#5b80a6\] shadow-inner flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity/g,
  'w-24 h-24 rounded-full bg-amber-500 shadow-inner flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity'
);

// Change Reset Button to Golden
code = code.replace(
  /w-6 h-6 bg-gray-300 rounded-full shadow-\[0_3px_0_#9ca3af\] active:shadow-none active:translate-y-\[3px\] transition-all border border-gray-400/g,
  'w-6 h-6 bg-amber-400 rounded-full shadow-[0_3px_0_#b45309] active:shadow-none active:translate-y-[3px] transition-all border border-amber-600'
);

// Change Badge color in the list view to golden
code = code.replace(
  /bg-\[#4a6b8c\] text-white px-4 py-2 rounded-full font-bold text-sm shadow-md min-w-\[60px\] text-center/g,
  'bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center'
);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed realistic colors');
