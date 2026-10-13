import type { Metadata } from "next";
import { Cairo, Amiri, Amiri_Quran, Aref_Ruqaa_Ink } from "next/font/google";
import ScrollToTop from "./components/ScrollToTop";
import FloatingMobileMenu from "./components/FloatingMobileMenu";
import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import { AmbientAudioProvider } from "./context/AmbientAudioContext";
import GlobalPlayer from "./components/GlobalPlayer";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-amiri-quran",
  display: "swap",
  preload: false,
});

const arefRuqaaInk = Aref_Ruqaa_Ink({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: '%s | القرآن الكريم',
    default: 'القرآن الكريم - تطبيق أُنس',
  },
  description: 'مواقيت الصلاة، الأذكار، المصحف الشريف، والاستماع لتلاوات خاشعة.',
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1329" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} ${amiriQuran.variable} ${arefRuqaaInk.variable} font-sans h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0b1329] dark:bg-[#0b1329] text-[#e2e8f0] transition-colors duration-300">
        <AmbientAudioProvider>
        <GlobalAudioProvider>
          <main className="flex-1 w-full pb-28">{children}</main>
          <ScrollToTop />
          <FloatingMobileMenu />
          <GlobalPlayer />
        </GlobalAudioProvider>
        </AmbientAudioProvider>
      </body>
    </html>
  );
}
