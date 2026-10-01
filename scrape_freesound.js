const https = require('https');
const fs = require('fs');

const search = (query) => {
  return new Promise((resolve, reject) => {
    https.get(`https://freesound.org/search/?q=${query}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/https:\/\/cdn\.freesound\.org\/previews\/[0-9]+\/[0-9]+_[0-9]+-lq\.mp3/);
        if (match) resolve(match[0]);
        else resolve(null);
      });
    }).on('error', reject);
  });
};

(async () => {
  const rain = await search('rain loop');
  const birds = await search('birds forest loop');
  const fire = await search('campfire loop');
  const waves = await search('ocean waves loop');
  const wind = await search('wind loop');

  console.log({ rain, birds, fire, waves, wind });
})();
