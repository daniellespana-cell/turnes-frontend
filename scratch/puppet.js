const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('BAD RESPONSE:', response.url(), response.status());
    }
  });

  console.log('Navigating to https://turnes.co...');
  await page.goto('https://turnes.co', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'scratch/screenshot.png' });
  console.log('Screenshot saved to scratch/screenshot.png');
  
  await browser.close();
})();
