import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_APK_URL =
  'https://github.com/bourraOmar/uns-app/releases/download/1.0.1/application-1400e2ae-302b-40eb-8c2b-7fa8e6afed40.apk';

export async function GET() {
  try {
    const res = await fetch('https://api.github.com/repos/bourraOmar/uns-app/releases/latest', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'uns-quran-website',
      },
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const data = await res.json();
      const apkAsset = data.assets?.find((a: any) =>
        typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk')
      );
      if (apkAsset?.browser_download_url) {
        return NextResponse.redirect(apkAsset.browser_download_url, { status: 302 });
      }
    }
  } catch (error) {
    console.error('Error fetching latest release APK from GitHub:', error);
  }

  return NextResponse.redirect(FALLBACK_APK_URL, { status: 302 });
}
