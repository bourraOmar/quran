const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// 1. Add Swiper imports
if (!code.includes('import { Swiper, SwiperSlide }')) {
  code = code.replace('import Link from "next/link";', 
    `import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';`);
}

// 2. Add Swiper state and tracker progress state
if (!code.includes('const [swiperInstance, setSwiperInstance] = useState')) {
  code = code.replace('const [fontSize, setFontSize] = useState<"small"|"medium"|"large">("medium");',
    `const [fontSize, setFontSize] = useState<"small"|"medium"|"large">("medium");
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [trackerProgress, setTrackerProgress] = useState<Record<string, number>>({});`);
}

// 3. Update handleReadingTap
const oldHandleReadingTap = `  const handleReadingTap = (targetCount: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    const nextProgress = cardProgress + 1;
    setCardProgress(nextProgress);
    
    if (nextProgress >= targetCount) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Auto transition to next card after a small delay
      setTimeout(() => {
        if (currentCardIndex < readingData.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
          setCardProgress(0);
        } else {
          // Finished all adhkar
          setView("categories");
        }
      }, 400);
    }
  };`;

const newHandleReadingTap = `  const handleReadingTap = (id: string, targetCount: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    const current = trackerProgress[id] || 0;
    if (current >= targetCount) {
       // Already done
       return;
    }
    
    const nextProgress = current + 1;
    setTrackerProgress(prev => ({ ...prev, [id]: nextProgress }));
    
    if (nextProgress === targetCount) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Auto transition to next card after a small delay
      setTimeout(() => {
        setSwiperInstance(swiper => {
          if (swiper && !swiper.isEnd) {
            swiper.slideNext();
          } else if (swiper && swiper.isEnd) {
            setView("categories");
          }
          return swiper;
        });
      }, 400);
    }
  };`;

code = code.replace(oldHandleReadingTap, newHandleReadingTap);

// 4. Update the reading view cards container
const startContainer = code.indexOf('{/* Stacked Cards Container */}');
const endContainer = code.indexOf('</div>\n\n        </div>\n      )}', startContainer);

if (startContainer !== -1 && endContainer !== -1) {
  const beforeContainer = code.substring(0, startContainer);
  const afterContainer = code.substring(endContainer);

  const newContainer = `{/* Stacked Cards Container */}
          <div className="flex-1 flex flex-col items-center px-6 relative w-full mt-4 max-w-md mx-auto">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards]}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setCurrentCardIndex(swiper.activeIndex)}
              className="w-full h-full pb-10"
              dir="rtl"
            >
              {readingData.map((dhikr, index) => {
                const currentProg = trackerProgress[dhikr.id] || 0;
                const isDone = currentProg >= dhikr.count;
                
                return (
                  <SwiperSlide key={dhikr.id} className="w-full">
                    <div className={\`w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col min-h-[55vh] border transition-colors duration-300 \${isDone ? 'border-[#0f8e5d]' : 'border-[#2a4563] dark:border-[#2d3b4e]'} relative\`}>
                      
                      {/* Badge */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                          {index + 1}/{readingData.length}
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex items-center justify-center">
                        <p className={\`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 \${
                          fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'
                        }\`}>
                          {dhikr.text.split('\\\\n').map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </div>

                      {/* Counter Button */}
                      <div className="flex justify-center mt-10 mb-2 w-full">
                        <button 
                          onClick={() => handleReadingTap(dhikr.id, dhikr.count)}
                          className="relative overflow-hidden bg-transparent border-2 border-[#0f8e5d] text-white w-2/3 max-w-[200px] h-14 rounded-full text-lg font-bold group"
                        >
                          <span className="relative z-10">{currentProg} من {dhikr.count} مرات</span>
                          {/* Progress Fill */}
                          <div 
                            className="absolute top-0 right-0 bottom-0 bg-[#0f8e5d] transition-all duration-300 ease-out z-0"
                            style={{ width: \`\${(currentProg / dhikr.count) * 100}%\` }}
                          ></div>
                        </button>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>\n`;

  code = beforeContainer + newContainer + afterContainer;
} else {
  console.log("Could not find Stacked Cards Container limits!");
}

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('SWIPER INTEGRATED');
