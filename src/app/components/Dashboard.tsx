/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
}

interface HijriDate {
  day: string;
  month: { en: string; ar: string };
  year: string;
}

export default function Dashboard() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [locationName, setLocationName] = useState("جاري تحديد الموقع...");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 21.4225, lng: 39.8262 });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [showTasbihModal, setShowTasbihModal] = useState(false);
  const [showQiblaModal, setShowQiblaModal] = useState(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const radioRef = useRef<HTMLAudioElement | null>(null);

  // Tasbih Counter State
  const [tasbihCount, setTasbihCount] = useState(0);
  const [selectedZikr, setSelectedZikr] = useState("سبحان الله");

  // Last Read from LocalStorage
  const [lastRead, setLastRead] = useState({
    surahId: 8,
    surahName: "الأنفال",
    page: 177,
    progress: 45,
  });

  // Prayer status check
  const [prayedStatus, setPrayedStatus] = useState<Record<string, boolean>>({
    "الفجر": false,
    "الظهر": false,
    "العصر": false,
    "المغرب": false,
    "العشاء": false,
  });

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };

  const format12Hour = (time24: string) => {
    if (!time24) return "--:--";
    const [hStr, mStr] = time24.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr ? mStr.substring(0, 2) : "00";
    const period = h >= 12 ? "م" : "ص";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  };

  const getPrayerDayId = () => {
    const now = new Date();
    if (!timings) return now.toDateString();
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const fajrMinutes = parseTime(timings.Fajr);
    
    if (currentMinutes < fajrMinutes) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toDateString();
    }
    return now.toDateString();
  };

  const togglePrayed = (prayerName: string) => {
    setPrayedStatus((prev) => {
      const updated = { ...prev, [prayerName]: !prev[prayerName] };
      try {
        localStorage.setItem("prayedStatus", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast(`تم تحديث حالة صلاة ${prayerName}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const fetchPrayerData = async (lat: number = 21.4225, lng: number = 39.8262) => {
    try {
      setUserCoords({ lat, lng });
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await res.json();
      
      const t = data.data.timings;
      setTimings({
        Fajr: t.Fajr,
        Sunrise: t.Sunrise,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
        Midnight: t.Midnight || "23:45",
      });
      
      setHijri({
        day: data.data.date.hijri.day,
        month: data.data.date.hijri.month,
        year: data.data.date.hijri.year,
      });

      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
      const geoData = await geoRes.json();
      if (geoData.city && geoData.countryName) {
        setLocationName(`${geoData.city}، ${geoData.countryName}`);
      } else {
        setLocationName("مكة المكرمة، السعودية");
      }
    } catch (e) {
      console.error(e);
      setLocationName("مكة المكرمة، السعودية");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchPrayerData(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchPrayerData(); 
        }
      );
    } else {
      fetchPrayerData();
    }

    // Load last read
    try {
      const savedRead = localStorage.getItem("quran_last_read");
      if (savedRead) {
        setLastRead(JSON.parse(savedRead));
      }
    } catch {
      // ignore
    }

    return () => clearInterval(timer);
  }, []);

  // Prayer status persistence
  useEffect(() => {
    if (!timings) return;
    try {
      const prayerDayId = getPrayerDayId();
      const savedStatus = localStorage.getItem("prayedStatus");
      const savedDayId = localStorage.getItem("prayerDayId");
      
      if (savedStatus && savedDayId === prayerDayId) {
        setPrayedStatus(JSON.parse(savedStatus));
      } else {
        const fresh = { "الفجر": false, "الظهر": false, "العصر": false, "المغرب": false, "العشاء": false };
        setPrayedStatus(fresh);
        localStorage.setItem("prayerDayId", prayerDayId);
        localStorage.setItem("prayedStatus", JSON.stringify(fresh));
      }
    } catch {
      // ignore
    }
  }, [timings]);

  // Next prayer and countdown calculation
  const getNextPrayerData = () => {
    if (!timings) {
      return {
        name: "...",
        time: "",
        formatted12: "--:--",
        countdownHMS: "00:00:00",
        countdownText: "...",
        countdownBadgeText: "...",
        remainingHours: 1,
      };
    }

    const now = currentTime;
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const parseSeconds = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(":");
      return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60;
    };

    const prayerSchedule = [
      { name: "الفجر", time: timings.Fajr, secs: parseSeconds(timings.Fajr) },
      { name: "الظهر", time: timings.Dhuhr, secs: parseSeconds(timings.Dhuhr) },
      { name: "العصر", time: timings.Asr, secs: parseSeconds(timings.Asr) },
      { name: "المغرب", time: timings.Maghrib, secs: parseSeconds(timings.Maghrib) },
      { name: "العشاء", time: timings.Isha, secs: parseSeconds(timings.Isha) },
    ];

    let next = prayerSchedule.find((p) => p.secs > currentSeconds);
    let diffSecs = 0;
    if (!next) {
      next = prayerSchedule[0];
      diffSecs = 24 * 3600 - currentSeconds + next.secs;
    } else {
      diffSecs = next.secs - currentSeconds;
    }

    const h = Math.floor(diffSecs / 3600);
    const m = Math.floor((diffSecs % 3600) / 60);
    const s = diffSecs % 60;

    const hStr = h.toString().padStart(2, "0");
    const mStr = m.toString().padStart(2, "0");
    const sStr = s.toString().padStart(2, "0");

    const countdownHMS = `${hStr}:${mStr}:${sStr}`;
    
    let countdownBadgeText = "";
    if (h > 0) {
      if (m > 0) {
        countdownBadgeText = h === 1 ? `ساعة و${m} د` : `${h} س و${m} د`;
      } else {
        countdownBadgeText = `${h} ساعة`;
      }
    } else {
      countdownBadgeText = `${m} دقيقة`;
    }

    return {
      name: next.name,
      time: next.time,
      formatted12: format12Hour(next.time),
      countdownHMS,
      countdownText: countdownBadgeText,
      countdownBadgeText,
      remainingHours: h || 1,
    };
  };

  const nextPrayer = getNextPrayerData();

  // Helper to render accurate Flaticon prayer icons
  const renderPrayerIcon = (prayerName: string, isHighlighted: boolean = false) => {
    const iconClass = isHighlighted
      ? "w-5 h-5 object-contain brightness-0 opacity-85 transition-all"
      : "w-5 h-5 object-contain opacity-80 dark:invert transition-all";

    switch (prayerName) {
      case "الفجر":
        return (
          <Image
            src="/icons/prayer/shines.svg"
            alt="الفجر"
            width={20}
            height={20}
            className={iconClass}
          />
        );
      case "الشروق":
        return (
          <Image
            src="/icons/prayer/sunrise.png"
            alt="الشروق"
            width={20}
            height={20}
            className={iconClass}
          />
        );
      case "الظهر":
        return (
          <Image
            src="/icons/prayer/dhuhr.png"
            alt="الظهر"
            width={20}
            height={20}
            className={iconClass}
          />
        );
      case "العصر":
        return (
          <Image
            src="/icons/prayer/asr.png"
            alt="العصر"
            width={20}
            height={20}
            className={iconClass}
          />
        );
      case "المغرب":
        return (
          <Image
            src="/icons/prayer/maghrib.png"
            alt="المغرب"
            width={20}
            height={20}
            className={iconClass}
          />
        );
      case "العشاء":
      case "منتصف الليل":
        return (
          <Image
            src="/icons/prayer/isha.png"
            alt={prayerName}
            width={20}
            height={20}
            className={iconClass}
          />
        );
      default:
        return null;
    }
  };

  // Helper to format or fetch time for any of the 7 daily prayer timeline slots
  const getPrayerTime = (name: string) => {
    if (!timings) {
      switch (name) {
        case "الفجر": return "5:17 ص";
        case "الشروق": return "6:38 ص";
        case "الظهر": return "12:24 م";
        case "العصر": return "3:39 م";
        case "المغرب": return "6:08 م";
        case "العشاء": return "7:25 م";
        case "منتصف الليل": return "11:43 م";
        default: return "--:--";
      }
    }
    switch (name) {
      case "الفجر": return format12Hour(timings.Fajr);
      case "الشروق": return format12Hour(timings.Sunrise);
      case "الظهر": return format12Hour(timings.Dhuhr);
      case "العصر": return format12Hour(timings.Asr);
      case "المغرب": return format12Hour(timings.Maghrib);
      case "العشاء": return format12Hour(timings.Isha);
      case "منتصف الليل": return format12Hour(timings.Midnight || "23:43");
      default: return "--:--";
    }
  };

  // Determine card distribution between Row 1 and Row 2
  // Total 7 cards across 2 rows of 4 columns:
  // Whichever row contains the active extended card (col-span-2) has 3 cards (2 + 1 + 1 = 4 cols)
  // The other row has 4 normal cards (1 + 1 + 1 + 1 = 4 cols)
  const getPrayerRows = () => {
    const isRow1Active = ["الفجر", "الشروق", "الظهر"].includes(nextPrayer.name);

    if (isRow1Active) {
      return {
        row1: ["الفجر", "الشروق", "الظهر"],
        row2: ["العصر", "المغرب", "العشاء", "منتصف الليل"],
      };
    } else if (nextPrayer.name === "العصر") {
      return {
        row1: ["الفجر", "الشروق", "الظهر", "منتصف الليل"],
        row2: ["العصر", "المغرب", "العشاء"],
      };
    } else {
      return {
        row1: ["الفجر", "الشروق", "الظهر", "العصر"],
        row2: ["المغرب", "العشاء", "منتصف الليل"],
      };
    }
  };

  // Render individual prayer card (extends to col-span-2 with countdown if it's the upcoming prayer)
  const renderPrayerCard = (name: string) => {
    const isExtended = name === nextPrayer.name;

    if (isExtended) {
      return (
        <div
          key={name}
          onClick={() => togglePrayed(name)}
          className="col-span-2 bg-[#cbf4dc] dark:bg-[#cbf4dc] text-[#065f46] p-3 rounded-2xl border border-[#0f8e5d]/30 shadow-sm flex items-center justify-between cursor-pointer select-none transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {/* Right side (RTL start): Icon, Prayer Name, and Scheduled Time */}
          <div className="flex flex-col items-center justify-center min-w-[65px] px-1">
            <div className="mb-1 text-[#065f46]">
              {renderPrayerIcon(name, true)}
            </div>
            <span className="text-xs font-bold text-[#065f46] block text-center">
              {name}
            </span>
            <span className="text-xs font-black text-[#065f46] block mt-0.5" dir="ltr">
              {getPrayerTime(name)}
            </span>
          </div>

          {/* Left side (RTL end): Remaining Time Label and Live Countdown */}
          <div className="flex flex-col items-center justify-center pl-2 pr-1">
            <span className="text-[11px] font-bold text-[#065f46]/80 block text-center mb-1">
              تبقى على الأذان
            </span>
            <span className="text-lg md:text-xl font-black text-[#065f46] tracking-wider font-mono block text-center" dir="ltr">
              {nextPrayer.countdownHMS}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={name}
        onClick={() => togglePrayed(name)}
        className={`bg-white dark:bg-[#1e293b] p-3 rounded-2xl border text-center transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
          prayedStatus[name]
            ? "border-[#0f8e5d] bg-[#0f8e5d]/5"
            : "border-black/5 dark:border-white/5 hover:border-[#0f8e5d]/30"
        }`}
      >
        <div className="flex justify-center mb-1 text-[#4a6b8c] dark:text-[#8ba7c0]">
          {renderPrayerIcon(name, false)}
        </div>
        <span className="block text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0]">
          {name}
        </span>
        <span className="block text-xs font-extrabold text-[#1e354d] dark:text-white mt-1" dir="ltr">
          {getPrayerTime(name)}
        </span>
      </div>
    );
  };

  // Helper for rendering Daily App and Quran icons matching user's Flaticon links
  const renderDailyIcon = (name: "tasbih" | "qibla" | "shalat" | "play" | "islam", className: string = "w-7 h-7") => {
    return (
      <span
        className={`inline-block bg-current shrink-0 ${className}`}
        style={{
          maskImage: `url('/icons/daily/${name}.png')`,
          WebkitMaskImage: `url('/icons/daily/${name}.png')`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
        aria-hidden="true"
      />
    );
  };

  // Determine dynamic event, greeting, and suggested action based on time of day
  const getTimeEventInfo = () => {
    const now = currentTime;
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const parseMin = (t?: string) => {
      if (!t) return null;
      const [h, m] = t.split(":");
      return parseInt(h, 10) * 60 + parseInt(m, 10);
    };

    const fajrMin = timings ? parseMin(timings.Fajr) : 5 * 60 + 17; // ~05:17
    const dhuhrMin = timings ? parseMin(timings.Dhuhr) : 12 * 60 + 24; // ~12:24
    const asrMin = timings ? parseMin(timings.Asr) : 15 * 60 + 39; // ~15:39
    const ishaMin = timings ? parseMin(timings.Isha) : 19 * 60 + 25; // ~19:25

    // Boundaries matching reference screenshots:
    // 1. Morning (أذكار الصباح): from (Fajr - 30 min) up to Dhuhr (~04:47 to 12:24)
    // 2. Afternoon (التسبيح والمسبحة): from Dhuhr up to (Asr + 30 min) (~12:24 to 16:10)
    // 3. Evening (أذكار المساء): from (Asr + 30 min) up to (Isha + 90 min) (~16:10 to 21:00)
    // 4. Night (أذكار النوم): from (Isha + 90 min) until (Fajr - 30 min) (~21:00 to 04:47)

    const morningStart = (fajrMin ?? 317) - 30;
    const morningEnd = dhuhrMin ?? 744;
    const afternoonStart = morningEnd;
    const afternoonEnd = (asrMin ?? 939) + 30;
    const eveningStart = afternoonEnd;
    const eveningEnd = (ishaMin ?? 1165) + 90;

    if (currentMins >= morningStart && currentMins < morningEnd) {
      return {
        title: "صباح الخير",
        icon: "☀️",
        buttonText: "اقرأ أذكار الصباح",
        category: "morning",
        href: "/dhikr?category=morning",
      };
    } else if (currentMins >= afternoonStart && currentMins < afternoonEnd) {
      return {
        title: "وقت مبارك",
        icon: "📿",
        buttonText: "لنُسبح الله",
        category: "tasbeeh",
        href: "/dhikr?category=tasbeeh",
      };
    } else if (currentMins >= eveningStart && currentMins < eveningEnd) {
      return {
        title: "حبينا نذكرك",
        icon: "⛅",
        buttonText: "اقرأ أذكار المساء",
        category: "evening",
        href: "/dhikr?category=evening",
      };
    } else {
      return {
        title: "طابت ليلتك",
        icon: "🌙",
        buttonText: "اقرأ أذكار النوم",
        category: "sleep",
        href: "/dhikr?category=sleep",
      };
    }
  };

  const timeEvent = getTimeEventInfo();

  // Calculate Qibla angle from user coordinates
  const calculateQibla = () => {
    const lat1 = (userCoords.lat * Math.PI) / 180;
    const lng1 = (userCoords.lng * Math.PI) / 180;
    const lat2 = (21.4225 * Math.PI) / 180; // Mecca
    const lng2 = (39.8262 * Math.PI) / 180;

    const dLng = lng2 - lng1;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    angle = (angle + 360) % 360;
    return Math.round(angle);
  };

  const toggleRadio = () => {
    if (!radioRef.current) return;
    if (isRadioPlaying) {
      radioRef.current.pause();
      setIsRadioPlaying(false);
      showToast("تم إيقاف البث المباشر");
    } else {
      radioRef.current.play().then(() => {
        setIsRadioPlaying(true);
        showToast("جاري تشغيل إذاعة القرآن الكريم مباشرة 📻");
      }).catch(() => {
        showToast("تعذر تشغيل البث المباشر");
      });
    }
  };

  const copyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast("تم النسخ بنجاح ✓");
    }
  };

  const DAY_NAMES_TASHKEEL: Record<string, string> = {
    "الأحد": "الأَحَدُ",
    "الاثنين": "الإِثْنَيْنِ",
    "الإثنين": "الإِثْنَيْنِ",
    "الثلاثاء": "الثُّلاَثَاءُ",
    "الأربعاء": "الأَرْبِعَاءُ",
    "الخميس": "الخَمِيسُ",
    "الجمعة": "الجُمُعَةُ",
    "السبت": "السَّبْتُ",
  };
  const rawDayName = currentTime.toLocaleDateString("ar-EG", { weekday: "long" });
  const dayName = DAY_NAMES_TASHKEEL[rawDayName] || rawDayName;
  const gregorianDay = currentTime.getDate();
  const gregorianMonthName = currentTime.toLocaleDateString("ar-EG", { month: "long" });
  const gregorianYear = currentTime.getFullYear();

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white pb-32 pt-4 px-4 md:px-6 transition-colors" dir="rtl">
      <div className="max-w-md md:max-w-xl mx-auto space-y-6">

        {/* ============================================================== */}
        {/* 1. TOP HEADER                                                  */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between pt-2">
          {/* Action Icons on the left (in RTL) */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/surahs"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-black/5 dark:border-white/5 hover:border-[#0f8e5d]/30 active:scale-95 transition-all"
              title="البحث"
            >
              <svg className="w-5 h-5 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              href="/dua?tab=favorites"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-black/5 dark:border-white/5 hover:border-[#0f8e5d]/30 active:scale-95 transition-all"
              title="المحفوظات"
            >
              <svg className="w-5 h-5 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>

            <button
              onClick={() => showToast("حسابك الشخصي نشط بفضل الله")}
              className="w-10 h-10 rounded-full bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 flex items-center justify-center text-[#0f8e5d] dark:text-[#4ade80] shadow-sm border border-black/5 dark:border-white/5 active:scale-95 transition-all"
              title="الملف الشخصي"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e354d] dark:text-white">
            الرئيسية
          </h1>
        </div>

        {/* ============================================================== */}
        {/* 2. HERO REMINDER & DATE CARDS (Side by Side)                   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-[1.2fr_1fr] sm:grid-cols-[1.25fr_1fr] gap-3.5 sm:gap-4 items-stretch">
          
          {/* Right Column: Dynamic Action Area (Borderless, clean, exactly as in screenshot) */}
          <div className="flex flex-col justify-between py-1 px-1">
            {/* Header: Title + Weather/Tasbeeh Icon */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-[#1e354d] dark:text-[#d1fae5] tracking-tight">
                {timeEvent.title}
              </span>
              <div className="flex items-center justify-center">
                {timeEvent.category === "tasbeeh" ? (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 32 32" fill="none">
                    {/* Heart shaped tasbeeh beads matching screenshot */}
                    <path
                      d="M16 23C16 23 7 17.5 5 11.5C3.5 5.5 9.5 2.5 13.5 6.5L16 9L18.5 6.5C22.5 2.5 28.5 5.5 27 11.5C25 17.5 16 23 16 23Z"
                      stroke="#f472b6"
                      strokeWidth="2.5"
                      strokeDasharray="2 3"
                      strokeLinecap="round"
                    />
                    {/* Tassel */}
                    <path d="M16 23V26.5M14 26.5H18M14.5 26.5L13 30.5M16 26.5V31M17.5 26.5L19 30.5" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-2xl select-none" aria-hidden="true">
                    {timeEvent.icon}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Dark Glass Capsule Button */}
            <div className="my-auto py-2">
              <Link
                href={timeEvent.href}
                className="block w-full text-center py-2.5 sm:py-3 px-4 rounded-full bg-[#1e354d] dark:bg-[#121c17] text-white hover:bg-[#0f8e5d] dark:hover:bg-[#1c2e25] border border-black/10 dark:border-white/10 shadow-sm text-xs sm:text-sm font-bold active:scale-[0.98] transition-all"
              >
                {timeEvent.buttonText}
              </Link>
            </div>

            {/* Bottom Row: Mosque Icon + Prayer Name + Lime Green Countdown Badge */}
            <div className="flex items-center justify-between gap-1.5 pb-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-[#121c17] border border-black/5 dark:border-white/10 flex items-center justify-center text-[#65a30d] dark:text-[#a3e635] shrink-0 shadow-sm">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-.4 0-.8.2-1 .6L9.6 5H6c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1h-3.6l-1.4-2.4c-.2-.4-.6-.6-1-.6zm0 2.2l1 1.8h-2l1-1.8zM7 7h10v13H7V7zm5 4c-1.7 0-3 1.3-3 3v6h6v-6c0-1.7-1.3-3-3-3zm0 2c.6 0 1 .4 1 1v4h-2v-4c0-.6.4-1 1-1z" />
                  </svg>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] whitespace-nowrap">
                  صلاة {nextPrayer.name} بعد :
                </span>
              </div>

              <span className="bg-[#65a30d] dark:bg-[#74a548] text-white px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold shadow-sm shrink-0 whitespace-nowrap font-mono" dir="ltr">
                {nextPrayer.countdownBadgeText}
              </span>
            </div>
          </div>

          {/* Left Column: Date Card (Dark distinct box with pale mint calligraphy day name) */}
          <div className="bg-white dark:bg-[#121c17] p-3.5 sm:p-4 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-between text-center relative overflow-hidden transition-all">
            <div className="pt-0.5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f8e5d] dark:text-[#a7f3d0] leading-none mb-3" style={{ fontFamily: 'var(--font-amiri)' }}>
                {dayName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-1 border-t border-black/5 dark:border-white/10 pt-2.5">
              {/* Hijri */}
              <div className="text-center px-0.5">
                <span className="block text-[10px] sm:text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold leading-tight truncate">
                  {hijri ? hijri.month.ar : "جمادى الأولى"}
                </span>
                <span className="block text-xl sm:text-2xl font-black text-[#1e354d] dark:text-white my-1 font-mono sm:font-sans">
                  {hijri ? hijri.day : "1"}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold">
                  {hijri ? hijri.year : "1448"}
                </span>
              </div>

              {/* Gregorian */}
              <div className="text-center border-r border-black/5 dark:border-white/10 px-0.5">
                <span className="block text-[10px] sm:text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold leading-tight truncate">
                  {gregorianMonthName}
                </span>
                <span className="block text-xl sm:text-2xl font-black text-[#1e354d] dark:text-white my-1 font-mono sm:font-sans">
                  {gregorianDay}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold">
                  {gregorianYear}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* 3. PRAYER TIMES SECTION WITH REQUESTED FLATICON ICONS           */}
        {/* ============================================================== */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-[#1e354d] dark:text-white">
              أوقات الصلاة
            </h2>
            <div className="flex items-center gap-1 text-xs text-[#4a6b8c] dark:text-[#8ba7c0] font-medium">
              <svg className="w-3.5 h-3.5 text-[#0f8e5d] dark:text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{locationName}</span>
            </div>
          </div>

          {/* Prayer Cards Grid: Dynamic 2 rows of 4 columns, active prayer card extends to col-span-2 with live countdown */}
          <div className="grid grid-cols-4 gap-2.5">
            {getPrayerRows().row1.map((name) => renderPrayerCard(name))}
            {getPrayerRows().row2.map((name) => renderPrayerCard(name))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. "تطبيقاتك اليومية" (Your Daily Apps / Quick Access)           */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-[#1e354d] dark:text-white">
              تطبيقاتك اليومية
            </h2>
            <button 
              onClick={() => showToast("جميع التطبيقات اليومية مفعلة")}
              className="flex items-center gap-1 text-xs text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#0f8e5d] transition-colors"
            >
              <span>تخصيص</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          {/* Circular Apps Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* 1. Tasbih (tasbih_4939058) */}
            <button
              onClick={() => setShowTasbihModal(true)}
              className="flex flex-col items-center gap-2 group shrink-0 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-full bg-[#e8efe9] dark:bg-[#203126] text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                {renderDailyIcon("tasbih", "w-7 h-7")}
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white group-hover:text-[#0f8e5d] transition-colors">
                المسبحة
              </span>
            </button>

            {/* 2. Qibla (qibla_4434397) */}
            <button
              onClick={() => setShowQiblaModal(true)}
              className="flex flex-col items-center gap-2 group shrink-0 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-full bg-[#f1ebf7] dark:bg-[#2d2238] text-[#9333ea] dark:text-[#c084fc] flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                {renderDailyIcon("qibla", "w-7 h-7")}
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white group-hover:text-[#9333ea] transition-colors">
                اتجاه القبلة
              </span>
            </button>

            {/* 3. Dhikr after Prayer (shalat_4358949) */}
            <Link
              href="/dhikr"
              className="flex flex-col items-center gap-2 group shrink-0 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-full bg-[#e8f2ea] dark:bg-[#1a3324] text-[#16a34a] dark:text-[#4ade80] flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                {renderDailyIcon("shalat", "w-7 h-7")}
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white group-hover:text-[#16a34a] transition-colors text-center leading-tight">
                أذكار بعد الصلاة
              </span>
            </Link>

            {/* 4. Live Radio (play_15464933) */}
            <button
              onClick={toggleRadio}
              className="flex flex-col items-center gap-2 group shrink-0 min-w-[72px]"
            >
              <div className={`w-16 h-16 rounded-full ${isRadioPlaying ? 'bg-[#ef4444] text-white animate-pulse' : 'bg-[#faeaeb] dark:bg-[#382024] text-[#e11d48] dark:text-[#fb7185]'} flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all`}>
                {isRadioPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  renderDailyIcon("play", "w-7 h-7")
                )}
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white group-hover:text-[#e11d48] transition-colors text-center leading-tight">
                {isRadioPlaying ? "إيقاف البث" : "البث المباشر"}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. "متابعة المصحف من حيث توقفت" (Last Read Card)                 */}
        {/* ============================================================== */}
        <Link
          href={`/surah/${lastRead.surahId}`}
          className="block bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm hover:border-[#0f8e5d]/30 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Right: Circular Quran Emblem (islam_7342926) */}
            <div className="w-14 h-14 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {renderDailyIcon("islam", "w-8 h-8")}
            </div>

            {/* Center: Info */}
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1e354d] dark:text-white">
                متابعة المصحف من حيث توقفت
              </span>
              <span className="block text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                سورة {lastRead.surahName} - الصفحة {lastRead.page}
              </span>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-[#0f8e5d] dark:bg-[#4ade80] rounded-full"
                  style={{ width: `${lastRead.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Left: Chevron */}
            <div className="w-9 h-9 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] dark:text-[#8ba7c0] group-hover:text-[#0f8e5d] transition-colors">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* ============================================================== */}
        {/* 6. "أنشطتك الأخيرة" (Recent Activities Chips)                   */}
        {/* ============================================================== */}
        <div>
          <h2 className="text-lg font-bold text-[#1e354d] dark:text-white mb-3 px-1">
            أنشطتك الأخيرة
          </h2>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {/* Chip 1: Tasbih */}
            <button
              onClick={() => setShowTasbihModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#e0e7ff] dark:bg-[#1e2540] text-[#4338ca] dark:text-[#a5b4fc] text-xs font-bold shrink-0 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {renderDailyIcon("tasbih", "w-4 h-4")}
              <span>السبحة الإلكترونية</span>
            </button>

            {/* Chip 2: Dua */}
            <Link
              href="/dua"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#fce7f3] dark:bg-[#381e2b] text-[#be185d] dark:text-[#f472b6] text-xs font-bold shrink-0 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {renderDailyIcon("islam", "w-4 h-4")}
              <span>أدعية من القرآن</span>
            </Link>

            {/* Chip 3: Morning Dhikr */}
            <Link
              href="/dhikr"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#fef3c7] dark:bg-[#3b2d18] text-[#b45309] dark:text-[#fcd34d] text-xs font-bold shrink-0 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707" />
              </svg>
              <span>أذكار الصباح</span>
            </Link>

            {/* Chip 4: Evening Dhikr */}
            <Link
              href="/dhikr"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#dcfce7] dark:bg-[#183324] text-[#15803d] dark:text-[#86efac] text-xs font-bold shrink-0 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>أذكار المساء</span>
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 7. FEATURED INSPIRATION BANNER                                 */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-l from-[#0f8e5d] via-[#10b981] to-[#0d9488] p-5 rounded-3xl text-white shadow-md relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10 max-w-[70%]">
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5 backdrop-blur-sm">
              مكتبة الفتاوى والعلوم
            </span>
            <h3 className="text-base md:text-lg font-extrabold mb-1">
              ابحث في فتاوى كبار العلماء
            </h3>
            <p className="text-xs text-white/80 mb-3 leading-relaxed">
              إجابات فقهية وفتاوى شرعية موثوقة لمختلف أمور الحياة اليومية
            </p>
            <Link
              href="/dua"
              className="inline-block px-4 py-2 bg-white text-[#0f8e5d] rounded-full text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-sm"
            >
              تصفح الفتاوى والدروس
            </Link>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 8. THREE DAILY STACKED CARDS (آية، حديث، دعاء)                */}
        {/* ============================================================== */}
        <div className="space-y-4">
          
          {/* 8.1. آية اليوم */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              {/* Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] text-xs font-bold">
                {renderDailyIcon("islam", "w-3.5 h-3.5")}
                <span>آية اليوم</span>
              </div>

              {/* Copy / Share button */}
              <button
                onClick={() => copyText("قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ [الزمر: 53]")}
                className="w-8 h-8 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-[#0f8e5d] transition-colors"
                title="نسخ الآية"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <p className="text-xl md:text-2xl font-quran text-center leading-[2] text-[#1e354d] dark:text-white my-2 px-2" style={{ fontFamily: 'var(--font-amiri-quran)' }}>
              قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ ﴿٥٣﴾
            </p>

            <span className="block text-center text-xs text-[#0f8e5d] dark:text-[#4ade80] font-bold mt-3">
              سورة الزمر: 53
            </span>
          </div>

          {/* 8.2. حديث اليوم */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] text-xs font-bold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>حديث اليوم</span>
              </div>

              <button
                onClick={() => copyText("قَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «يَسِّرُوا وَلَا تُعَسِّرُوا، وَسَكِّنُوا وَلَا تُنَفِّرُوا». [صحيح البخاري]")}
                className="w-8 h-8 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-[#0f8e5d] transition-colors"
                title="نسخ الحديث"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <p className="text-base md:text-lg text-center leading-relaxed font-bold text-[#1e354d] dark:text-white my-2 px-2" style={{ fontFamily: 'var(--font-amiri)' }}>
              قَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «يَسِّرُوا وَلَا تُعَسِّرُوا، وَسَكِّنُوا وَلَا تُنَفِّرُوا».
            </p>

            <span className="block text-center text-xs text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold mt-3">
              رواه البخاري ومسلم
            </span>
          </div>

          {/* 8.3. دعاء اليوم */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] text-xs font-bold">
                {renderDailyIcon("shalat", "w-3.5 h-3.5")}
                <span>دعاء اليوم</span>
              </div>

              <button
                onClick={() => copyText("رب أسألك توبة تجب ما قبلها من الذنوب وتصلح ما بعدها من الأعمال.")}
                className="w-8 h-8 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-[#0f8e5d] transition-colors"
                title="نسخ الدعاء"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <p className="text-base md:text-lg text-center leading-relaxed font-bold text-[#1e354d] dark:text-white my-2 px-2" style={{ fontFamily: 'var(--font-amiri)' }}>
              «رَبِّ أَسْأَلُكَ تَوْبَةً تَجُبُّ مَا قَبْلَهَا مِنَ الذُّنُوبِ، وَتُصْلِحُ مَا بَعْدَهَا مِنَ الأَعْمَالِ.»
            </p>

            <span className="block text-center text-xs text-[#4a6b8c] dark:text-[#8ba7c0] font-semibold mt-3">
              دعاء مأثور
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 9. MODALS: TASBIH & QIBLA                                       */}
      {/* ============================================================== */}
      
      {/* 9.1. Tasbih Modal */}
      {showTasbihModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTasbihModal(false)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-black/5 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setShowTasbihModal(false)}
                className="w-9 h-9 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-red-500"
              >
                ✕
              </button>
              <h3 className="font-bold text-lg text-[#1e354d] dark:text-white flex items-center gap-2">
                <span className="text-[#0f8e5d] dark:text-[#4ade80]">{renderDailyIcon("tasbih", "w-5 h-5")}</span>
                <span>المسبحة الإلكترونية</span>
              </h3>
            </div>

            {/* Dhikr Selector */}
            <div className="flex gap-2 justify-center mb-6 overflow-x-auto pb-1">
              {["سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله"].map((z) => (
                <button
                  key={z}
                  onClick={() => { setSelectedZikr(z); setTasbihCount(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedZikr === z 
                      ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/30" 
                      : "bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#8ba7c0]"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Big Interactive Touch Area */}
            <div 
              onClick={() => setTasbihCount(c => c + 1)}
              className="w-48 h-48 rounded-full mx-auto my-4 bg-gradient-to-br from-[#0f8e5d]/10 to-[#0f8e5d]/25 border-4 border-[#0f8e5d] flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-transform shadow-xl"
            >
              <span className="text-5xl font-black text-[#0f8e5d] dark:text-[#4ade80] font-mono">
                {tasbihCount}
              </span>
              <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] mt-2">
                انقر للتسبيح
              </span>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setTasbihCount(0)}
                className="px-5 py-2 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] hover:text-red-500 text-xs font-bold transition-colors"
              >
                تصفير العداد
              </button>
              <Link
                href="/dhikr"
                className="px-5 py-2 rounded-full bg-[#0f8e5d] text-white text-xs font-bold shadow-md shadow-[#0f8e5d]/30"
              >
                صفحة الأذكار الكاملة
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 9.2. Qibla Modal */}
      {showQiblaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQiblaModal(false)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-black/5 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setShowQiblaModal(false)}
                className="w-9 h-9 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-red-500"
              >
                ✕
              </button>
              <h3 className="font-bold text-lg text-[#1e354d] dark:text-white flex items-center gap-2">
                <span className="text-[#9333ea] dark:text-[#c084fc]">{renderDailyIcon("qibla", "w-5 h-5")}</span>
                <span>بوصلة اتجاه القبلة</span>
              </h3>
            </div>

            <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mb-6">
              اتجاه الكعبة المشرفة بناءً على موقعك الحالي ({locationName})
            </p>

            {/* Compass Visual */}
            <div className="w-48 h-48 rounded-full mx-auto my-4 bg-[#f4f7f9] dark:bg-[#0f172a] border-4 border-[#9333ea]/30 relative flex items-center justify-center shadow-inner">
              {/* Compass Needle pointing to Qibla angle */}
              <div 
                className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-700"
                style={{ transform: `rotate(${calculateQibla()}deg)` }}
              >
                <div className="flex flex-col items-center -translate-y-12">
                  <span className="text-2xl">🕋</span>
                  <div className="w-1.5 h-12 bg-[#9333ea] rounded-full mt-1"></div>
                </div>
              </div>

              <div className="text-center z-10 bg-white/80 dark:bg-[#1e293b]/80 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-sm">
                <span className="text-xl font-black text-[#9333ea] dark:text-[#c084fc]">
                  {calculateQibla()}°
                </span>
                <span className="block text-[10px] text-[#4a6b8c] dark:text-[#8ba7c0] font-bold">
                  شمال شرق
                </span>
              </div>
            </div>

            <p className="text-xs font-bold text-[#0f8e5d] dark:text-[#4ade80] mt-4">
              وجه جهازك باتجاه الكعبة المشرفة للصلاة
            </p>
          </div>
        </div>
      )}

      {/* Hidden Radio Audio Player */}
      <audio
        ref={radioRef}
        src="https://backup.qurango.net/radio/tarateel"
        preload="none"
        onPlay={() => setIsRadioPlaying(true)}
        onPause={() => setIsRadioPlaying(false)}
      />

      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e354d] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm transition-all duration-300 pointer-events-none ${
        toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}>
        {toastMessage}
      </div>

    </div>
  );
}
