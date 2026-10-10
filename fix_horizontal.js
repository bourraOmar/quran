const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const targetStr = `              className="w-full h-[60vh] pb-10"
              direction="vertical"
              dir="rtl"`;

const newStr = `              className="w-full h-[60vh] pb-10"
              direction="horizontal"
              dir="rtl"`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('src/app/dhikr/page.tsx', c);
    console.log("REPLACED TO HORIZONTAL");
} else {
    console.log("NOT FOUND");
}
