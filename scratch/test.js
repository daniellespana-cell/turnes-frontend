fetch('https://turnes.co/').then(r => r.text()).then(t => { 
  const match = t.match(/src=\"\/assets\/index-[^\"]+\"/); 
  console.log('HTML Match:', match ? match[0] : 'No match'); 
  if (match) { 
    const jsUrl = 'https://turnes.co' + match[0].substring(5, match[0].length - 1); 
    fetch(jsUrl).then(jsRes => console.log('JS Fetch:', jsRes.status, jsRes.headers.get('content-type'))); 
  } 
});
