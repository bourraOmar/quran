const fs = require('fs');

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

const newMetadata = `export const metadata: Metadata = {
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
    url: 'https://quran-project.vercel.app',
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
};`;

layout = layout.replace(/export const metadata: Metadata = \{[\s\S]*?\};\r?\n/, newMetadata + '\n');

fs.writeFileSync('src/app/layout.tsx', layout);
