"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QURAN_CHAPTERS, QURAN_JUZS, ChapterMeta } from "@/data/quranChapters";

export interface PageVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  chapter_id: number;
  page_number: number;
  juz_number: number;
}

interface MushafPageReaderProps {
  pageNumber: number;
  verses: PageVerse[];
}

// Famous reciters for page audio
const RECITERS = [
  { id: "7", name: "مشاري راشد العفاسي" },
  { id: "2", name: "عبد الباسط عبد الصمد (مرتل)" },
  { id: "1", name: "عبد الباسط عبد الصمد (مجود)" },
  { id: "9", name: "محمد صديق المنشاوي (مرتل)" },
  { id: "8", name: "محمد صديق المنشاوي (مجود)" },
  { id: "6", name: "محمود خليل الحصري" },
  { id: "3", name: "عبد الرحمن السديس" },
  { id: "4", name: "أبو بكر الشاطري" },
];

function toArabicDigits(num: number | string): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[+d]);
}

export default function MushafPageReader({ pageNumber, verses }: MushafPageReaderProps) {
  const router = useRouter();

  // Settings & UI state
  const [fontSize, setFontSize] = useState<number>(26); // in px
  const [themeMode, setThemeMode] = useState<"standard" | "sepia">("standard");
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [selectedVerse, setSelectedVerse] = useState<PageVerse | null>(null);

  // Jump modals
  const [showIndexModal, setShowIndexModal] = useState<boolean>(false);
  const [indexTab, setIndexTab] = useState<"surah" | "juz" | "page">("surah");
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(pageNumber));

  // Tafsir modal
  const [tafsirData, setTafsirData] = useState<{ verseKey: string; text: string; loading: boolean } | null>(null);

  // Audio Playback state
  const [selectedReciter, setSelectedReciter] = useState<string>("7");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioList, setAudioList] = useState<{ verse_key: string; url: string }[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save last read page in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("uns_quran_last_page", String(pageNumber));
    } catch {
      // ignore
    }
  }, [pageNumber]);

  // Touch Swipe navigation handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Horizontal swipe threshold: 60px, vertical tolerance: 40px
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
      if (diffX > 0) {
        // Swiped Left in RTL -> Next Page
        goToNextPage();
      } else {
        // Swiped Right in RTL -> Previous Page
        goToPrevPage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === " " && !e.repeat) {
        e.preventDefault();
        togglePlayPageAudio();
      } else if (e.key === "Escape") {
        setSelectedVerse(null);
        setTafsirData(null);
        setShowIndexModal(false);
        setIsFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (pageNumber < 604) {
      router.push(`/mushaf/${pageNumber + 1}`);
    }
  }, [pageNumber, router]);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      router.push(`/mushaf/${pageNumber - 1}`);
    }
  }, [pageNumber, router]);

  // Prefetch next and previous pages for instant transitions
  useEffect(() => {
    if (pageNumber < 604) router.prefetch(`/mushaf/${pageNumber + 1}`);
    if (pageNumber > 1) router.prefetch(`/mushaf/${pageNumber - 1}`);
  }, [pageNumber, router]);

  // Determine metadata for current page
  const pageMetadata = useMemo(() => {
    if (!verses || verses.length === 0) return { juz: 1, hizb: 1, surahs: [] };
    const firstVerse = verses[0];
    const juz = firstVerse.juz_number;
    const hizb = firstVerse.hizb_number;

    // Unique chapter IDs present on this page
    const chapterIds = Array.from(new Set(verses.map((v) => v.chapter_id)));
    const surahs = chapterIds
      .map((id) => QURAN_CHAPTERS.find((c) => c.id === id))
      .filter(Boolean) as ChapterMeta[];

    return { juz, hizb, surahs };
  }, [verses]);

  // Audio Playback: Fetch audio list for the page
  const fetchPageAudio = async (reciter: string) => {
    try {
      const res = await fetch(`/api/quran/audio/${pageNumber}?reciter=${reciter}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.audio_files || [];
    } catch (e) {
      console.error("Failed to load page audio:", e);
      return null;
    }
  };

  const togglePlayPageAudio = async () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }

    let files = audioList;
    if (files.length === 0) {
      const fetched = await fetchPageAudio(selectedReciter);
      if (!fetched || fetched.length === 0) {
        alert("عذراً، لم نتمكن من جلب التلاوة لهذه الصفحة حالياً.");
        return;
      }
      files = fetched;
      setAudioList(fetched);
    }

    const startIndex = currentAudioIndex >= 0 ? currentAudioIndex : 0;
    playAudioIndex(startIndex, files);
  };

  const playAudioIndex = (index: number, files = audioList) => {
    if (index >= files.length) {
      // Finished page
      setIsPlayingAudio(false);
      setCurrentAudioIndex(-1);
      setActiveVerseKey(null);
      // Auto-advance to next page if desired
      if (pageNumber < 604) {
        goToNextPage();
      }
      return;
    }

    const file = files[index];
    const audioUrl = `https://verses.quran.com/${file.url}`;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = audioUrl;
    setCurrentAudioIndex(index);
    setActiveVerseKey(file.verse_key);
    setIsPlayingAudio(true);

    audio.onended = () => {
      playAudioIndex(index + 1, files);
    };

    audio.onerror = () => {
      console.error("Audio error for", file.verse_key);
      playAudioIndex(index + 1, files);
    };

    audio.play().catch((err) => {
      console.error("Audio play blocked:", err);
      setIsPlayingAudio(false);
    });
  };

  const handleReciterChange = async (reciterId: string) => {
    setSelectedReciter(reciterId);
    if (isPlayingAudio) {
      audioRef.current?.pause();
      const fetched = await fetchPageAudio(reciterId);
      if (fetched) {
        setAudioList(fetched);
        playAudioIndex(currentAudioIndex >= 0 ? currentAudioIndex : 0, fetched);
      }
    } else {
      setAudioList([]);
    }
  };

  // Play a single verse directly
  const playSingleVerse = (verseKey: string) => {
    const file = audioList.find((f) => f.verse_key === verseKey);
    if (file) {
      const idx = audioList.findIndex((f) => f.verse_key === verseKey);
      playAudioIndex(idx);
    } else {
      // Fetch audio list then play
      fetchPageAudio(selectedReciter).then((fetched) => {
        if (fetched) {
          setAudioList(fetched);
          const idx = fetched.findIndex((f: { verse_key: string }) => f.verse_key === verseKey);
          if (idx >= 0) playAudioIndex(idx, fetched);
        }
      });
    }
  };

  // Tafsir fetcher
  const openTafsir = async (verseKey: string) => {
    setTafsirData({ verseKey, text: "", loading: true });
    try {
      const res = await fetch(`/api/quran/tafsir/${verseKey}`);
      if (!res.ok) throw new Error("Tafsir not found");
      const json = await res.json();
      setTafsirData({
        verseKey,
        text: json.tafsir?.text || "لا يتوفر تفسير لهذه الآية حالياً.",
        loading: false,
      });
    } catch {
      setTafsirData({
        verseKey,
        text: "تعذر تحميل التفسير. يرجى التحقق من اتصالك بالإنترنت.",
        loading: false,
      });
    }
  };

  // Copy verse to clipboard
  const copyVerse = (verse: PageVerse) => {
    const chapter = QURAN_CHAPTERS.find((c) => c.id === verse.chapter_id);
    const surahName = chapter ? chapter.name_arabic : "";
    const textToCopy = `﴿ ${verse.text_uthmani} ﴾ [${surahName}: ${verse.verse_number}]`;
    navigator.clipboard.writeText(textToCopy);
    alert("تم نسخ الآية الكريمة إلى الحافظة");
    setSelectedVerse(null);
  };

  // Group verses by Surah for pages that start or contain multiple Surahs
  const groupedVerses = useMemo(() => {
    const groups: {
      chapter: ChapterMeta;
      isSurahStart: boolean;
      verses: PageVerse[];
    }[] = [];

    let currentChapterId = -1;
    let currentGroup: PageVerse[] = [];

    verses.forEach((verse) => {
      if (verse.chapter_id !== currentChapterId) {
        if (currentGroup.length > 0) {
          const ch = QURAN_CHAPTERS.find((c) => c.id === currentChapterId)!;
          groups.push({
            chapter: ch,
            isSurahStart: currentGroup[0].verse_number === 1,
            verses: currentGroup,
          });
        }
        currentChapterId = verse.chapter_id;
        currentGroup = [verse];
      } else {
        currentGroup.push(verse);
      }
    });

    if (currentGroup.length > 0) {
      const ch = QURAN_CHAPTERS.find((c) => c.id === currentChapterId)!;
      groups.push({
        chapter: ch,
        isSurahStart: currentGroup[0].verse_number === 1,
        verses: currentGroup,
      });
    }

    return groups;
  }, [verses]);

  return (
    <div
      className={`min-h-screen py-6 px-2 sm:px-4 transition-colors select-none ${
        themeMode === "sepia"
          ? "bg-[#f5ebd7] text-[#3e2723]"
          : "bg-[#f4f7f9] dark:bg-[#0b1320] text-[#1e354d] dark:text-[#f8fafc]"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-[880px] mx-auto space-y-4">
        {/* Top Control Bar (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <div className="bg-white/90 dark:bg-[#152336]/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
            {/* Right: Surah & Juz Picker Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowIndexModal(true);
                  setIndexTab("surah");
                }}
                className="flex items-center gap-2 bg-[#4a6b8c]/10 hover:bg-[#4a6b8c]/20 text-[#395675] dark:text-[#94a3b8] px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-colors"
              >
                <span>📖</span>
                <span>فهرس السور والأجزاء</span>
              </button>

              <button
                onClick={() => {
                  setShowIndexModal(true);
                  setIndexTab("page");
                }}
                className="bg-[#4a6b8c]/10 hover:bg-[#4a6b8c]/20 text-[#395675] dark:text-[#94a3b8] px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-colors"
                title="انتقال مباشر لرقم الصفحة"
              >
                ص {toArabicDigits(pageNumber)} / {toArabicDigits(604)}
              </button>
            </div>

            {/* Left: Settings & Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Font Size controls */}
              <div className="flex items-center bg-gray-100 dark:bg-[#0f172a] rounded-xl p-1 text-xs font-bold">
                <button
                  onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                  className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-[#1e293b] text-gray-700 dark:text-gray-300 transition-colors"
                  title="تصغير الخط"
                >
                  A-
                </button>
                <span className="px-2 text-[11px] text-gray-500">{fontSize}</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(38, s + 2))}
                  className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-[#1e293b] text-gray-700 dark:text-gray-300 transition-colors"
                  title="تكبير الخط"
                >
                  A+
                </button>
              </div>

              {/* Theme toggle (Sepia / Standard) */}
              <button
                onClick={() => setThemeMode((m) => (m === "standard" ? "sepia" : "standard"))}
                className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                  themeMode === "sepia"
                    ? "bg-[#795548] text-white"
                    : "bg-gray-100 dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#94a3b8]"
                }`}
                title="تغيير لون خلفية القراءة"
              >
                📜
              </button>

              {/* Focus Reading Mode Toggle */}
              <button
                onClick={() => setIsFocusMode(true)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-[#0f172a] hover:bg-gray-200 dark:hover:bg-[#1e293b] text-[#4a6b8c] dark:text-[#94a3b8] transition-colors"
                title="وضع القراءة المركزة (ملء الشاشة)"
              >
                ⛶
              </button>
            </div>
          </div>
        )}

        {/* Audio Player Bar (Hidden in Focus Mode or toggleable) */}
        {!isFocusMode && (
          <div className="bg-white/90 dark:bg-[#152336]/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPageAudio}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                  isPlayingAudio
                    ? "bg-[#0f8e5d] text-white animate-pulse"
                    : "bg-[#4a6b8c] hover:bg-[#395675] text-white"
                }`}
              >
                <span>{isPlayingAudio ? "⏸ إيقاف" : "▶ استماع للصفحة"}</span>
              </button>

              {activeVerseKey && (
                <span className="text-[#0f8e5d] dark:text-[#4ade80] font-bold">
                  يتلو الآية: {activeVerseKey}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#4a6b8c] dark:text-[#94a3b8]">القارئ:</span>
              <select
                value={selectedReciter}
                onChange={(e) => handleReciterChange(e.target.value)}
                className="bg-gray-100 dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 font-bold outline-none cursor-pointer text-xs"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* The Holy Quran Page (Medina Mushaf Framing) */}
        <div
          className={`relative rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden transition-all duration-300 ${
            themeMode === "sepia"
              ? "bg-[#fbf4e6] border-[10px] sm:border-[14px] border-[#dfcdb0]"
              : "bg-[#fffefb] dark:bg-[#101b29] border-[10px] sm:border-[14px] border-[#e5dec9] dark:border-[#1a2b40]"
          }`}
        >
          {/* Inner Golden Mushaf Outline Border */}
          <div className="relative p-4 sm:p-8 md:p-10 border-2 border-[#c5a666]/50 dark:border-[#c5a666]/30 m-1.5 sm:m-2.5 rounded-[20px] sm:rounded-[26px]">
            
            {/* Page Header (Surah name - Juz number - Hizb) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#c5a666]/30 dark:border-[#c5a666]/20 text-xs sm:text-sm font-bold text-[#6b5832] dark:text-[#c5a666]">
              {/* Right: Surah Name(s) */}
              <div className="flex items-center gap-2">
                <span>
                  {pageMetadata.surahs.map((s) => s.name_arabic).join(" • ")}
                </span>
              </div>

              {/* Center: Juz Name */}
              <div className="text-center">
                <span>الجزء {toArabicDigits(pageMetadata.juz)}</span>
              </div>

              {/* Left: Hizb Number */}
              <div className="text-left">
                <span>الحزب {toArabicDigits(pageMetadata.hizb)}</span>
              </div>
            </div>

            {/* Page Verses Content */}
            <div className="flex flex-col gap-6 text-justify" dir="rtl">
              {groupedVerses.map((group, gIdx) => {
                const isTawbah = group.chapter.id === 9;
                const isFatiha = group.chapter.id === 1;

                return (
                  <div key={`${group.chapter.id}-${gIdx}`} className="space-y-6">
                    {/* Surah Header Banner (Shown when a Surah begins on this page) */}
                    {group.isSurahStart && (
                      <div className="my-6 text-center">
                        {/* Ornate Surah Box */}
                        <div className="relative mx-auto max-w-[420px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#c5a666]/15 via-[#c5a666]/25 to-[#c5a666]/15 dark:from-[#c5a666]/10 dark:via-[#c5a666]/20 dark:to-[#c5a666]/10 border-2 border-[#c5a666] shadow-sm">
                          <h3
                            className="text-2xl sm:text-3xl font-bold text-[#44351a] dark:text-[#f3e3b8] mb-1"
                            style={{ fontFamily: "var(--font-amiri)" }}
                          >
                            سورة {group.chapter.name_arabic}
                          </h3>
                          <div className="flex items-center justify-center gap-4 text-[11px] sm:text-xs text-[#6b5832] dark:text-[#c5a666] font-semibold">
                            <span>
                              {group.chapter.revelation_place === "makkah" ? "مكية" : "مدنية"}
                            </span>
                            <span>•</span>
                            <span>آياتها {toArabicDigits(group.chapter.verses_count)}</span>
                          </div>
                        </div>

                        {/* Basmalah (For all surahs except At-Tawbah 9 and Al-Fatiha 1 which includes it in verse 1) */}
                        {!isTawbah && !isFatiha && (
                          <div className="flex justify-center mt-5 mb-2">
                            <Image
                              src="/img/basmalah.png"
                              alt="بسم الله الرحمن الرحيم"
                              width={220}
                              height={50}
                              className="dark:invert opacity-90 max-w-[65%]"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verses Flowing Text */}
                    <div
                      className="leading-[2.5] tracking-wide text-justify select-text"
                      style={{
                        fontFamily: "var(--font-amiri-quran), var(--font-amiri), serif",
                        fontSize: `${fontSize}px`,
                      }}
                    >
                      {group.verses.map((verse) => {
                        const isCurrentActive = activeVerseKey === verse.verse_key;
                        const isCurrentSelected = selectedVerse?.id === verse.id;

                        return (
                          <span
                            key={verse.id}
                            onClick={() => setSelectedVerse(verse)}
                            className={`inline cursor-pointer transition-colors duration-200 rounded px-1 py-0.5 ${
                              isCurrentActive
                                ? "bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] font-bold"
                                : isCurrentSelected
                                ? "bg-[#c5a666]/25 dark:bg-[#c5a666]/20"
                                : "hover:bg-[#c5a666]/15 dark:hover:bg-[#c5a666]/10"
                            }`}
                          >
                            {verse.text_uthmani}
                            {/* Ornate Ayah Ending with Arabic Numeral */}
                            <span className="inline-flex items-center justify-center mx-1.5 align-middle select-none">
                              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#c5a666] text-[#6b5832] dark:text-[#c5a666] font-bold text-[13px] sm:text-[14px] flex items-center justify-center bg-[#c5a666]/10 shadow-2xs font-sans">
                                {toArabicDigits(verse.verse_number)}
                              </span>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page Footer (Page Number) */}
            <div className="pt-6 mt-8 border-t border-[#c5a666]/30 dark:border-[#c5a666]/20 text-center">
              <span className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold text-[#6b5832] dark:text-[#c5a666] bg-[#c5a666]/10 border border-[#c5a666]/30">
                — {toArabicDigits(pageNumber)} —
              </span>
            </div>

          </div>
        </div>

        {/* Bottom Page Navigation Controls */}
        <div className="bg-white/90 dark:bg-[#152336]/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
          {/* Previous Page Button (Right in RTL = Previous page e.g. Page 1 -> disabled) */}
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              pageNumber <= 1
                ? "opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500"
                : "bg-[#4a6b8c] hover:bg-[#395675] text-white shadow-sm"
            }`}
          >
            <span>→</span>
            <span>الصفحة السابقة ({toArabicDigits(Math.max(1, pageNumber - 1))})</span>
          </button>

          {/* Quick Page Slider */}
          <div className="hidden sm:flex flex-1 items-center gap-3 px-4">
            <span className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] font-bold">1</span>
            <input
              type="range"
              min="1"
              max="604"
              value={pageNumber}
              onChange={(e) => router.push(`/mushaf/${e.target.value}`)}
              className="w-full accent-[#4a6b8c] cursor-pointer"
            />
            <span className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] font-bold">604</span>
          </div>

          {/* Next Page Button (Left in RTL = Next page) */}
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= 604}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              pageNumber >= 604
                ? "opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500"
                : "bg-[#4a6b8c] hover:bg-[#395675] text-white shadow-sm"
            }`}
          >
            <span>الصفحة التالية ({toArabicDigits(Math.min(604, pageNumber + 1))})</span>
            <span>←</span>
          </button>
        </div>

        {/* Exit Focus Mode Floating Button */}
        {isFocusMode && (
          <button
            onClick={() => setIsFocusMode(false)}
            className="fixed top-4 left-4 z-50 bg-[#1e293b]/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md hover:bg-black transition-all flex items-center gap-2"
          >
            <span>✕ خروج من وضع التركيز</span>
          </button>
        )}
      </div>

      {/* Selected Verse Context Menu Popup */}
      {selectedVerse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-black/10 dark:border-white/10 text-right animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-sm text-[#4a6b8c] dark:text-[#94a3b8]">
                الآية {toArabicDigits(selectedVerse.verse_number)} • {selectedVerse.verse_key}
              </span>
              <button
                onClick={() => setSelectedVerse(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p
              className="text-lg sm:text-xl font-bold text-[#1e354d] dark:text-white leading-loose mb-6"
              style={{ fontFamily: "var(--font-amiri-quran), var(--font-amiri), serif" }}
            >
              ﴿ {selectedVerse.text_uthmani} ﴾
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  playSingleVerse(selectedVerse.verse_key);
                  setSelectedVerse(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-[#0f8e5d] hover:bg-[#0c754d] text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>🔊 استماع</span>
              </button>

              <button
                onClick={() => {
                  openTafsir(selectedVerse.verse_key);
                  setSelectedVerse(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-[#4a6b8c] hover:bg-[#395675] text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>📖 التفسير</span>
              </button>

              <button
                onClick={() => copyVerse(selectedVerse)}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#1e354d] dark:text-white font-bold text-xs transition-colors"
              >
                <span>📋 نسخ</span>
              </button>

              <Link
                href={`/surah/${selectedVerse.chapter_id}`}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#1e354d] dark:text-white font-bold text-xs transition-colors text-center"
              >
                <span>السورة</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {tafsirData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-black/10 dark:border-white/10 text-right animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white flex items-center gap-2">
                <span>📖</span>
                <span>التفسير الميسر (الآية {tafsirData.verseKey})</span>
              </h3>
              <button
                onClick={() => setTafsirData(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {tafsirData.loading ? (
              <div className="py-12 text-center text-[#4a6b8c] dark:text-[#94a3b8] font-bold text-sm">
                جاري تحميل التفسير...
              </div>
            ) : (
              <div
                className="text-sm sm:text-base text-[#334155] dark:text-[#cbd5e1] leading-relaxed pt-2"
                dangerouslySetInnerHTML={{ __html: tafsirData.text }}
              />
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setTafsirData(null)}
                className="px-6 py-2.5 bg-[#4a6b8c] hover:bg-[#395675] text-white rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surahs / Juzs / Pages Navigation Modal */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-black/10 dark:border-white/10 text-right animate-in zoom-in-95 duration-200">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIndexTab("surah")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    indexTab === "surah"
                      ? "bg-[#4a6b8c] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  فهرس السور (114)
                </button>
                <button
                  onClick={() => setIndexTab("juz")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    indexTab === "juz"
                      ? "bg-[#4a6b8c] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  الأجزاء (30)
                </button>
                <button
                  onClick={() => setIndexTab("page")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    indexTab === "page"
                      ? "bg-[#4a6b8c] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  رقم الصفحة
                </button>
              </div>

              <button
                onClick={() => setShowIndexModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Tab 1: Surahs list */}
            {indexTab === "surah" && (
              <div className="flex-1 overflow-y-auto space-y-1.5 p-1 max-h-[60vh] hide-scrollbar">
                {QURAN_CHAPTERS.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/mushaf/${ch.start_page}`}
                    onClick={() => setShowIndexModal(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#0f172a] hover:bg-[#4a6b8c]/15 dark:hover:bg-[#4a6b8c]/25 border border-black/5 dark:border-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#94a3b8] font-bold text-xs flex items-center justify-center border border-black/5 dark:border-white/5">
                        {toArabicDigits(ch.id)}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">
                          سورة {ch.name_arabic}
                        </h4>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {ch.revelation_place === "makkah" ? "مكية" : "مدنية"} • {toArabicDigits(ch.verses_count)} آية
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] bg-white dark:bg-[#1e293b] px-3 py-1 rounded-lg border border-black/5 dark:border-white/5">
                      ص {toArabicDigits(ch.start_page)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Tab 2: Juz list */}
            {indexTab === "juz" && (
              <div className="flex-1 overflow-y-auto space-y-1.5 p-1 max-h-[60vh] hide-scrollbar">
                {QURAN_JUZS.map((j) => (
                  <Link
                    key={j.juz}
                    href={`/mushaf/${j.start_page}`}
                    onClick={() => setShowIndexModal(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] hover:bg-[#4a6b8c]/15 dark:hover:bg-[#4a6b8c]/25 border border-black/5 dark:border-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#94a3b8] font-bold text-xs flex items-center justify-center border border-black/5 dark:border-white/5">
                        {toArabicDigits(j.juz)}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">
                          الجزء {toArabicDigits(j.juz)} ({j.name})
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] bg-white dark:bg-[#1e293b] px-3 py-1 rounded-lg border border-black/5 dark:border-white/5">
                      ص {toArabicDigits(j.start_page)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Tab 3: Direct Page Number Jump */}
            {indexTab === "page" && (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-bold text-[#4a6b8c] dark:text-[#94a3b8]">
                  أدخل رقم الصفحة من 1 إلى 604:
                </p>
                <div className="flex items-center gap-2 max-w-xs w-full">
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const p = parseInt(jumpPageInput, 10);
                        if (!isNaN(p) && p >= 1 && p <= 604) {
                          router.push(`/mushaf/${p}`);
                          setShowIndexModal(false);
                        }
                      }
                    }}
                    className="flex-1 text-center font-bold text-xl py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0f172a] text-[#1e354d] dark:text-white outline-none focus:ring-2 focus:ring-[#4a6b8c]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      const p = parseInt(jumpPageInput, 10);
                      if (!isNaN(p) && p >= 1 && p <= 604) {
                        router.push(`/mushaf/${p}`);
                        setShowIndexModal(false);
                      }
                    }}
                    className="px-6 py-3.5 bg-[#4a6b8c] hover:bg-[#395675] text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    انتقال
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
