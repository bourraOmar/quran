const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// 1. Remove state
code = code.replace(/const \[selectedStyle, setSelectedStyle\] = useState<"Murattal" \| "Mujawwad">\("Murattal"\);\r?\n\s*/, '');

// 2. Remove style toggle UI block
// Look for `{/* Style Toggle */}` until `</div>`
const toggleStart = code.indexOf('{/* Style Toggle */}');
if (toggleStart !== -1) {
  const toggleEnd = code.indexOf('</div>\n', toggleStart) + 7;
  // wait, the toggle has nested div, so maybe easier:
  const exactToggle = `{/* Style Toggle */}
        <div className="flex bg-[#f4f7f9] dark:bg-[#0f172a] p-1 rounded-full border border-[#e2e8f0] dark:border-[#334155]">
          <button
            onClick={() => setSelectedStyle("Murattal")}
            className={\`px-6 py-2 rounded-full font-bold text-sm transition-all \${selectedStyle === "Murattal" ? "bg-[#6b8ba7] text-white shadow-md" : "text-[#5a7b9c] dark:text-[#94a3b8] hover:text-[#1e354d] dark:hover:text-[#f8fafc]"}\`}
          >
            مرتل (مع التتبع)
          </button>
          <button
            onClick={() => setSelectedStyle("Mujawwad")}
            className={\`px-6 py-2 rounded-full font-bold text-sm transition-all \${selectedStyle === "Mujawwad" ? "bg-[#6b8ba7] text-white shadow-md" : "text-[#5a7b9c] dark:text-[#94a3b8] hover:text-[#1e354d] dark:hover:text-[#f8fafc]"}\`}
          >
            مجود
          </button>
        </div>`;
  code = code.replace(exactToggle, '');
}

// 3. Remove auto-select effect
const autoSelectEffect = `// Auto-select first reciter if current selection doesn't match style
  useEffect(() => {
    if (availableReciters.length > 0) {
      const exists = availableReciters.find(r => r.id === selectedReciterId);
      if (!exists) {
        setSelectedReciterId(availableReciters[0].id);
      }
    }
  }, [selectedStyle, availableReciters, selectedReciterId]);`;
code = code.replace(autoSelectEffect, '');

// 4. Remove Mujawwad logic from the big useEffect
const mujawwadRegex = /if \(selectedStyle === "Mujawwad"\) \{[\s\S]*?\} else \{([\s\S]*?)\r?\n\s*\}\r?\n\s*\}, \[chapterId, selectedReciterId, selectedStyle, onVerseChange\]\);/m;
code = code.replace(mujawwadRegex, `$1
  }, [chapterId, selectedReciterId, onVerseChange]);`);

// 5. Remove styleLabel in map
const styleLabelRegex = /let styleLabel = "";[\s\S]*?return \(/;
code = code.replace(styleLabelRegex, 'return (');
code = code.replace(/\{r\.translated_name\.name\}\{styleLabel\}/, '{r.translated_name.name}');

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
