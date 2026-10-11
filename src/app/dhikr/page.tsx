/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import azkarData from "../../data/azkar.json";

interface DhikrCardItem {
  id: string;
  text: string;
  count: number;
  description?: string;
  reference?: string;
}

interface DhikrCategory {
  id: string;
  title: string;
  description: string;
  countLabel: string;
  icon: string;
  type: "reading" | "tasbeeh";
  filterGroup: "daily" | "prayer_sleep" | "tasbeeh";
}

const CATEGORIES: DhikrCategory[] = [
  {
    id: "tasbeeh",
    title: "المسبحة الإلكترونية",
    description: "المس أي مكان في الشاشة للتسبيح بسهولة",
    countLabel: "عداد ذكي",
    icon: "tasbeeh",
    type: "tasbeeh",
    filterGroup: "tasbeeh",
  },
  {
    id: "morning",
    title: "أذكار الصباح",
    description: "أذكار الصباح كاملة ومحصنة للبدء باليوم",
    countLabel: "25 ذكراً",
    icon: "sun",
    type: "reading",
    filterGroup: "daily",
  },
  {
    id: "evening",
    title: "أذكار المساء",
    description: "أذكار المساء للتحصين والسكينة والراحة",
    countLabel: "25 ذكراً",
    icon: "moon",
    type: "reading",
    filterGroup: "daily",
  },
  {
    id: "prayer",
    title: "أذكار الصلاة",
    description: "أذكار ما بعد السلام من الصلاة المفروضة",
    countLabel: "9 أذكار",
    icon: "prayer",
    type: "reading",
    filterGroup: "prayer_sleep",
  },
  {
    id: "sleep",
    title: "أذكار النوم",
    description: "أذكار النوم للتحصين والطمأنينة قبل النوم",
    countLabel: "10 أذكار",
    icon: "bed",
    type: "reading",
    filterGroup: "prayer_sleep",
  },
  {
    id: "waking",
    title: "أذكار الاستيقاظ",
    description: "أذكار الاستيقاظ من النوم والنشور",
    countLabel: "3 أذكار",
    icon: "sunrise",
    type: "reading",
    filterGroup: "prayer_sleep",
  },
  {
    id: "tasabeeh",
    title: "تسابيح واستغفار",
    description: "أذكار التسبيح والتهليل والتحميد المأثورة",
    countLabel: "16 ذكراً",
    icon: "sparkles",
    type: "reading",
    filterGroup: "tasbeeh",
  },
];

