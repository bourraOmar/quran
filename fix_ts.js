const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');
c = c.replace('onSlideChange={(swiper) =>', 'onSlideChange={(swiper: any) =>');
c = c.replace('setSwiperInstance(swiper =>', 'setSwiperInstance((swiper: any) =>');
fs.writeFileSync('src/app/dhikr/page.tsx', c);
