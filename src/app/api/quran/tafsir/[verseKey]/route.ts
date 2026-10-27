import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ verseKey: string }> }
) {
  const { verseKey } = await context.params;

  if (!verseKey || !verseKey.includes(":")) {
    return NextResponse.json({ error: "Invalid verse key" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/ar-tafsir-muyassar/by_ayah/${encodeURIComponent(verseKey)}`,
      {
        next: { revalidate: 86400 * 7 }, // Cache 7 days
      }
    );

    if (!res.ok) {
      throw new Error(`Quran.com Tafsir API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`Error fetching tafsir for verse ${verseKey}:`, error);
    return NextResponse.json({ error: "Failed to fetch tafsir" }, { status: 500 });
  }
}
