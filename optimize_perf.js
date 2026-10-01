const fs = require('fs');

// 1. Optimize globals.css - add font-display swap + preload hint for critical fonts
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('font-display')) {
  css = css.replace('@import "tailwindcss";', `@import "tailwindcss";`);
}
// Add will-change optimization for scroll animation
if (!css.includes('will-change')) {
  css = css.replace(
    '@keyframes scroll {',
    `@layer utilities {
  .animate-scroll {
    will-change: transform;
  }
}

@keyframes scroll {`
  );
}
fs.writeFileSync('src/app/globals.css', css);
console.log('globals.css done');

// 2. Optimize next.config.ts for image compression
let nextConfig = fs.readFileSync('next.config.ts', 'utf8');
if (!nextConfig.includes('formats')) {
  nextConfig = nextConfig.replace(
    'const nextConfig: NextConfig = {',
    `const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },`
  );
  fs.writeFileSync('next.config.ts', nextConfig);
  console.log('next.config.ts done');
} else {
  console.log('next.config.ts already optimized');
}
