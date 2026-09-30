import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quran-al-karim.vercel.app';

  // 1. Static Routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/surahs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reciters`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // 2. Surah Pages (1 to 114)
  const surahRoutes = Array.from({ length: 114 }, (_, i) => ({
    url: `${baseUrl}/surah/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 3. Reciter Pages
  let reciterRoutes: any[] = [];
  try {
    const res = await fetch("https://www.mp3quran.net/api/v3/reciters");
    const data = await res.json();
    reciterRoutes = data.reciters.map((r: any) => ({
      url: `${baseUrl}/reciter/${r.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch reciters for sitemap", error);
  }

  return [...staticRoutes, ...surahRoutes, ...reciterRoutes];
}
