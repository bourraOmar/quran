const fs = require('fs');
fetch('https://commons.wikimedia.org/w/api.php?action=query&list=allimages&aiprop=url&aiprefix=Rain&format=json')
  .then(r => r.json())
  .then(d => {
    fs.writeFileSync('wiki_response.json', JSON.stringify(d, null, 2));
  });
