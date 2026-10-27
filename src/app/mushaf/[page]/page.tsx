import { Metadata } from "next";
import { notFound } from "next/navigation";
import MushafPageReader, { PageVerse } from "./MushafPageReader";

interface Props {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return { title: "المصحف الشريف | القرآن الكريم" };
  }
  return {
    title: `المصحف الشريف - صفحة ${pageNum}`,
    description: `قراءة وتلاوة صفحة ${pageNum} من القرآن الكريم بالرسم العثماني المعتمد وفق مصحف المدينة المنورة مع التفسير الميسر والاستماع الصوتي.`,
  };
}

async function getPageVerses(page: number): Promise<PageVerse[]> {
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${page}?words=false&fields=text_uthmani,chapter_id,verse_key,verse_number,page_number,juz_number,hizb_number,rub_el_hizb_number`,
      {
        next: { revalidate: 86400 }, // Cache 24 hours
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}`);
    }
    const data = await res.json();
    return data.verses || [];
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
    return [];
  }
}

export default async function MushafPage({ params }: Props) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    notFound();
  }

  const verses = await getPageVerses(pageNum);

  return <MushafPageReader pageNumber={pageNum} verses={verses} />;
}
