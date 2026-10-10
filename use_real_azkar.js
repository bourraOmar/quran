const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// 1. Import azkar data
if (!code.includes('import azkarData from')) {
    code = code.replace('import { Swiper, SwiperSlide } from \'swiper/react\';', 
`import { Swiper, SwiperSlide } from 'swiper/react';
import azkarData from "../../data/azkar.json";`);
}

// 2. We can dynamically map the real data based on the category.
// Instead of morningAdhkarList, we will just use the imported JSON!
// Our categories array:
/*
const dhikrCategories = [
  { id: 'tasbeeh', title: 'المسبحة الإلكترونية', icon: ( ... )},
  { id: 'morning', title: 'أذكار الصباح', icon: ( ... )},
  { id: 'evening', title: 'أذكار المساء', icon: ( ... )},
  { id: 'prayer', title: 'أذكار الصلاة', icon: ( ... )},
];
*/

// Let's replace the category click logic to just fetch from the JSON
const logicToReplace = `  // Reading Mode Data
  let readingData = morningAdhkarList;
  let readingTitle = "أذكار الصباح";
  if (selectedCategory === 'evening') { readingData = eveningAdhkarList; readingTitle = "أذكار المساء"; }
  if (selectedCategory === 'prayer') { readingData = prayerAdhkarList; readingTitle = "أذكار الصلاة"; }`;

const newLogic = `  // Reading Mode Data
  let readingData: any[] = [];
  let readingTitle = "";
  
  if (selectedCategory) {
     if (selectedCategory === 'morning') {
         readingTitle = "أذكار الصباح";
         readingData = (azkarData as any)['أذكار الصباح'] || [];
     } else if (selectedCategory === 'evening') {
         readingTitle = "أذكار المساء";
         readingData = (azkarData as any)['أذكار المساء'] || [];
     } else if (selectedCategory === 'prayer') {
         readingTitle = "أذكار الصلاة";
         readingData = (azkarData as any)['أذكار بعد السلام من الصلاة المفروضة'] || [];
     } else if (selectedCategory === 'sleep') {
         readingTitle = "أذكار النوم";
         readingData = (azkarData as any)['أذكار النوم'] || [];
     }
  }

  // Format mapping since azkarData uses { content, count, description } instead of { text, count }
  readingData = readingData.map((d, index) => ({
      id: selectedCategory + '_' + index,
      text: d.content + (d.description ? '\\n\\n(' + d.description + ')' : ''),
      count: parseInt(d.count || "1", 10)
  }));
`;

code = code.replace(logicToReplace, newLogic);

// Add the sleep category to dhikrCategories if not there
if (!code.includes("id: 'sleep'")) {
    const prayerCatIdx = code.indexOf("{ id: 'prayer', title: 'أذكار الصلاة'");
    if (prayerCatIdx !== -1) {
        const insertSleep = `{ id: 'sleep', title: 'أذكار النوم', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
  )},
  `;
        code = code.substring(0, prayerCatIdx) + insertSleep + code.substring(prayerCatIdx);
    }
}


fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('REAL AZKAR IMPLEMENTED');
