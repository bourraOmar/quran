import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page } = await context.params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return NextResponse.json({ error: "Invalid page number (must be 1-604)" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=false&fields=text_uthmani,chapter_id,verse_key,verse_number,page_number,juz_number,hizb_number,rub_el_hizb_number`,
      {
        next: { revalidate: 86400 }, // Cache 24 hours
      }
    );

    if (!res.ok) {
      throw new Error(`Quran.com API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`Error fetching verses for page ${page}:`, error);
    return NextResponse.json({ error: "Failed to fetch page verses" }, { status: 500 });
  }
}
