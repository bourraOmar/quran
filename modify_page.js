const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add Dashboard import
code = code.replace(
  'import Image from "next/image";',
  'import Image from "next/image";\nimport Dashboard from "./components/Dashboard";'
);

// 2. Wrap the return statement
code = code.replace(
  '  return (\n    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] font-sans pb-24 md:pb-0" dir="rtl">',
  `  return (
    <>
    <div className="block md:hidden"><Dashboard /></div>
    <div className="hidden md:block min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] font-sans pb-24 md:pb-0" dir="rtl">`
);

// 3. Close the React Fragment at the very end
code = code.replace(
  '    </div>\n  );\n}',
  '    </div>\n    </>\n  );\n}'
);

fs.writeFileSync('src/app/page.tsx', code);
console.log('Modified page.tsx for responsive rendering.');
