/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [toastMessage, setToastMessage] = useState("");
  
  const [prayedStatus, setPrayedStatus] = useState<Record<string, boolean>>({
    "الفجر": false,
    "الظهر": false,
    "العصر": false,
    "المغرب": false,
    "العشاء": false,
  });

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    return parseInt(h) * 60 + parseInt(m);
  };

  const getPrayerDayId = () => {
    const now = new Date();
    if (!timings) return now.toDateString();
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const fajrMinutes = parseTime(timings.Fajr);
    
    // If we are before Fajr, we are still technically in the "previous" Islamic day for prayer tracking
    if (currentMinutes < fajrMinutes) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toDateString();
    }
    return now.toDateString();
  };

  const canCheckPrayer = (prayerTimeStr: string) => {
    if (!timings) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerMinutes = parseTime(prayerTimeStr);
    const fajrMinutes = parseTime(timings.Fajr);

    // If current time is before Fajr (e.g. 2 AM), then ALL prayers from the previous day (which this schedule represents if fetched yesterday, or if we consider Isha from yesterday) are checkable.
    // Wait, the timings object is for the current calendar day. 
    // If it's 2 AM, currentMinutes (120) < fajrMinutes (300).
    // They are checking Isha. prayerMinutes is 1170.
    // In this case, 120 < 1170. But they SHOULD be able to check it because it's from yesterday.
    if (currentMinutes < fajrMinutes) {
      // Before Fajr: you can check ANY prayer (because they are from yesterday)
      return true; 
    }

    // After Fajr: you can only check prayers whose time has passed today
    return currentMinutes >= prayerMinutes;
  };

  const togglePrayed = (prayerName: string, prayerTimeStr: string) => {
    if (!canCheckPrayer(prayerTimeStr)) {
      // Could show a small toast here: "لم يحن وقت الصلاة بعد"
      setToastMessage("لا يمكن تسجيل الصلاة قبل دخول وقتها");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }
    setPrayedStatus(prev => ({
      ...prev,
      [prayerName]: !prev[prayerName]
    }));
  };

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

    return () => clearInterval(timer);
  }, []);

  // Effect to handle initialization and resetting based on Fajr
  useEffect(() => {
    if (!timings) return;

    const prayerDayId = getPrayerDayId();
    const savedStatus = localStorage.getItem('prayedStatus');
    const savedDayId = localStorage.getItem('prayerDayId');
    
    if (savedStatus && savedDayId === prayerDayId) {
      setPrayedStatus(JSON.parse(savedStatus));
    } else {
      // New prayer day (passed Fajr), reset!
      setPrayedStatus({
        "الفجر": false,
        "الظهر": false,
        "العصر": false,
        "المغرب": false,
        "العشاء": false,
      });
      localStorage.setItem('prayerDayId', prayerDayId);
      localStorage.setItem('prayedStatus', JSON.stringify({
        "الفجر": false,
        "الظهر": false,
        "العصر": false,
        "المغرب": false,
        "العشاء": false,
      }));
    }
  }, [timings]); // runs when timings are loaded

  // Save to local storage whenever it changes
  useEffect(() => {
    if (Object.keys(prayedStatus).length > 0 && timings) {
      localStorage.setItem('prayedStatus', JSON.stringify(prayedStatus));
    }
  }, [prayedStatus, timings]);

  const getNextPrayer = () => {
    if (!timings) return { name: "جاري التحميل", time: "", countdown: "", isPrayed: false, rawTime: "" };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const schedule = [
      { name: "الفجر", time: timings.Fajr, mins: parseTime(timings.Fajr) },
      { name: "الظهر", time: timings.Dhuhr, mins: parseTime(timings.Dhuhr) },
      { name: "العصر", time: timings.Asr, mins: parseTime(timings.Asr) },
      { name: "المغرب", time: timings.Maghrib, mins: parseTime(timings.Maghrib) },
      { name: "العشاء", time: timings.Isha, mins: parseTime(timings.Isha) },
    ];

    let next = schedule.find(p => p.mins > currentMinutes);
    if (!next) {
      next = schedule[0];
      const diffMins = (24 * 60 - currentMinutes) + next.mins;
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return { name: next.name, time: next.time, countdown: `${h}س ${m}د`, isPrayed: prayedStatus[next.name], rawTime: next.time };
    }

    const diffMins = next.mins - currentMinutes;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    
    return { name: next.name, time: next.time, countdown: `${h > 0 ? h + 'س ' : ''}${m}د`, isPrayed: prayedStatus[next.name], rawTime: next.time };
  };

  // The "current" prayer is the one that just passed (so they can log it)
  const getCurrentPrayer = () => {
    if (!timings) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const schedule = [
      { name: "الفجر", time: timings.Fajr, mins: parseTime(timings.Fajr) },
      { name: "الظهر", time: timings.Dhuhr, mins: parseTime(timings.Dhuhr) },
      { name: "العصر", time: timings.Asr, mins: parseTime(timings.Asr) },
      { name: "المغرب", time: timings.Maghrib, mins: parseTime(timings.Maghrib) },
      { name: "العشاء", time: timings.Isha, mins: parseTime(timings.Isha) },
    ];

    // Find the last prayer whose time has passed
    const passedPrayers = schedule.filter(p => p.mins <= currentMinutes);
    if (passedPrayers.length === 0) {
      // Before Fajr today, so current prayer is Isha from yesterday
      return schedule[4];
    }
    return passedPrayers[passedPrayers.length - 1];
  };

  const nextPrayer = getNextPrayer();
  const currentPrayer = getCurrentPrayer();

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] pb-32 text-[#1e354d] dark:text-[#f8fafc] font-sans" dir="rtl">
      
      <div className="bg-gradient-to-b from-[#8ba7c0]/30 to-[#f4f7f9] dark:from-[#1e293b] dark:to-[#0f172a] pt-12 pb-8 px-6 rounded-b-[40px] shadow-sm relative overflow-hidden">
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
             <div className="absolute top-0 left-1/2 w-4 h-4 -translate-x-1/2 bg-[#4a6b8c] dark:bg-[#8ba7c0] rounded-full -translate-y-1/2 shadow-lg shadow-[#4a6b8c]/50"></div>
             
             <h2 className="text-4xl font-extrabold text-[#4a6b8c] dark:text-[#8ba7c0]">{nextPrayer.name}</h2>
             <p className="text-lg font-bold mt-2">{nextPrayer.time}</p>
             <p className="text-sm opacity-80 mt-1">{nextPrayer.name} بعد {nextPrayer.countdown}</p>
          </div>
          
          {currentPrayer && (
            <button 
              onClick={() => togglePrayed(currentPrayer.name, currentPrayer.time)}
              className={`mt-6 px-8 py-3 rounded-full font-bold shadow-lg transition-all ${prayedStatus[currentPrayer.name] ? 'bg-[#8ba7c0] text-white opacity-80 shadow-none' : 'bg-[#4a6b8c] text-white hover:bg-[#395675] shadow-[#4a6b8c]/30'}`}
            >
              {prayedStatus[currentPrayer.name] ? `تمت صلاة ${currentPrayer.name} بفضل الله` : `سجل صلاة ${currentPrayer.name}`}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-[-20px] relative z-20 space-y-4">
        
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-[30px] shadow-sm flex justify-between items-center overflow-x-auto gap-4 hide-scrollbar">
          {[
            { name: "الفجر", time: timings?.Fajr || "--:--" },
            { name: "الظهر", time: timings?.Dhuhr || "--:--" },
            { name: "العصر", time: timings?.Asr || "--:--" },
            { name: "المغرب", time: timings?.Maghrib || "--:--" },
            { name: "العشاء", time: timings?.Isha || "--:--" },
          ].map((p, i) => {
            const isChecked = prayedStatus[p.name];
            const isClickable = timings ? canCheckPrayer(p.time) : false;
            return (
            <div key={i} className={`flex flex-col items-center min-w-[60px] ${nextPrayer.name === p.name ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-2 rounded-2xl border border-[#e2e8f0] dark:border-[#334155]' : ''}`}>
               <span className="text-xs opacity-70 mb-1">{p.name}</span>
               <span className="font-bold text-sm">{p.time}</span>
               
               <div 
                 onClick={() => togglePrayed(p.name, p.time)}
                 className={`mt-2 w-11 h-6 rounded-full p-1 transition-colors flex items-center shadow-inner ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isChecked ? 'bg-[#4a6b8c]' : 'bg-[#e2e8f0] dark:bg-[#334155]'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isChecked ? 'translate-x-[-20px]' : 'translate-x-0'}`}></div>
               </div>
            </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-3">
           {[
             { name: "الحديث", icon: <Image src="/icons/hadith.png" width={32} height={32} alt="الحديث" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/hadith" },
             { name: "الدعاء", icon: <Image src="/icons/dua.png" width={32} height={32} alt="الدعاء" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/dua" },
             { name: "الذكر", icon: <Image src="/icons/dhikr.png" width={32} height={32} alt="الذكر" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/dhikr" },
             { name: "القبلة", icon: <Image src="/icons/qibla.png" width={32} height={32} alt="القبلة" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/qibla" },
           ].map((item, i) => (
             <Link href={item.href} key={i} className="bg-white dark:bg-[#1e293b] py-5 px-2 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] transition-all border border-transparent hover:border-[#e2e8f0] dark:hover:border-[#334155]">
               {item.icon}
               <span className="text-[11px] font-bold text-[#4a6b8c] dark:text-[#94a3b8]">{item.name}</span>
             </Link>
           ))}
        </div>

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

        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-[#e2e8f0] dark:border-[#334155] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{ backgroundImage: 'url(/img/pattern.png)' }}></div>
           <span className="text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] mb-3 block text-center">حديث اليوم</span>
           <p className="text-xl md:text-2xl font-amiri text-center leading-loose">
             "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ"
           </p>
        </div>

      </div>


      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e354d] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm transition-all duration-300 pointer-events-none ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {toastMessage}
      </div>
    </div>
  );
}
