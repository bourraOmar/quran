const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// Find the list item HTML
const oldListItem = `                {/* Badge */}
                <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center">
                  {(counts[dhikr.id] || 0)}x
                </div>
                
                {/* Text */}
                <div className="text-left flex-1 pl-4" dir="ltr">
                  <p className="text-2xl font-amiri font-bold text-[#1e354d] dark:text-white mb-1 text-right">{dhikr.arabic}</p>
                  <p className="text-xs opacity-60 text-right">{dhikr.transliteration}</p>
                </div>`;

const newListItem = `                {/* Text (Right Side in RTL) */}
                <div className="flex-1 pr-4">
                  <p className="text-2xl font-amiri font-bold text-[#1e354d] dark:text-white mb-1">{dhikr.arabic}</p>
                  <p className="text-xs opacity-60">{dhikr.transliteration}</p>
                </div>

                {/* Badge (Left Side in RTL) */}
                <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center">
                  {(counts[dhikr.id] || 0)}x
                </div>`;

code = code.replace(oldListItem, newListItem);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed list view badge position');
