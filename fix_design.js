const fs = require('fs');
let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const oldReadingView = `      {/* 4. READING VIEW (Stacked Cards UI) */}
      {view === "reading" && (
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] relative">
          
          {/* Top Navigation */}
          <div className="pt-12 px-6 flex items-center justify-between w-full mb-6 relative z-20">
            <button className="w-10 h-10 bg-white dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
            <h1 className="text-2xl font-extrabold text-[#1e354d] dark:text-white">{readingTitle}</h1>
            <button onClick={() => setView("categories")} className="w-10 h-10 bg-white dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Stacked Cards Container */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full mb-24">
            
            {/* Background decorative stack cards */}
            <div className="absolute top-4 w-[80%] h-12 bg-white/30 dark:bg-white/5 rounded-[40px] -z-20"></div>
            <div className="absolute top-8 w-[90%] h-12 bg-white/60 dark:bg-white/10 rounded-[40px] -z-10"></div>
            
            {/* Main Active Card */}
            <div className="w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col min-h-[55vh] border border-[#2a4563] dark:border-[#2d3b4e] relative z-0">
              
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <div className="bg-[#5c8a5c] dark:bg-emerald-700 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {currentCardIndex + 1}/{readingData.length}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 flex items-center justify-center">
                <p className={\`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 \${
                  fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'
                }\`}>
                  {readingData[currentCardIndex].text.replace(/\\n/g, '\\n')}
                </p>
              </div>

              {/* Counter Button */}
              <div className="flex justify-center mt-12 mb-4">
                <button 
                  onClick={() => handleReadingTap(readingData[currentCardIndex].count)}
                  className="relative overflow-hidden bg-transparent border-2 border-[#5c8a5c] dark:border-emerald-700 text-white px-8 py-3 rounded-full text-lg font-bold group"
                >
                  <span className="relative z-10">{cardProgress} من {readingData[currentCardIndex].count} مرات</span>
                  {/* Progress Fill */}
                  <div 
                    className="absolute top-0 right-0 bottom-0 bg-[#5c8a5c] dark:bg-emerald-700 transition-all duration-300 ease-out z-0"
                    style={{ width: \`\${(cardProgress / readingData[currentCardIndex].count) * 100}%\` }}
                  ></div>
                </button>
              </div>
            </div>
            
          </div>
          
          {/* Bottom Settings Bar */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
            <button onClick={() => setFontSize(fontSize === 'medium' ? 'large' : fontSize === 'large' ? 'small' : 'medium')} className="w-12 h-12 bg-white dark:bg-[#1e293b] rounded-full shadow-md flex items-center justify-center font-bold text-[#1e354d] dark:text-white">AA</button>
            <div className="bg-white dark:bg-[#1e293b] px-6 py-3 rounded-full shadow-md text-[#1e354d] dark:text-white font-bold text-sm">
              الانتقال التلقائي
            </div>
            <button className="w-12 h-12 bg-white dark:bg-[#1e293b] rounded-full shadow-md flex items-center justify-center text-[#1e354d] dark:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </button>
          </div>

        </div>
      )}`;

const newReadingView = `      {/* 4. READING VIEW (Stacked Cards UI) */}
      {view === "reading" && (
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] relative pb-28">
          
          {/* Top Navigation */}
          <div className="pt-12 px-6 flex items-center justify-between w-full mb-10 relative z-20">
            {/* Right side in RTL (Chevron Back) */}
            <button onClick={() => setView("categories")} className="w-10 h-10 bg-white/10 dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
            
            <h1 className="text-2xl font-extrabold text-[#1e354d] dark:text-white">{readingTitle}</h1>
            
            {/* Left side in RTL (Bookmark) */}
            <button className="w-10 h-10 bg-white/10 dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center opacity-60 hover:opacity-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
          </div>

          {/* Stacked Cards Container */}
          <div className="flex-1 flex flex-col items-center px-6 relative w-full mt-4">
            
            {/* Decorative Card 2 (Bottom layer) */}
            <div className="absolute -top-6 w-[80%] h-12 bg-[#2a4563]/40 dark:bg-white/5 rounded-t-[40px] -z-20"></div>
            {/* Decorative Card 1 (Middle layer) */}
            <div className="absolute -top-3 w-[90%] h-12 bg-[#2a4563]/70 dark:bg-white/10 rounded-t-[40px] -z-10"></div>
            
            {/* Main Active Card */}
            <div className="w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col min-h-[55vh] border border-[#2a4563] dark:border-[#2d3b4e] relative z-10 mb-8">
              
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {currentCardIndex + 1}/{readingData.length}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 flex items-center justify-center">
                <p className={\`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 \${
                  fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'
                }\`}>
                  {readingData[currentCardIndex].text.replace(/\\n/g, '\\n')}
                </p>
              </div>

              {/* Counter Button */}
              <div className="flex justify-center mt-10 mb-2 w-full">
                <button 
                  onClick={() => handleReadingTap(readingData[currentCardIndex].count)}
                  className="relative overflow-hidden bg-transparent border-2 border-[#0f8e5d] text-white w-2/3 max-w-[200px] h-14 rounded-full text-lg font-bold group"
                >
                  <span className="relative z-10">{cardProgress} من {readingData[currentCardIndex].count} مرات</span>
                  {/* Progress Fill */}
                  <div 
                    className="absolute top-0 right-0 bottom-0 bg-[#0f8e5d] transition-all duration-300 ease-out z-0"
                    style={{ width: \`\${(cardProgress / readingData[currentCardIndex].count) * 100}%\` }}
                  ></div>
                </button>
              </div>
            </div>
            
          </div>
          
          {/* Bottom Settings Bar */}
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
          </div>

        </div>
      )}`;

// We need to properly escape the backslashes inside our script so they don't break JSX again!
const safeNewReadingView = newReadingView.replace(/\\/g, '\\\\');

code = code.replace(oldReadingView, newReadingView);
// if it fails to replace, let's use indexes.

if (!code.includes('4. READING VIEW')) {
  console.log("Could not find the block to replace.");
} else {
  const startIdx = code.indexOf('{/* 4. READING VIEW');
  const endIdx = code.indexOf(')}', code.indexOf('</div>', startIdx + 500)) + 2; // this is risky
  // Safer:
  code = code.substring(0, startIdx) + newReadingView + '\n\n    </div>\n  );\n}\n';
  fs.writeFileSync('src/app/dhikr/page.tsx', code);
  console.log('Fixed design details');
}