const TASBEEH_PRESETS = [
  { id: 1, arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { id: 2, arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { id: 3, arabic: "اللَّهُ أَكْبَرُ", target: 33 },
  { id: 4, arabic: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
  { id: 5, arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", target: 100 },
  { id: 6, arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 33 },
  { id: 7, arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100 },
  { id: 8, arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", target: 100 },
];

export default function DhikrApp() {
  const [view, setView] = useState<"categories" | "tasbeeh_counter" | "reading">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "daily" | "prayer_sleep" | "tasbeeh" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States for Tasbeeh (Full-Screen Touch)
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<number>(1);
  const [tasbeehTarget, setTasbeehTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [saveCountEnabled, setSaveCountEnabled] = useState<boolean>(true);
  const [motifStyle, setMotifStyle] = useState<"star8" | "star12" | "both">("star8");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [tapAnimation, setTapAnimation] = useState<boolean>(false);

  // States for Reading Mode
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [trackerProgress, setTrackerProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const savedCount = localStorage.getItem("tasbeeh_current_count");
      if (savedCount) setTasbeehCount(parseInt(savedCount, 10) || 0);

      const savedSound = localStorage.getItem("tasbeeh_sound");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedVibrate = localStorage.getItem("tasbeeh_vibrate");
      if (savedVibrate !== null) setVibrateEnabled(savedVibrate === "true");

      const savedSaveCount = localStorage.getItem("tasbeeh_save_count");
      if (savedSaveCount !== null) setSaveCountEnabled(savedSaveCount === "true");

      const savedMotif = localStorage.getItem("tasbeeh_motif") as "star8" | "star12" | "both" | null;
      if (savedMotif) setMotifStyle(savedMotif);

      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }

      const favs = localStorage.getItem("dhikr_favorites");
      if (favs) setFavorites(JSON.parse(favs));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const playBeadClick = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // audio error ignored
    }
  };

  const handleFullTouchTap = () => {
    const next = tasbeehCount + 1;
    setTasbeehCount(next);

    if (saveCountEnabled) {
      try {
        localStorage.setItem("tasbeeh_current_count", next.toString());
      } catch {
        // ignore
      }
    }

    if (soundEnabled) {
      playBeadClick();
    }

    if (vibrateEnabled && navigator.vibrate) {
      if (tasbeehTarget > 0 && next % tasbeehTarget === 0) {
        navigator.vibrate([100, 60, 120]);
      } else {
        navigator.vibrate(30);
      }
    }

    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 120);
  };

  const handleResetTasbeeh = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("هل تريد تصفير عداد التسبيح؟")) {
      setTasbeehCount(0);
      try {
        localStorage.setItem("tasbeeh_current_count", "0");
      } catch {
        // ignore
      }
    }
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleSelectMotif = (m: "star8" | "star12" | "both") => {
    setMotifStyle(m);
    try {
      localStorage.setItem("tasbeeh_motif", m);
    } catch {
      // ignore
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem("dhikr_favorites", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (dhikr: DhikrCardItem) => {
    const shareText = `${dhikr.text}\n\n${dhikr.description ? `(${dhikr.description})` : ""}\nتمت المشاركة من تطبيق القرآن الكريم والأذكار`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ذكر مبارك",
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy(shareText, dhikr.id);
    }
  };

  const handleCategoryClick = (id: string) => {
    if (id === "tasbeeh") {
      setView("tasbeeh_counter");
    } else {
      setSelectedCategory(id);
      setView("reading");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get items for current reading category
  const { readingData, readingTitle } = useMemo(() => {
    let rawItems: any[] = [];
    let title = "";

    if (selectedCategory === "morning") {
      title = "أذكار الصباح";
      rawItems = (azkarData as any)["أذكار الصباح"]?.flat() || [];
    } else if (selectedCategory === "evening") {
      title = "أذكار المساء";
      rawItems = (azkarData as any)["أذكار المساء"]?.flat() || [];
    } else if (selectedCategory === "prayer") {
      title = "أذكار الصلاة";
      rawItems = (azkarData as any)["أذكار بعد السلام من الصلاة المفروضة"]?.flat() || [];
    } else if (selectedCategory === "sleep") {
      title = "أذكار النوم";
      rawItems = (azkarData as any)["أذكار النوم"]?.flat() || [];
    } else if (selectedCategory === "waking") {
      title = "أذكار الاستيقاظ";
      rawItems = (azkarData as any)["أذكار الاستيقاظ"]?.flat() || [];
    } else if (selectedCategory === "tasabeeh") {
      title = "تسابيح واستغفار";
      rawItems = (azkarData as any)["تسابيح"]?.flat() || [];
    }

    const formatted: DhikrCardItem[] = rawItems
      .filter((d) => d && d.content && d.content !== "stop")
      .map((d, index) => ({
        id: `${selectedCategory}_${index}`,
        text: d.content || "",
        description: d.description || "",
        reference: d.reference || "",
        count: parseInt(d.count || "1", 10) || 1,
      }));

    return { readingData: formatted, readingTitle: title };
  }, [selectedCategory]);

  const handleReadingTap = (id: string, targetCount: number) => {
    if (navigator.vibrate) navigator.vibrate(50);

    const current = trackerProgress[id] || 0;
    if (current >= targetCount) {
      return;
    }

    const nextProgress = current + 1;
    setTrackerProgress((prev) => ({ ...prev, [id]: nextProgress }));

    if (nextProgress === targetCount) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      setTimeout(() => {
        setSwiperInstance((swiper: any) => {
          if (swiper && !swiper.isEnd) {
            swiper.slideNext();
          } else if (swiper && swiper.isEnd) {
            setView("categories");
          }
          return swiper;
        });
      }, 350);
    }
  };

  // Filter Categories
  const filteredCategories = useMemo(() => {
    let list = CATEGORIES;
    if (activeTab === "daily") {
      list = list.filter((c) => c.filterGroup === "daily");
    } else if (activeTab === "prayer_sleep") {
      list = list.filter((c) => c.filterGroup === "prayer_sleep");
    } else if (activeTab === "tasbeeh") {
      list = list.filter((c) => c.filterGroup === "tasbeeh");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "tasbeeh":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "sun":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "moon":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case "bed":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "prayer":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "sunrise":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
        );
      case "sparkles":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans transition-colors duration-300"
      dir="rtl"
    >
      {/* 1. CATEGORIES VIEW */}
      {view === "categories" && (
        <div className="animate-fade-in px-6 pt-16 pb-28 max-w-lg mx-auto">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-transparent hover:border-[#4a6b8c]/30 active:scale-95 transition-all"
                title="الرجوع للرئيسية"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold text-[#1e354d] dark:text-white">
                  قسم الأذكار
                </h1>
                <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  أدعية وأذكار اليوم والليلة والمسبحة الذكية
                </p>
              </div>
            </div>

            {/* Quick Favorites Pill */}
            {favorites.length > 0 && (
              <button
                onClick={() => setActiveTab(activeTab === "favorites" ? "all" : "favorites")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "favorites"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-white dark:bg-[#1e293b] text-amber-500 border border-amber-500/20"
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>{favorites.length}</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ذكر أو تسبيح (صباح، استغفار، نوم...)"
              className="w-full bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white pl-10 pr-11 py-4 rounded-3xl text-sm border border-transparent hover:border-[#4a6b8c]/30 focus:border-[#0f8e5d] focus:outline-none shadow-sm transition-all placeholder:text-[#4a6b8c]/60 dark:placeholder:text-[#8ba7c0]/60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b8c] dark:text-[#8ba7c0] pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "all"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
              }`}
            >
              الكل ({CATEGORIES.length})
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "daily"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
              }`}
            >
              ☀️ الصباح والمساء
            </button>
            <button
              onClick={() => setActiveTab("tasbeeh")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "tasbeeh"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
              }`}
            >
              📿 المسبحة والتسابيح
            </button>
            <button
              onClick={() => setActiveTab("prayer_sleep")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "prayer_sleep"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
              }`}
            >
              🌙 الصلاة والنوم
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex items-center justify-between transition-transform active:scale-95 border border-transparent hover:border-[#4a6b8c]/30 group"
              >
                {/* Right side: Icon + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] dark:text-[#8ba7c0] group-hover:scale-105 transition-transform">
                    {renderIcon(cat.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#1e354d] dark:text-white block">
                      {cat.title}
                    </span>
                    <span className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5 block">
                      {cat.countLabel} • {cat.description}
                    </span>
                  </div>
                </div>

                {/* Left side: Chevron arrow */}
                <svg
                  className="w-5 h-5 opacity-40 text-[#1e354d] dark:text-white group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-transparent">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="font-bold text-lg text-[#1e354d] dark:text-white">لم يتم العثور على أي نتائج</p>
                <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">
                  جرب البحث بكلمة أخرى أو إلغاء التصفية
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                  className="mt-4 px-5 py-2 bg-[#0f8e5d] text-white rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform"
                >
                  عرض جميع الأذكار
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FULL-SCREEN TOUCHABLE TASBEEH VIEW */}
      {view === "tasbeeh_counter" && (
        <div
          onClick={handleFullTouchTap}
          className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none cursor-pointer bg-[#f4f7f9] dark:bg-[#111c24] text-[#1e354d] dark:text-white animate-fade-in"
        >
          {/* Top-Left Geometric Watermark Corner (from user screenshot reference) */}
          <div className="absolute -top-12 -left-12 pointer-events-none select-none opacity-15 dark:invert dark:opacity-20 z-0">
            <img
              src="/images/islamic-star-12.png"
              alt="زخرفة ركنية إسلامية"
              className="w-56 h-56 md:w-72 md:h-72 object-contain rotate-12"
            />
          </div>

          {/* Top Header Bar */}
          <div className="pt-10 px-6 flex items-center justify-between w-full max-w-lg mx-auto relative z-30">
            {/* Left Controls (Reset, Theme/Night, Settings) */}
            <div className="flex items-center gap-2.5">
              {/* Reset Count Button */}
              <button
                onClick={handleResetTasbeeh}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#1e293b] shadow-md flex items-center justify-center text-[#1e354d] dark:text-white border border-black/5 dark:border-white/10 active:scale-90 transition-transform"
                title="تصفير العداد"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Night Mode / Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#1e293b] shadow-md flex items-center justify-center text-[#1e354d] dark:text-white border border-black/5 dark:border-white/10 active:scale-90 transition-transform"
                title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[#4a6b8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Settings Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsModal(true);
                }}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#1e293b] shadow-md flex items-center justify-center text-[#1e354d] dark:text-white border border-black/5 dark:border-white/10 active:scale-90 transition-transform"
                title="إعدادات السبحة"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Right: Back & Title */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-[#1e354d] dark:text-white">السبحة</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setView("categories");
                }}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#1e293b] shadow-md flex items-center justify-center text-[#1e354d] dark:text-white border border-black/5 dark:border-white/10 active:scale-90 transition-transform"
                title="رجوع للأقسام"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Dhikr Preset Selector */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto px-6 mt-6 relative z-30"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {TASBEEH_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPresetId(p.id);
                    setTasbeehTarget(p.target);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedPresetId === p.id
                      ? "bg-[#0f8e5d] text-white shadow-[#0f8e5d]/30"
                      : "bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-[#8ba7c0] border border-black/5 dark:border-white/5"
                  }`}
                >
                  {p.arabic}
                </button>
              ))}
            </div>
          </div>

          {/* Center Touch Counter with Islamic Geometric Star Motif */}
          <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto py-8">
            {/* Selected Dhikr Title */}
            <div className="relative z-10 mb-2 px-6 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e354d] dark:text-white leading-relaxed">
                {TASBEEH_PRESETS.find((p) => p.id === selectedPresetId)?.arabic}
              </h2>
              {tasbeehTarget > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] inline-block mt-1">
                  الهدف: {tasbeehTarget} مرة
                </span>
              )}
            </div>

            {/* Central Geometric Star Motif Framing the Counter Number */}
            <div className="relative flex items-center justify-center">
              {/* Islamic Star Background (from user uploaded icons) */}
              <div
                className={`transition-transform duration-150 pointer-events-none select-none ${
                  tapAnimation ? "scale-105" : "scale-100"
                }`}
              >
                {motifStyle === "star8" && (
                  <img
                    src="/images/islamic-star-8.png"
                    alt="نجمة إسلامية مثمنة"
                    className="w-72 h-72 md:w-96 md:h-96 object-contain opacity-25 dark:invert dark:opacity-30 drop-shadow-sm transition-opacity"
                  />
                )}
                {motifStyle === "star12" && (
                  <img
                    src="/images/islamic-star-12.png"
                    alt="وردة إسلامية هندسية"
                    className="w-72 h-72 md:w-96 md:h-96 object-contain opacity-25 dark:invert dark:opacity-30 drop-shadow-sm transition-opacity"
                  />
                )}
                {motifStyle === "both" && (
                  <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                    <img
                      src="/images/islamic-star-12.png"
                      alt="زخرفة 12"
                      className="absolute inset-0 w-full h-full object-contain opacity-20 dark:invert dark:opacity-20"
                    />
                    <img
                      src="/images/islamic-star-8.png"
                      alt="زخرفة 8"
                      className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] object-contain opacity-25 dark:invert dark:opacity-30 rotate-45"
                    />
                  </div>
                )}
              </div>

              {/* Giant Number Display Centered Inside Motif */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-transform duration-100 ${
                  tapAnimation ? "scale-110" : "scale-100"
                }`}
              >
                <span className="text-8xl md:text-9xl font-black tracking-tight text-[#0f8e5d] dark:text-[#a7f3d0] drop-shadow-sm select-none font-sans">
                  {tasbeehCount}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Wooden Beads Decoration (matching user screenshot) */}
          <div className="relative w-full overflow-hidden pointer-events-none pb-6 flex justify-center">
            <svg
              className={`w-full max-w-md h-24 transition-transform duration-150 ${
                tapAnimation ? "translate-x-2" : "translate-x-0"
              }`}
              viewBox="0 0 400 100"
              fill="none"
            >
              <defs>
                <radialGradient id="woodBead" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#d99b66" />
                  <stop offset="40%" stopColor="#a36336" />
                  <stop offset="85%" stopColor="#5c3417" />
                  <stop offset="100%" stopColor="#2e1708" />
                </radialGradient>
                <linearGradient id="beadString" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3d210f" />
                  <stop offset="100%" stopColor="#542e15" />
                </linearGradient>
              </defs>

              {/* Thread String */}
              <path d="M 0 65 Q 200 110 400 65" stroke="url(#beadString)" strokeWidth="4" />

              {/* Wooden Beads Row */}
              <circle cx="30" cy="72" r="22" fill="url(#woodBead)" />
              <circle cx="75" cy="79" r="23" fill="url(#woodBead)" />
              <circle cx="122" cy="84" r="24" fill="url(#woodBead)" />
              <circle cx="172" cy="87" r="25" fill="url(#woodBead)" />
              <circle cx="225" cy="87" r="25" fill="url(#woodBead)" />
              <circle cx="277" cy="84" r="24" fill="url(#woodBead)" />
              <circle cx="325" cy="79" r="23" fill="url(#woodBead)" />
              <circle cx="370" cy="72" r="22" fill="url(#woodBead)" />
            </svg>
          </div>

          {/* Settings Modal (Image 2 design) */}
          {showSettingsModal && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowSettingsModal(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#1e293b] text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-white/10"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                  <h3 className="text-xl font-bold">العداد</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Settings Options */}
                <div className="space-y-5">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">صوت العداد</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        try {
                          localStorage.setItem("tasbeeh_sound", next.toString());
                        } catch {
                          // ignore
                        }
                      }}
                      className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors ${
                        soundEnabled ? "bg-[#0f8e5d]" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          soundEnabled ? "-translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Vibration Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">العداد بالاهتزاز</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !vibrateEnabled;
                        setVibrateEnabled(next);
                        try {
                          localStorage.setItem("tasbeeh_vibrate", next.toString());
                        } catch {
                          // ignore
                        }
                      }}
                      className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors ${
                        vibrateEnabled ? "bg-[#0f8e5d]" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          vibrateEnabled ? "-translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Save Last Count Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">حفظ آخر رقم وصل إليه العداد</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !saveCountEnabled;
                        setSaveCountEnabled(next);
                        try {
                          localStorage.setItem("tasbeeh_save_count", next.toString());
                        } catch {
                          // ignore
                        }
                      }}
                      className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors ${
                        saveCountEnabled ? "bg-[#0f8e5d]" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          saveCountEnabled ? "-translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Islamic Geometric Motif Selector */}
                  <div className="pt-2">
                    <span className="text-xs text-white/60 block mb-2 font-semibold">شكل الزخرفة الهندسية:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectMotif("star8")}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          motifStyle === "star8"
                            ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/30"
                            : "bg-white/10 text-white/70 hover:bg-white/15"
                        }`}
                      >
                        <img src="/images/islamic-star-8.png" alt="8" className="w-5 h-5 invert opacity-80" />
                        <span>نجمة مثمنة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMotif("star12")}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          motifStyle === "star12"
                            ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/30"
                            : "bg-white/10 text-white/70 hover:bg-white/15"
                        }`}
                      >
                        <img src="/images/islamic-star-12.png" alt="12" className="w-5 h-5 invert opacity-80" />
                        <span>وردة إسلامية</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMotif("both")}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          motifStyle === "both"
                            ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/30"
                            : "bg-white/10 text-white/70 hover:bg-white/15"
                        }`}
                      >
                        <span className="text-sm">✦ ✦</span>
                        <span>النمطان معاً</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Goal Selector */}
                  <div className="pt-2">
                    <span className="text-xs text-white/60 block mb-2 font-semibold">الهدف المحدد:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[33, 100, 0].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTasbeehTarget(t)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            tasbeehTarget === t
                              ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/30"
                              : "bg-white/10 text-white/70 hover:bg-white/15"
                          }`}
                        >
                          {t === 0 ? "حر (مفتوح)" : `${t} مرة`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full mt-7 py-3.5 bg-[#0f8e5d] hover:bg-[#0f8e5d]/90 text-white font-bold rounded-2xl shadow-lg shadow-[#0f8e5d]/30 active:scale-95 transition-all text-sm"
                >
                  حفظ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. READING VIEW (Stacked Cards UI) */}
      {view === "reading" && (
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] relative pb-28">
          {/* Top Navigation */}
          <div className="pt-12 px-6 flex items-center justify-between w-full mb-8 relative z-20 max-w-md mx-auto">
            {/* Right side in RTL (Chevron Back) */}
            <button
              onClick={() => setView("categories")}
              className="w-10 h-10 bg-white dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center text-[#1e354d] dark:text-white active:scale-95 transition-transform"
              title="رجوع للأقسام"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[#1e354d] dark:text-white">
                {readingTitle}
              </h1>
              <span className="text-xs text-[#0f8e5d] font-bold">
                {readingData.length} أذكار
              </span>
            </div>

            {/* Left side: View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === "cards" ? "list" : "cards")}
              className="w-10 h-10 bg-white dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center text-[#1e354d] dark:text-white active:scale-95 transition-transform"
              title={viewMode === "cards" ? "عرض كقائمة" : "عرض كبطاقات"}
            >
              {viewMode === "cards" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </button>
          </div>

          {/* Cards Slider Mode */}
          {viewMode === "cards" ? (
            <div className="flex-1 flex flex-col items-center px-6 relative w-full mt-2 max-w-md mx-auto">
              <Swiper
                effect={"cards"}
                grabCursor={true}
                modules={[EffectCards]}
                onSwiper={setSwiperInstance}
                className="w-full h-[60vh] pb-10"
                direction="horizontal"
                dir="rtl"
              >
                {readingData.map((dhikr, index) => {
                  const currentProg = trackerProgress[dhikr.id] || 0;
                  const isDone = currentProg >= dhikr.count;
                  const isFav = favorites.includes(dhikr.id);
                  const isCopied = copiedId === dhikr.id;

                  return (
                    <SwiperSlide
                      key={dhikr.id}
                      className="w-full h-full flex rounded-[40px] overflow-hidden bg-[#1e354d] dark:bg-[#1e293b]"
                    >
                      <div
                        className={`w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col h-full border transition-colors duration-300 relative justify-between ${
                          isDone ? "border-[#0f8e5d]" : "border-[#2a4563] dark:border-[#2d3b4e]"
                        }`}
                      >
                        {/* Top Badge & Favorite */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => toggleFavorite(dhikr.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                              isFav
                                ? "bg-amber-400/20 text-amber-400"
                                : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                            }`}
                            title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${isFav ? "fill-amber-400 text-amber-400 scale-110" : "fill-none stroke-current"}`}
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>

                          <div className="bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                            {index + 1}/{readingData.length}
                          </div>

                          {/* Quick Share */}
                          <button
                            onClick={() => handleShare(dhikr)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                            title="مشاركة"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-2 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          <p className="text-center text-white text-lg md:text-xl font-bold leading-relaxed whitespace-pre-wrap">
                            {dhikr.text.split("\n").map((line: string, i: number) => (
                              <span key={i}>
                                {line}
                                <br />
                              </span>
                            ))}
                          </p>

                          {dhikr.description && (
                            <p className="mt-3 text-center text-white/70 text-xs leading-relaxed max-w-xs">
                              {dhikr.description}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="flex items-center justify-center gap-3 mt-6 mb-2 w-full shrink-0">
                          {/* Counter Tap Button */}
                          <button
                            onClick={() => handleReadingTap(dhikr.id, dhikr.count)}
                            className="relative overflow-hidden bg-transparent border-2 border-[#0f8e5d] text-white flex-1 max-w-[200px] h-14 rounded-full text-base font-bold group active:scale-95 transition-all shadow-md"
                          >
                            <span
                              className="absolute top-0 bottom-0 right-0 bg-[#0f8e5d] transition-all duration-300 opacity-30"
                              style={{ width: `${(currentProg / dhikr.count) * 100}%` }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-1.5">
                              {isDone ? (
                                <>
                                  <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>اكتمل الذكر</span>
                                </>
                              ) : (
                                <span>{currentProg} من {dhikr.count} مرات</span>
                              )}
                            </span>
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(dhikr.text, dhikr.id)}
                            className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center active:scale-95 transition-all"
                            title="نسخ الذكر"
                          >
                            {isCopied ? (
                              <span className="text-emerald-300 text-xs font-bold">✓</span>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            )}
                          </button>

                          {/* Next Card Arrow Button */}
                          <button
                            onClick={() => swiperInstance?.slideNext()}
                            className="w-12 h-12 rounded-full bg-[#0f8e5d] text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
                            title="التالي"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            /* List View Mode */
            <div className="flex flex-col gap-4 py-4 px-6 max-w-lg mx-auto w-full">
              {readingData.map((dhikr, index) => {
                const currentProg = trackerProgress[dhikr.id] || 0;
                const isDone = currentProg >= dhikr.count;
                const isFav = favorites.includes(dhikr.id);
                const isCopied = copiedId === dhikr.id;

                return (
                  <div
                    key={dhikr.id}
                    className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-transparent hover:border-[#4a6b8c]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] text-[#0f8e5d] font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleFavorite(dhikr.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                            isFav
                              ? "bg-amber-400/10 text-amber-500"
                              : "hover:bg-black/5 dark:hover:bg-white/10 text-[#4a6b8c] dark:text-[#8ba7c0]"
                          }`}
                          title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isFav ? "fill-amber-400 text-amber-400 scale-110" : "fill-none stroke-current"}`}
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCopy(dhikr.text, dhikr.id)}
                          className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#4a6b8c] dark:text-[#8ba7c0]"
                          title="نسخ"
                        >
                          {isCopied ? (
                            <span className="text-[#0f8e5d] text-xs font-bold">✓</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-base md:text-lg font-bold text-[#1e354d] dark:text-white leading-loose text-center py-2">
                      {dhikr.text}
                    </p>

                    {dhikr.description && (
                      <p className="text-xs text-center text-[#4a6b8c] dark:text-[#8ba7c0] mb-3">
                        {dhikr.description}
                      </p>
                    )}

                    <div className="flex items-center justify-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                      <button
                        onClick={() => handleReadingTap(dhikr.id, dhikr.count)}
                        className={`px-6 py-2 rounded-full font-bold text-xs transition-all active:scale-95 shadow-sm ${
                          isDone
                            ? "bg-[#0f8e5d] text-white"
                            : "bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white border border-black/5 dark:border-white/10"
                        }`}
                      >
                        {isDone ? "✓ تم إكمال الذكر" : `${currentProg} من ${dhikr.count} مرات`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
