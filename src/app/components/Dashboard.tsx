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
  
  // Track prayed status
  const [prayedStatus, setPrayedStatus] = useState<Record<string, boolean>>({
    "الفجر": false,
    "الظهر": false,
    "العصر": false,
    "المغرب": false,
    "العشاء": false,
  });
  
  const togglePrayed = (prayerName: string) => {
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

    // Load prayed status from localStorage if exists
    const savedStatus = localStorage.getItem('prayedStatus');
    const savedDate = localStorage.getItem('prayedDate');
    const today = new Date().toDateString();
    
    if (savedStatus && savedDate === today) {
      setPrayedStatus(JSON.parse(savedStatus));
    } else {
      // New day, reset
      localStorage.setItem('prayedDate', today);
    }

    return () => clearInterval(timer);
  }, []);

  // Save to local storage whenever it changes
  useEffect(() => {
    if (Object.keys(prayedStatus).length > 0) {
      localStorage.setItem('prayedStatus', JSON.stringify(prayedStatus));
    }
  }, [prayedStatus]);

  const getNextPrayer = () => {
    if (!timings) return { name: "جاري التحميل", time: "", countdown: "", isPrayed: false };
    
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
      next = schedule[0];
      const diffMins = (24 * 60 - currentMinutes) + next.mins;
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return { name: next.name, time: next.time, countdown: `${h}س ${m}د`, isPrayed: prayedStatus[next.name] };
    }

    const diffMins = next.mins - currentMinutes;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    
    return { name: next.name, time: next.time, countdown: `${h > 0 ? h + 'س ' : ''}${m}د`, isPrayed: prayedStatus[next.name] };
  };

  const nextPrayer = getNextPrayer();

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
          
          <button 
            onClick={() => togglePrayed(nextPrayer.name)}
            className={`mt-6 px-8 py-3 rounded-full font-bold shadow-lg transition-all ${nextPrayer.isPrayed ? 'bg-[#8ba7c0] text-white opacity-80 shadow-none' : 'bg-[#4a6b8c] text-white hover:bg-[#395675] shadow-[#4a6b8c]/30'}`}
          >
            {nextPrayer.isPrayed ? 'تمت الصلاة بفضل الله' : 'سجل صلاتك'}
          </button>
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
            return (
            <div key={i} className={`flex flex-col items-center min-w-[60px] ${nextPrayer.name === p.name ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-2 rounded-2xl border border-[#e2e8f0] dark:border-[#334155]' : ''}`}>
               <span className="text-xs opacity-70 mb-1">{p.name}</span>
               <span className="font-bold text-sm">{p.time}</span>
               
               <div 
                 onClick={() => togglePrayed(p.name)}
                 className={`mt-2 w-11 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer shadow-inner ${isChecked ? 'bg-[#4a6b8c]' : 'bg-[#e2e8f0] dark:bg-[#334155]'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isChecked ? 'translate-x-[-20px]' : 'translate-x-0'}`}></div>
               </div>
            </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-3">
           {[
             { name: "الحديث", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, href: "/hadith" },
             { name: "الدعاء", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, href: "/dua" },
             { name: "الذكر", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, href: "/dhikr" },
             { name: "القبلة", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>, href: "/qibla" },
           ].map((item, i) => (
             <Link href={item.href} key={i} className="bg-white dark:bg-[#1e293b] py-5 px-2 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] transition-all border border-transparent hover:border-[#e2e8f0] dark:hover:border-[#334155]">
               {item.svg}
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
    </div>
  );
}
