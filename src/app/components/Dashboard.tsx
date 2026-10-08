"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
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
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Default to Makkah if geolocation fails
  const fetchPrayerData = async (lat: number = 21.4225, lng: number = 39.8262) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await res.json();
      
      setTimings({
        Fajr: data.data.timings.Fajr,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
      });
      
      setHijri({
        day: data.data.date.hijri.day,
        month: data.data.date.hijri.month,
        year: data.data.date.hijri.year,
      });

      // Simple reverse geocoding to get City/Country using BigDataCloud free API
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
    // Start clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Get Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchPrayerData(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchPrayerData(); // fallback to Makkah
        }
      );
    } else {
      fetchPrayerData();
    }

    return () => clearInterval(timer);
  }, []);

  // Helper to get next prayer
  const getNextPrayer = () => {
    if (!timings) return { name: "جاري التحميل", time: "", countdown: "" };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":");
      return parseInt(h) * 60 + parseInt(m);
    };

    const schedule = [
      { name: "الفجر", time: timings.Fajr, mins: parseTime(timings.Fajr) },
      { name: "الظهر", time: timings.Dhuhr, mins: parseTime(timings.Dhuhr) },
      { name: "العصر", time: timings.Asr, mins: parseTime(timings.Asr) },
      { name: "المغرب", time: timings.Maghrib, mins: parseTime(timings.Maghrib) },
      { name: "العشاء", time: timings.Isha, mins: parseTime(timings.Isha) },
    ];

    let next = schedule.find(p => p.mins > currentMinutes);
    if (!next) {
      // Next is Fajr tomorrow
      next = schedule[0];
      const diffMins = (24 * 60 - currentMinutes) + next.mins;
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return { name: next.name, time: next.time, countdown: `${h}س ${m}د` };
    }

    const diffMins = next.mins - currentMinutes;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    
    return { name: next.name, time: next.time, countdown: `${h > 0 ? h + 'س ' : ''}${m}د` };
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] pb-32 text-[#1e354d] dark:text-[#f8fafc] font-sans" dir="rtl">
      
      {/* Top Section - Dynamic Arc & Location */}
      <div className="bg-gradient-to-b from-[#8ba7c0]/30 to-[#f4f7f9] dark:from-[#1e293b] dark:to-[#0f172a] pt-12 pb-8 px-6 rounded-b-[40px] shadow-sm relative overflow-hidden">
        {/* Decorative Mosque Silhouettes (abstract) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/img/mosque-pattern.png)', backgroundSize: 'contain', backgroundPosition: 'bottom' }}></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <p className="text-xl font-bold">{currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {locationName}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col items-center mt-6 z-10">
          <div className="w-64 h-32 border-t-2 border-dashed border-[#4a6b8c] dark:border-[#8ba7c0] rounded-t-full relative flex flex-col items-center justify-end pb-4">
             {/* Indicator dot */}
             <div className="absolute top-0 right-1/4 w-4 h-4 bg-[#4a6b8c] dark:bg-[#8ba7c0] rounded-full -translate-y-1/2 shadow-lg shadow-[#4a6b8c]/50"></div>
             
             <h2 className="text-4xl font-extrabold text-[#4a6b8c] dark:text-[#8ba7c0]">{nextPrayer.name}</h2>
             <p className="text-lg font-bold mt-2">{nextPrayer.time}</p>
             <p className="text-sm opacity-80 mt-1">{nextPrayer.name} بعد {nextPrayer.countdown}</p>
          </div>
          
          <button className="mt-6 bg-[#4a6b8c] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#4a6b8c]/30 hover:bg-[#395675] transition-all">
            سجل صلاتك
          </button>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <div className="px-4 mt-[-20px] relative z-20 space-y-4">
        
        {/* Prayer Times Row */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-[30px] shadow-sm flex justify-between items-center overflow-x-auto gap-4 hide-scrollbar">
          {[
            { name: "الفجر", time: timings?.Fajr || "--:--" },
            { name: "الظهر", time: timings?.Dhuhr || "--:--" },
            { name: "العصر", time: timings?.Asr || "--:--" },
            { name: "المغرب", time: timings?.Maghrib || "--:--" },
            { name: "العشاء", time: timings?.Isha || "--:--" },
          ].map((p, i) => (
            <div key={i} className={`flex flex-col items-center min-w-[60px] ${nextPrayer.name === p.name ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-2 rounded-2xl border border-[#e2e8f0] dark:border-[#334155]' : ''}`}>
               <span className="text-xs opacity-70 mb-1">{p.name}</span>
               <span className="font-bold text-sm">{p.time}</span>
               {/* Toggle switch visual */}
               <div className={`mt-2 w-10 h-5 rounded-full p-1 transition-colors ${i === 4 ? 'bg-[#4a6b8c]' : 'bg-[#e2e8f0] dark:bg-[#334155]'}`}>
                 <div className={`w-3 h-3 bg-white rounded-full transition-transform ${i === 4 ? 'translate-x-5' : 'translate-x-0'}`}></div>
               </div>
            </div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-4 gap-3">
           {[
             { name: "الحديث", icon: "📖", href: "/hadith" },
             { name: "الدعاء", icon: "🤲", href: "/dua" },
             { name: "الذكر", icon: "📿", href: "/dhikr" },
             { name: "القبلة", icon: "🧭", href: "/qibla" },
           ].map((item, i) => (
             <Link href={item.href} key={i} className="bg-white dark:bg-[#1e293b] p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] transition-colors border border-transparent hover:border-[#e2e8f0] dark:hover:border-[#334155]">
               <span className="text-3xl">{item.icon}</span>
               <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8]">{item.name}</span>
             </Link>
           ))}
        </div>

        {/* Two Columns Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
             <span className="text-xs opacity-70 mb-1">التاريخ الهجري</span>
             <span className="font-bold text-lg">{hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : "جاري التحميل..."}</span>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex flex-col justify-center items-start">
             <span className="text-xs opacity-70 mb-1">آخر قراءة</span>
             <span className="font-bold text-lg font-amiri mb-2">سورة الفاتحة</span>
             <Link href="/surah/1" className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] font-bold flex items-center gap-1">
               متابعة القراءة
               <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
             </Link>
          </div>
        </div>

        {/* Hadith of the Day */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-[#e2e8f0] dark:border-[#334155] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{ backgroundImage: 'url(/img/pattern.png)' }}></div>
           <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] mb-3 block text-center">حديث اليوم</span>
           <p className="text-xl md:text-2xl font-amiri text-center leading-loose">
             "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ"
           </p>
        </div>

      </div>
    </div>
  );
}
