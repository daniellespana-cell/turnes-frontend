const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  
  page.on('response', response => {
    console.log('RESPONSE:', response.status(), response.url(), response.headers()['content-type']);
  });

  console.log('Navigating to https://turnes.co...');
  await page.goto('https://turnes.co', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
