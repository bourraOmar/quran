import { NextRequest, NextResponse } from "next/server";
import { qfFetch } from "@/lib/quranFoundation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get("chapter");

  if (!chapter) {
    return NextResponse.json({ error: "Missing chapter parameter" }, { status: 400 });
  }

  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 114) {
    return NextResponse.json({ error: "Invalid chapter number (must be 1-114)" }, { status: 400 });
  }

  try {
    const res = await qfFetch(`quran/verses/uthmani?chapter_number=${chapterNum}`, {
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.statusText}`, verses: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`Error fetching uthmani verses for chapter ${chapter}:`, error);
    return NextResponse.json({ error: "Failed to fetch verses", verses: [] }, { status: 500 });
  }
}
