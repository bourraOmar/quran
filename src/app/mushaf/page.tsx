"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MushafRootPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const lastPage = localStorage.getItem("uns_quran_last_page");
      const pageNum = lastPage ? parseInt(lastPage, 10) : 1;
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
        router.replace(`/mushaf/${pageNum}`);
        return;
      }
    } catch {
      // fallback
    }
    router.replace("/mushaf/1");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-[#4a6b8c] dark:text-[#94a3b8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#4a6b8c] border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-sm">جاري فتح المصحف الشريف...</p>
      </div>
    </div>
  );
}
