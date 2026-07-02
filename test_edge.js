async function test() {
  const res = await fetch('https://llrveqigkgyafgzofoqh.supabase.co/functions/v1/generate-ai-bio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fake_token'
    }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
