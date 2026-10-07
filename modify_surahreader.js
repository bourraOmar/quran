const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

// Imports
code = code.replace(
  'import AudioPlayer from "./AudioPlayer";',
  'import AudioPlayer, { AudioPlayerRef } from "./AudioPlayer";'
);

// State & Refs
const stateBlock = `
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const playerRef = useRef<AudioPlayerRef>(null);

  const [popupMenu, setPopupMenu] = useState<{ x: number; y: number; verseKey: string; translation?: string } | null>(null);
  const [showTranslationModal, setShowTranslationModal] = useState<{ verseKey: string; translation: string } | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent, verseKey: string, translation?: string) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setPopupMenu({ x: touch.clientX, y: touch.clientY, verseKey, translation });
    }, 500); // 500ms long press
  };

  const handleTouchEndOrMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleContextMenu = (e: React.MouseEvent, verseKey: string, translation?: string) => {
    e.preventDefault();
    setPopupMenu({ x: e.clientX, y: e.clientY, verseKey, translation });
  };

  useEffect(() => {
    const closePopup = () => setPopupMenu(null);
    window.addEventListener('click', closePopup);
    window.addEventListener('scroll', closePopup);
    return () => {
      window.removeEventListener('click', closePopup);
      window.removeEventListener('scroll', closePopup);
    };
  }, []);
`;

code = code.replace(
  'const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);\n  const [isReadingMode, setIsReadingMode] = useState(false);',
  stateBlock
);

// Player Ref injection
code = code.replace(
  '<AudioPlayer \n                chapterId={chapter.id.toString()} \n                onVerseChange={handleVerseChange} \n              />',
  '<AudioPlayer \n                ref={playerRef}\n                chapterId={chapter.id.toString()} \n                onVerseChange={handleVerseChange} \n              />'
);

// Bind events to verses (with and without translation mode)
code = code.replace(
  /className={`pb-8 border-b border-\[#e2e8f0\] dark:border-\[#334155\] last:border-0 last:pb-0 \${isActive \? 'bg-\[#f4f7f9\] dark:bg-\[#0f172a\] p-4 rounded-xl -mx-4' : ''}`}/g,
  `className={\`pb-8 border-b border-[#e2e8f0] dark:border-[#334155] last:border-0 last:pb-0 \${isActive ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-4 rounded-xl -mx-4' : ''}\`}
                  onContextMenu={(e) => handleContextMenu(e, verse.verse_key, verse.translation)}
                  onTouchStart={(e) => handleTouchStart(e, verse.verse_key, verse.translation)}
                  onTouchEnd={handleTouchEndOrMove}
                  onTouchMove={handleTouchEndOrMove}`
);

// Same for the span in non-translation mode
code = code.replace(
  /ref={isActive \? \(activeVerseRef as React\.RefObject<HTMLSpanElement>\) : null}/g,
  `ref={isActive ? (activeVerseRef as React.RefObject<HTMLSpanElement>) : null}
                onContextMenu={(e) => handleContextMenu(e, verse.verse_key, verse.translation)}
                onTouchStart={(e) => handleTouchStart(e, verse.verse_key, verse.translation)}
                onTouchEnd={handleTouchEndOrMove}
                onTouchMove={handleTouchEndOrMove}
                className={\`font-quran font-normal leading-[2.5] md:leading-[2.8] cursor-pointer hover:text-[#395675] dark:hover:text-[#94a3b8] \${highlightClass}\`}`
);
code = code.replace(
  /className={`font-quran font-normal leading-\[2\.5\] md:leading-\[2\.8\] \${highlightClass}`}/g,
  `` // we injected it directly in the previous replace to make sure it includes cursor-pointer
);


// Modals to inject at the end of the return statement
const modalsBlock = `
      {/* Long Press Popup Menu */}
      {popupMenu && (
        <div 
          className="fixed z-50 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#e2e8f0] dark:border-[#334155] p-2 flex gap-3 items-center transform -translate-x-1/2 -translate-y-[120%]"
          style={{ top: popupMenu.y, left: popupMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
           <button 
             onClick={() => {
               if (playerRef.current) playerRef.current.playVerse(popupMenu.verseKey);
               setPopupMenu(null);
             }}
             className="p-3 bg-[#f4f7f9] dark:bg-[#0f172a] hover:bg-[#e8edf2] dark:hover:bg-[#334155] rounded-xl text-[#395675] dark:text-[#94a3b8] transition-colors shadow-sm"
             aria-label="Listen to Verse"
           >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
           </button>

           {popupMenu.translation && (
             <button 
               onClick={() => {
                 setShowTranslationModal({ verseKey: popupMenu.verseKey, translation: popupMenu.translation! });
                 setPopupMenu(null);
               }}
               className="py-3 px-4 bg-[#f4f7f9] dark:bg-[#0f172a] hover:bg-[#e8edf2] dark:hover:bg-[#334155] rounded-xl text-[#395675] dark:text-[#94a3b8] transition-colors flex items-center gap-2 shadow-sm"
             >
               <span className="font-bold text-sm">تفسير الآية المحددة</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
           )}
        </div>
      )}

      {/* Translation Modal */}
      {showTranslationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTranslationModal(null)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 max-w-2xl w-full text-right shadow-2xl relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#1e293b] pb-4 border-b border-[#e2e8f0] dark:border-[#334155]">
              <button onClick={() => setShowTranslationModal(null)} className="text-[#4a6b8c] hover:text-red-500 transition-colors bg-[#f4f7f9] dark:bg-[#0f172a] p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="font-bold text-xl md:text-2xl text-[#1e354d] dark:text-[#f8fafc]">تفسير الآية ({showTranslationModal.verseKey.split(':')[1]})</h3>
            </div>
            <div className="text-lg md:text-xl text-[#395675] dark:text-[#94a3b8] leading-loose font-sans" dangerouslySetInnerHTML={{ __html: showTranslationModal.translation }} />
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/, modalsBlock);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
console.log('SurahReader modified successfully.');
