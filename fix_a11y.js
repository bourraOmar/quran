const fs = require('fs');

// 1. Fix FloatingMobileMenu.tsx
let floatMenu = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');
floatMenu = floatMenu.replace(/<Link href="\/".*?>/, (match) => match.replace('className=', 'aria-label="الرئيسية" className='));
floatMenu = floatMenu.replace(/<Link href="\/surahs".*?>/, (match) => match.replace('className=', 'aria-label="قراءة القرآن" className='));
floatMenu = floatMenu.replace(/<Link href="\/reciters".*?>/, (match) => match.replace('className=', 'aria-label="استماع للقرآن" className='));
// Also fix contrast in FloatingMobileMenu
floatMenu = floatMenu.replace(/text-\[\#4a6b8c\]/g, 'text-[#395675]'); // Wait, it's already #4a6b8c from our previous replace? Let's just do text-[#1e354d] for better contrast against white.
floatMenu = floatMenu.replace(/text-\[\#4a6b8c\]/g, 'text-[#1e354d]');
fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', floatMenu);

// 2. Fix Navbar.tsx
let navbar = fs.readFileSync('src/app/components/Navbar.tsx', 'utf8');
// Add aria-label to mobile theme toggle
navbar = navbar.replace(/<button onClick=\{toggleTheme\} className="p-2 text-\[\#4a6b8c\] dark:text-\[\#94a3b8\]">/, '<button onClick={toggleTheme} className="p-2 text-[#4a6b8c] dark:text-[#94a3b8]" aria-label="Toggle Dark Mode Mobile">');
// Add priority to Image
navbar = navbar.replace(/<Image src="\/logo.jpg" alt="Quran Logo" width=\{40\} height=\{40\} className="rounded-full shadow-sm" \/>/, '<Image src="/logo.jpg" alt="Quran Logo" width={40} height={40} className="rounded-full shadow-sm" priority />');
fs.writeFileSync('src/app/components/Navbar.tsx', navbar);

// 3. Check page.tsx for other images or contrast
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
// Enhance contrast on the bottom CTA: text-[#e2e8f0] is good on #6b8ba7.
// Ensure other texts have good contrast.
fs.writeFileSync('src/app/page.tsx', page);

console.log("Fixed a11y & perf issues.");
