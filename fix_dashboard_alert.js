const fs = require('fs');

let dashboard = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');

// 1. Add toast state
dashboard = dashboard.replace(
  'const [currentTime, setCurrentTime] = useState(new Date());',
  'const [currentTime, setCurrentTime] = useState(new Date());\n  const [toastMessage, setToastMessage] = useState("");'
);

// 2. Replace the alert() inside togglePrayed
dashboard = dashboard.replace(
  /alert\("لا يمكن تسجيل الصلاة قبل دخول وقتها"\);/,
  `setToastMessage("لا يمكن تسجيل الصلاة قبل دخول وقتها");
      setTimeout(() => setToastMessage(""), 3000);`
);

// 3. Inject the Toast HTML at the end of the Dashboard return
const toastHtml = `
      {/* Toast Notification */}
      <div className={\`fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e354d] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm transition-all duration-300 pointer-events-none \${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}\`}>
        {toastMessage}
      </div>
`;

dashboard = dashboard.replace(
  '    </div>\n  );\n}',
  `\n${toastHtml}    </div>\n  );\n}`
);

fs.writeFileSync('src/app/components/Dashboard.tsx', dashboard);
console.log('Fixed alert toast in Dashboard');
