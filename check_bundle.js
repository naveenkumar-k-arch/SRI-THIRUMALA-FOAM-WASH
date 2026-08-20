const https = require('https');
https.get('https://sri-thirumala-foam-wash.vercel.app/', res => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const scriptMatch = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
    const cssMatch = html.match(/href="\/assets\/(index-[^"]+\.css)"/);
    console.log('HTTP Status:', res.statusCode);
    console.log('JS Bundle:', scriptMatch ? scriptMatch[1] : 'NOT FOUND');
    console.log('CSS Bundle:', cssMatch ? cssMatch[1] : 'NOT FOUND');
    if (scriptMatch && scriptMatch[1] !== 'index-BuNcD2ce.js') {
      console.log('NEW BUNDLE DEPLOYED - black screen fix is LIVE!');
    } else if (scriptMatch && scriptMatch[1] === 'index-BuNcD2ce.js') {
      console.log('OLD BUNDLE STILL LIVE - Vercel not yet updated');
    }
  });
}).on('error', err => console.error(err));
