const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Remove the auto-close logic
const autoCloseEffect = `const hasTimings = verseTimings.length > 0;
  const showLyricsButton = hasTimings || isTimingLoading;

  useEffect(() => {
    if (!showLyricsButton && showLyrics) {
      setShowLyrics(false);
    }
  }, [showLyricsButton, showLyrics]);`;

player = player.replace(autoCloseEffect, '');

// 2. Remove the opacity-0 pointer-events-none class from the button
const buttonRegex = /className=\{\`p-2 rounded-full transition-all duration-300 \$\{showLyrics \? 'text-\[\#1db954\] hover:text-\[\#1ed760\]' : 'text-white\/60 hover:text-white'\} \$\{showLyricsButton \? 'opacity-100' : 'opacity-0 pointer-events-none'\}\`\}/;
const replacementButton = `className={\`p-2 rounded-full transition-colors \${showLyrics ? 'text-[#1db954] hover:text-[#1ed760]' : 'text-white/60 hover:text-white'}\`}`;

player = player.replace(buttonRegex, replacementButton);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
