import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'أُنس - القرآن الكريم',
    short_name: 'أُنس',
    description: 'استمع واقرأ القرآن الكريم بكل سهولة',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f7f9',
    theme_color: '#4a6b8c',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
