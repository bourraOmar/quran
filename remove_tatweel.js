const fs = require('fs');
let data = fs.readFileSync('src/data/azkar.json', 'utf8');

// The tatweel character is \u0640
// We replace all instances of it globally.
data = data.replace(/\u0640/g, '');

fs.writeFileSync('src/data/azkar.json', data, 'utf8');
console.log('Removed all Tatweel characters');
