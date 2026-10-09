const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// 1. Add state for the reset modal
code = code.replace(
  'const [adhkarProgress, setAdhkarProgress] = useState<Record<number, number>>({});',
  'const [adhkarProgress, setAdhkarProgress] = useState<Record<number, number>>({});\n  const [showResetModal, setShowResetModal] = useState(false);'
);

// 2. Modify resetFreeTap
code = code.replace(
  /const resetFreeTap = \(\) => \{[\s\S]*?\};\n/,
  `const confirmReset = () => {
    setFreeCount(0);
    localStorage.setItem("freeTasbeehCount", "0");
    setShowResetModal(false);
  };
`
);

// 3. Modify the reset button onClick to show the modal
code = code.replace(
  'onClick={resetFreeTap}',
  'onClick={() => setShowResetModal(true)}'
);

// 4. Inject the custom modal into the JSX
const modalHtml = `
      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 w-full max-w-xs shadow-2xl scale-100">
            <h3 className="text-xl font-bold mb-2">تصفير العداد</h3>
            <p className="opacity-70 text-sm mb-6">هل أنت متأكد أنك تريد تصفير عداد التسبيح؟</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-3 rounded-full font-bold bg-[#f4f7f9] dark:bg-[#0f172a] hover:opacity-80 transition-opacity">إلغاء</button>
              <button onClick={confirmReset} className="flex-1 py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">تصفير</button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{/* ---------------- FREE TASBEEH ---------------- */}',
  modalHtml + '\n\n        {/* ---------------- FREE TASBEEH ---------------- */}'
);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed confirm modal in Dhikr page');
