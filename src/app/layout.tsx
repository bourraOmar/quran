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
  title: {
    template: '%s | القرآن الكريم',
    default: 'القرآن الكريم - استماع، قراءة، وتفسير',
  },
  description: 'موقع القرآن الكريم. استمع إلى تلاوات خاشعة بمختلف الروايات، واقرأ الآيات مع التفسير الميسر والمزامنة التلقائية.',
  keywords: ['القرآن', 'القرآن الكريم', 'استماع القرآن', 'قراءة القرآن', 'تفسير القرآن', 'تلاوات', 'quran', 'mp3quran', 'تلاوة خاشعة'],
  authors: [{ name: 'Quran Project' }],
  openGraph: {
    title: 'القرآن الكريم - استماع وقراءة وتفسير',
    description: 'استمع واقرأ القرآن الكريم مع خاصية التتبع الآلي والتفسير الميسر.',
    url: 'https://quran-al-karim.vercel.app',
    siteName: 'القرآن الكريم',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'القرآن الكريم - استماع وقراءة',
    description: 'استمع واقرأ القرآن الكريم بأصوات أشهر القراء.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import { AmbientAudioProvider } from "./context/AmbientAudioContext";
import AmbientSoundMenu from "./components/AmbientSoundMenu";
import GlobalPlayer from "./components/GlobalPlayer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} ${amiriQuran.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:bg-[#0f172a] dark:text-[#e2e8f0] transition-colors duration-300">
        <AmbientAudioProvider>
        <GlobalAudioProvider>
          <Navbar />
          <main className="flex-1 w-full pb-24 md:pb-0">{children}</main>
          <ScrollToTop />
          <FloatingMobileMenu />
          <GlobalPlayer />
          <AmbientSoundMenu />
          <Footer />
        </GlobalAudioProvider>
        </AmbientAudioProvider>
      </body>
    </html>
  );
}
