/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import duaCategoriesData from "../../data/dua_categories.json";

interface DuaItem {
  id: string;
  text: string;
  reference?: string;
  description?: string;
}

interface DuaCategory {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: string;
  duas: DuaItem[];
}

export default function DuaPage() {
  const [view, setView] = useState<"categories" | "reading">("categories");
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "quran" | "sunnah" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dua_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  const toggleFavorite = (duaId: string) => {
    const updated = favorites.includes(duaId)
      ? favorites.filter((id) => id !== duaId)
      : [...favorites, duaId];
    setFavorites(updated);
    try {
      localStorage.setItem("dua_favorites", JSON.stringify(updated));
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

  const handleShare = async (dua: DuaItem) => {
    const shareText = `${dua.text}\n\n${dua.reference ? `[${dua.reference}]` : ""}\nتم المشاركة من تطبيق القرآن الكريم والأذكار`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "دعاء مستجاب",
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy(shareText, dua.id);
    }
  };

  const categories = duaCategoriesData as DuaCategory[];

  // Filter categories and search results
  const filteredCategories = useMemo(() => {
    let list = categories;
    if (activeTab === "quran") {
      list = list.filter((c) => c.id === "quran");
    } else if (activeTab === "sunnah") {
      list = list.filter((c) => c.id !== "quran");
    } else if (activeTab === "favorites") {
      // Categories that contain favorited items
      list = list.filter((c) => c.duas.some((d) => favorites.includes(d.id)));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.duas.some(
            (d) =>
              d.text.toLowerCase().includes(query) ||
              (d.description && d.description.toLowerCase().includes(query)) ||
              (d.reference && d.reference.toLowerCase().includes(query))
          )
      );
    }
    return list;
  }, [categories, activeTab, searchQuery, favorites]);

  const handleSelectCategory = (cat: DuaCategory) => {
    setSelectedCategory(cat);
    setCurrentSlideIndex(0);
    setView("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case "quran":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "prophet":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "kaaba":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "safar":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        );
      case "farewell":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      case "istighfar":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case "istikhara":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case "healing":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "relief":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "janazah":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        );
      case "rizq":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-28 transition-colors duration-300"
      dir="rtl"
    >
      {/* 1. CATEGORIES VIEW */}
      {view === "categories" && (
        <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-12 animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-black/5 dark:border-white/10 active:scale-95 transition-transform"
                title="الرجوع للرئيسية"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e354d] dark:text-white">
                  قسم الأدعية
                </h1>
                <p className="text-xs md:text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  أدعية مباركة من القرآن الكريم والسنة النبوية
                </p>
              </div>
            </div>

            {/* Quick Favorites Count */}
            {favorites.length > 0 && (
              <button
                onClick={() => setActiveTab(activeTab === "favorites" ? "all" : "favorites")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "favorites"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-white dark:bg-[#1e293b] text-amber-500 border border-amber-500/20"
                }`}
              >
                <span>⭐</span>
                <span>{favorites.length}</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative mb-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن دعاء أو مناسبة (سفر، شفاء، استخارة...)"
              className="w-full bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white pl-10 pr-11 py-3.5 rounded-2xl text-sm border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0f8e5d] shadow-sm transition-all placeholder:text-[#4a6b8c]/60 dark:placeholder:text-[#8ba7c0]/60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b8c] dark:text-[#8ba7c0] pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === "all"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-black/5 dark:border-white/10"
              }`}
            >
              الكل ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("quran")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === "quran"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-black/5 dark:border-white/10"
              }`}
            >
              📖 أدعية من القرآن
            </button>
            <button
              onClick={() => setActiveTab("sunnah")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === "sunnah"
                  ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-black/5 dark:border-white/10"
              }`}
            >
              🕌 الأدعية النبوية
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === "favorites"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-black/5 dark:border-white/10"
              }`}
            >
              ⭐ المفضلة ({favorites.length})
            </button>
          </div>

          {/* Categories List (matching user reference design) */}
          <div className="flex flex-col gap-3">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className="w-full bg-[#182826] dark:bg-[#132220] md:bg-white md:dark:bg-[#1e293b] text-white md:text-[#1e354d] md:dark:text-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between transition-all active:scale-[0.98] border border-white/5 md:border-black/5 md:dark:border-white/10 hover:border-[#0f8e5d]/40 group"
              >
                {/* Right side: Icon + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#203936] dark:bg-[#1b2d2b] md:bg-[#f4f7f9] md:dark:bg-[#0f172a] flex items-center justify-center text-[#4ade80] md:text-[#0f8e5d] dark:text-[#4ade80] group-hover:scale-105 transition-transform">
                    {renderCategoryIcon(cat.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-lg md:text-xl font-bold block">
                      {cat.title}
                    </span>
                    <span className="text-xs text-white/60 md:text-[#4a6b8c] md:dark:text-[#8ba7c0] mt-0.5 block">
                      {cat.duas.length} أدعية • {cat.description}
                    </span>
                  </div>
                </div>

                {/* Left side: Chevron arrow */}
                <div className="text-white/40 md:text-black/30 md:dark:text-white/40 group-hover:text-white md:group-hover:text-[#0f8e5d] group-hover:-translate-x-1 transition-all pl-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              </button>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-black/5 dark:border-white/10">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="font-bold text-lg">لم يتم العثور على أي أدعية</p>
                <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">
                  جرب البحث بكلمة أخرى أو إلغاء التصفية
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                  className="mt-4 px-4 py-2 bg-[#0f8e5d] text-white rounded-xl text-sm font-bold shadow-md"
                >
                  عرض جميع الأدعية
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. READING MODE VIEW */}
      {view === "reading" && selectedCategory && (
        <div className="min-h-screen flex flex-col justify-between max-w-xl mx-auto px-5 pt-8 animate-fade-in">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4">
            {/* View Mode Toggle & Favorites */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "cards" ? "list" : "cards")}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-black/5 dark:border-white/10 active:scale-95 transition-transform"
                title={viewMode === "cards" ? "عرض كقائمة" : "عرض كبطاقات"}
              >
                {viewMode === "cards" ? (
                  // List icon
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  // Cards icon
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </button>
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-[#1e354d] dark:text-white">
                {selectedCategory.title}
              </h2>
              <span className="text-xs text-[#0f8e5d] font-bold">
                {selectedCategory.duas.length} أدعية مباركة
              </span>
            </div>

            {/* Back Button on Right (RTL standard) */}
            <button
              onClick={() => setView("categories")}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-black/5 dark:border-white/10 active:scale-95 transition-transform"
              title="رجوع للأقسام"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Cards Slider Mode */}
          {viewMode === "cards" ? (
            <div className="flex-1 flex flex-col justify-center my-auto py-2">
              <div className="w-full max-w-[340px] md:max-w-[400px] mx-auto min-h-[480px]">
                <Swiper
                  effect={"cards"}
                  grabCursor={true}
                  modules={[EffectCards]}
                  className="w-full h-full py-4"
                  onSwiper={setSwiperInstance}
                  onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
                >
                  {selectedCategory.duas.map((dua, index) => {
                    const isFav = favorites.includes(dua.id);
                    const isCopied = copiedId === dua.id;

                    return (
                      <SwiperSlide
                        key={dua.id}
                        className="rounded-[36px] overflow-hidden bg-[#162725] dark:bg-[#142322] md:bg-[#1b2d3d] md:dark:bg-[#1e293b] text-white shadow-2xl border border-white/10"
                      >
                        <div className="flex flex-col justify-between h-[480px] p-6 relative select-none">
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleFavorite(dua.id)}
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-90"
                              title="إضافة للمفضلة"
                            >
                              <span className="text-base">{isFav ? "⭐" : "☆"}</span>
                            </button>

                            <div className="bg-[#0f8e5d] text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                              {index + 1} / {selectedCategory.duas.length}
                            </div>
                          </div>

                          {/* Card Body - Arabic Text */}
                          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-2 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <p className="text-center text-white text-lg md:text-xl font-bold leading-loose whitespace-pre-wrap">
                              {dua.text}
                            </p>

                            {/* Reference / Takhrij */}
                            {dua.reference && (
                              <div className="mt-4 px-3 py-1 rounded-lg bg-white/10 text-emerald-300 text-xs font-semibold">
                                {dua.reference}
                              </div>
                            )}

                            {/* Virtue / Description */}
                            {dua.description && (
                              <p className="mt-2 text-center text-white/70 text-xs leading-relaxed max-w-xs">
                                ({dua.description})
                              </p>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(dua.text, dua.id)}
                              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                isCopied
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white/10 hover:bg-white/15 text-white"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>تم النسخ</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                  <span>نسخ الدعاء</span>
                                </>
                              )}
                            </button>

                            {/* Share button */}
                            <button
                              onClick={() => handleShare(dua)}
                              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                              title="مشاركة الدعاء"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                              </svg>
                              <span>مشاركة</span>
                            </button>

                            {/* Next Slide Arrow Button */}
                            {index < selectedCategory.duas.length - 1 && (
                              <button
                                onClick={() => swiperInstance?.slideNext()}
                                className="w-9 h-9 rounded-xl bg-[#0f8e5d] text-white flex items-center justify-center active:scale-90 transition-transform"
                                title="التالي"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>

              {/* Slider Dots / Progress indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {selectedCategory.duas.slice(0, 10).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentSlideIndex % 10
                        ? "w-6 bg-[#0f8e5d]"
                        : "w-1.5 bg-black/20 dark:bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* List View Mode */
            <div className="flex flex-col gap-4 py-4">
              {selectedCategory.duas.map((dua, index) => {
                const isFav = favorites.includes(dua.id);
                const isCopied = copiedId === dua.id;

                return (
                  <div
                    key={dua.id}
                    className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl md:rounded-3xl shadow-sm border border-black/5 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-7 h-7 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] text-[#0f8e5d] font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(dua.id)}
                          className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-sm"
                          title="إضافة للمفضلة"
                        >
                          {isFav ? "⭐" : "☆"}
                        </button>
                        <button
                          onClick={() => handleCopy(dua.text, dua.id)}
                          className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#4a6b8c] dark:text-[#8ba7c0]"
                          title="نسخ"
                        >
                          {isCopied ? "✓" : (
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
                      {dua.text}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-[#4a6b8c] dark:text-[#8ba7c0]">
                      {dua.reference && (
                        <span className="font-semibold text-[#0f8e5d]">
                          {dua.reference}
                        </span>
                      )}
                      {dua.description && (
                        <span className="italic">
                          ({dua.description})
                        </span>
                      )}
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
