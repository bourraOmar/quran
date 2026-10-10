const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const startContainer = code.indexOf('{/* Stacked Cards Container */}');
const endContainer = code.indexOf('</div>\\n      )}', startContainer); // Wait, this is getting complex. I'll just use lastIndexOf('</div>\\n      )}')

// Actually let's just do an exact indexOf because we know what's there.
const endString = '</div>\n          \n\n\n        </div>\n      )}';
let endIdx = code.indexOf(endString, startContainer);
if (endIdx === -1) {
  // Let's just find the last `)}` in the file.
  endIdx = code.lastIndexOf(')}');
}

if (startContainer !== -1 && endIdx !== -1) {
  const beforeContainer = code.substring(0, startContainer);
  // The afterContainer should just be `        </div>\n      )}\n\n    </div>\n  );\n}`
  const afterContainer = \`        </div>
      )}

    </div>
  );
}
\`;

  const newContainer = `{/* Stacked Cards Container */}
          <div className="flex-1 flex flex-col items-center px-6 relative w-full mt-4 max-w-md mx-auto">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards]}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setCurrentCardIndex(swiper.activeIndex)}
              className="w-full h-[60vh] pb-10"
              dir="rtl"
            >
              {readingData.map((dhikr, index) => {
                const currentProg = trackerProgress[dhikr.id] || 0;
                const isDone = currentProg >= dhikr.count;
                
                return (
                  <SwiperSlide key={dhikr.id} className="w-full h-full flex">
                    <div className={\`w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col h-full border transition-colors duration-300 \${isDone ? 'border-[#0f8e5d]' : 'border-[#2a4563] dark:border-[#2d3b4e]'} relative\`}>
                      
                      {/* Badge */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                          {index + 1}/{readingData.length}
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex items-center justify-center overflow-y-auto">
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
                      <div className="flex justify-center mt-6 mb-2 w-full shrink-0">
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
          </div>\n\n`;

  code = beforeContainer + newContainer + afterContainer;
  fs.writeFileSync('src/app/dhikr/page.tsx', code);
  console.log('REPLACED CARDS CONTAINER');
} else {
  console.log('FAILED TO FIND LIMITS');
}
