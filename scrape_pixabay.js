const https = require('https');

const urls = [
  "https://pixabay.com/sound-effects/film-special-effects-nature-forest-sound-537925/",
  "https://pixabay.com/sound-effects/nature-wind-blowing-457954/",
  "https://pixabay.com/sound-effects/nature-copyright-free-rain-sounds-331497/",
  "https://pixabay.com/sound-effects/nature-fire-crackling-sound-499636/",
  "https://pixabay.com/sound-effects/nature-beach-02-404144/"
];

async function getMp3Url(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for property="og:audio" content="https://cdn.pixabay.com/audio/..." or similar
        const match = data.match(/https:\/\/cdn\.pixabay\.com\/audio\/[^"]+\.mp3/);
        if (match) {
          resolve(match[0]);
        } else {
          const match2 = data.match(/https:\/\/cdn\.pixabay\.com\/download\/audio\/[^"]+\.mp3/);
          if (match2) resolve(match2[0]);
          else resolve('Not found');
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const url of urls) {
    const mp3 = await getMp3Url(url);
    console.log(url + ' -> ' + mp3);
  }
}

run();
