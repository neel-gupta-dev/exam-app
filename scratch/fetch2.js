const https = require('https');

https.get('https://api.github.com/repos/Sbrjt/josaa-cutoffs/git/trees/main?recursive=1', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.tree) {
      json.tree.filter(f => f.path.includes('2023') || f.path.includes('2024') || f.path.endsWith('.csv') || f.path.endsWith('.json')).forEach(f => console.log(f.path));
    } else {
      console.log(json);
    }
  });
}).on('error', err => console.error(err));
