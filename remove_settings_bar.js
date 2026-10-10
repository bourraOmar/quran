const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const startIdx = code.indexOf('{/* Bottom Settings Bar */}');
if (startIdx !== -1) {
  const endIdx = code.indexOf('</div>', startIdx + 30) + 6; // To close the outer div
  // Wait, the bottom settings bar is:
  /*
          {/* Bottom Settings Bar * /}
          <div className="flex items-center justify-between z-20 w-full px-8 pb-10">
            ...
          </div>
  */
  // I need to make sure I find the exact end div. Let's just use string replacement.
  const barCode = `          {/* Bottom Settings Bar */}
          <div className="flex items-center justify-between z-20 w-full px-8 pb-10">
            {/* Right side in RTL (Chevron >) */}
            <button onClick={() => setView("categories")} className="w-12 h-12 bg-white/10 dark:bg-[#1e293b] rounded-full shadow-md flex items-center justify-center font-bold text-[#1e354d] dark:text-white opacity-0 pointer-events-none">
               {/* Hidden placeholder for spacing */}
            </button>

            {/* Center (Auto transition) */}
            <div className="bg-white/10 dark:bg-[#1e293b] px-6 py-3 rounded-full shadow-md text-[#1e354d] dark:text-white font-bold text-sm">
              الانتقال التلقائي
            </div>

            {/* Left side in RTL (Settings) */}
            <div className="flex gap-4">
               <button className="w-12 h-12 bg-white/10 dark:bg-[#1e293b] rounded-full shadow-md flex items-center justify-center text-[#1e354d] dark:text-white">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
               </button>
               <button onClick={() => setFontSize(fontSize === 'medium' ? 'large' : fontSize === 'large' ? 'small' : 'medium')} className="w-12 h-12 bg-white/10 dark:bg-[#1e293b] rounded-full shadow-md flex items-center justify-center font-bold text-[#1e354d] dark:text-white">AA</button>
            </div>
          </div>`;

  if (code.includes(barCode)) {
      code = code.replace(barCode, '');
      fs.writeFileSync('src/app/dhikr/page.tsx', code);
      console.log('REMOVED');
  } else {
      console.log('NOT FOUND WITH EXACT MATCH, FALLING BACK TO INDEX SEARCH');
      const s = code.indexOf('{/* Bottom Settings Bar */}');
      if(s !== -1) {
          const e = code.indexOf('</div>', code.indexOf('</div>', code.indexOf('</div>', s)+1)+1)+6;
          // That's tricky. Let's just delete from `{/* Bottom Settings Bar */}` to the next blank line or `        </div>` that closes the view.
          const e2 = code.indexOf('\n        </div>\n      )}', s);
          if (e2 !== -1) {
              code = code.substring(0, s) + code.substring(e2);
              fs.writeFileSync('src/app/dhikr/page.tsx', code);
              console.log('REMOVED WITH INDEX');
          }
      }
  }
}
