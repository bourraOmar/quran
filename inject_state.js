const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

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

// use regex to match regardless of line endings
code = code.replace(
  /const \[activeVerseKey, setActiveVerseKey\] = useState<string \| null>\(null\);\r?\n\s*const \[isReadingMode, setIsReadingMode\] = useState\(false\);/,
  stateBlock
);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
console.log('State block injected successfully.');
