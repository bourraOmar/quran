const fs = require('fs');

// 1. Update globals.css to include the background image globally
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(
  '  body {\n    background-color: #f4f7f9;\n    color: #1e354d;\n  }',
  `  body {
    background-color: #0f172a;
    background-image: url('/bg.jpg');
    background-size: cover;
    background-position: center top;
    background-attachment: fixed;
    color: #ffffff;
  }`
);
fs.writeFileSync('src/app/globals.css', css);

// 2. Remove solid backgrounds from Dashboard.tsx
let dashboard = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(
  'className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-32"',
  'className="min-h-screen bg-transparent text-white font-sans pb-32"'
);

// Dashboard cards need to be slightly translucent to show the background
dashboard = dashboard.replace(/bg-white dark:bg-\[#1e293b\]/g, 'bg-[#1e293b]/80 backdrop-blur-md border border-white/10');
// Dashboard header arc
dashboard = dashboard.replace(/bg-white dark:bg-\[#1e293b\] pt-12 pb-24 px-6 rounded-b-\[40px\] shadow-sm relative/g, 'bg-[#1e293b]/90 backdrop-blur-xl pt-12 pb-24 px-6 rounded-b-[40px] shadow-2xl relative border-b border-white/10');

fs.writeFileSync('src/app/components/Dashboard.tsx', dashboard);

// 3. Remove solid backgrounds from Dhikr page.tsx
let dhikr = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');
dhikr = dhikr.replace(
  'className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-32"',
  'className="min-h-screen bg-transparent text-white font-sans pb-32"'
);

dhikr = dhikr.replace(
  'className="animate-fade-in flex flex-col min-h-screen bg-[#1e354d] dark:bg-[#0b1221] text-white relative pb-32"',
  'className="animate-fade-in flex flex-col min-h-screen bg-transparent text-white relative pb-32"'
);

// Dhikr List View header
dhikr = dhikr.replace(
  'bg-[#1e354d] dark:bg-[#0b1221] text-white pt-16 pb-12 px-6 rounded-b-[50px] shadow-lg relative overflow-hidden',
  'bg-black/40 backdrop-blur-md text-white pt-16 pb-12 px-6 rounded-b-[50px] shadow-lg relative overflow-hidden border-b border-amber-400/20'
);

// Dhikr list cards
dhikr = dhikr.replace(/bg-white dark:bg-\[#1e293b\]/g, 'bg-[#1e293b]/60 backdrop-blur-md');

fs.writeFileSync('src/app/dhikr/page.tsx', dhikr);

console.log('Applied global background image');
