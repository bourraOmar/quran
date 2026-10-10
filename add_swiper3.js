const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const startContainer = code.indexOf('{/* Stacked Cards Container */}');
let endIdx = code.lastIndexOf(')}');

if (startContainer !== -1 && endIdx !== -1) {
  const beforeContainer = code.substring(0, startContainer);
  const afterContainer = "        </div>\n      )}\n\n    </div>\n  );\n}\n";

  const newContainer = "{/* Stacked Cards Container */}\n" +
"          <div className=\"flex-1 flex flex-col items-center px-6 relative w-full mt-4 max-w-md mx-auto\">\n" +
"            <Swiper\n" +
"              effect={'cards'}\n" +
"              grabCursor={true}\n" +
"              modules={[EffectCards]}\n" +
"              onSwiper={setSwiperInstance}\n" +
"              onSlideChange={(swiper) => setCurrentCardIndex(swiper.activeIndex)}\n" +
"              className=\"w-full h-[60vh] pb-10\"\n" +
"              dir=\"rtl\"\n" +
"            >\n" +
"              {readingData.map((dhikr, index) => {\n" +
"                const currentProg = trackerProgress[dhikr.id] || 0;\n" +
"                const isDone = currentProg >= dhikr.count;\n" +
"                \n" +
"                return (\n" +
"                  <SwiperSlide key={dhikr.id} className=\"w-full h-full flex\">\n" +
"                    <div className={`w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col h-full border transition-colors duration-300 ${isDone ? 'border-[#0f8e5d]' : 'border-[#2a4563] dark:border-[#2d3b4e]'} relative`}>\n" +
"                      \n" +
"                      {/* Badge */}\n" +
"                      <div className=\"flex justify-center mb-6\">\n" +
"                        <div className=\"bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md\">\n" +
"                          {index + 1}/{readingData.length}\n" +
"                        </div>\n" +
"                      </div>\n" +
"\n" +
"                      {/* Text Content */}\n" +
"                      <div className=\"flex-1 flex items-center justify-center overflow-y-auto\">\n" +
"                        <p className={`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 ${fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'}`}>\n" +
"                          {dhikr.text.split('\\\\n').map((line, i) => (\n" +
"                            <span key={i}>\n" +
"                              {line}\n" +
"                              <br />\n" +
"                            </span>\n" +
"                          ))}\n" +
"                        </p>\n" +
"                      </div>\n" +
"\n" +
"                      {/* Counter Button */}\n" +
"                      <div className=\"flex justify-center mt-6 mb-2 w-full shrink-0\">\n" +
"                        <button \n" +
"                          onClick={() => handleReadingTap(dhikr.id, dhikr.count)}\n" +
"                          className=\"relative overflow-hidden bg-transparent border-2 border-[#0f8e5d] text-white w-2/3 max-w-[200px] h-14 rounded-full text-lg font-bold group\"\n" +
"                        >\n" +
"                          <span className=\"relative z-10\">{currentProg} من {dhikr.count} مرات</span>\n" +
"                          {/* Progress Fill */}\n" +
"                          <div \n" +
"                            className=\"absolute top-0 right-0 bottom-0 bg-[#0f8e5d] transition-all duration-300 ease-out z-0\"\n" +
"                            style={{ width: `${(currentProg / dhikr.count) * 100}%` }}\n" +
"                          ></div>\n" +
"                        </button>\n" +
"                      </div>\n" +
"\n" +
"                    </div>\n" +
"                  </SwiperSlide>\n" +
"                );\n" +
"              })}\n" +
"            </Swiper>\n" +
"          </div>\n\n";

  code = beforeContainer + newContainer + afterContainer;
  fs.writeFileSync('src/app/dhikr/page.tsx', code);
  console.log('REPLACED CARDS CONTAINER');
} else {
  console.log('FAILED TO FIND LIMITS');
}
