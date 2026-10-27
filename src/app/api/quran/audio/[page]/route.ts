import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page } = await context.params;
  const pageNum = parseInt(page, 10);
  const reciterId = request.nextUrl.searchParams.get("reciter") || "7"; // Default: Mishari Alafasy

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_page/${pageNum}`,
      {
        next: { revalidate: 86400 * 7 },
      }
    );

    if (!res.ok) {
      throw new Error(`Quran.com Audio API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`Error fetching audio for page ${page}:`, error);
    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
  }
}
