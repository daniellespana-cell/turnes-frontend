async function test() {
  const r = await fetch('https://turnes.co/dashboard');
  const text = await r.text();
  const match = text.match(/src="(\/assets\/index-[^\"]+)"/);
  if (match) {
    const url = 'https://turnes.co' + match[1];
    const jsRes = await fetch(url);
    console.log('JS Fetch:', jsRes.status, jsRes.headers.get('content-type'));
  } else {
    console.log('No JS found');
  }
}
test();
