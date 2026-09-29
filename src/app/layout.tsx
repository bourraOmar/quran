import type { Metadata } from "next";
import { Cairo, Amiri, Amiri_Quran } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingMobileMenu from "./components/FloatingMobileMenu";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cairo",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-amiri-quran",
});

export const metadata: Metadata = {
  title: "القرآن الكريم",
  description: "موقع القرآن الكريم",
};

import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import GlobalPlayer from "./components/GlobalPlayer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} ${amiriQuran.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:bg-[#0f172a] dark:text-[#e2e8f0] transition-colors duration-300">
        <GlobalAudioProvider>
          <Navbar />
          <main className="flex-1 w-full pb-24 md:pb-0">{children}</main>
          <ScrollToTop />
          <FloatingMobileMenu />
          <GlobalPlayer />
          <Footer />
        </GlobalAudioProvider>
      </body>
    </html>
  );
}
