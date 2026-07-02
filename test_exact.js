const token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImYzZjgxZTU3LTU5ZGUtNDI5Yy04M2I4LTkxYTYyOTY1ZGMyYSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2xscnZlcWlna2d5YWZnem9mb3FoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZDAzZWZiZi02NDdiLTQ2N2YtODNkZi00MzUwMzM3ZDYyYTciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyNDQ3MzUyLCJpYXQiOjE3ODI0NDM3NTIsImVtYWlsIjoiZXN0aXZlbmRhbmllbDc3MkBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl0sInJvbCI6ImVtcHJlc2EifSwidXNlcl9tZXRhZGF0YSI6eyJjb21wYW55TmFtZSI6ImVzdGl2ZW5kYW5pZWw3NzJAZ21haWwuY29tIiwiY29tcGFueV9uYW1lIjoiZXN0aXZlbmRhbmllbDc3MkBnbWFpbC5jb20iLCJlbWFpbCI6ImVzdGl2ZW5kYW5pZWw3NzJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6ImVzdGl2ZW5kYW5pZWw3NzJAZ21haWwuY29tIiwibm9tYnJlX2NvbWVyY2lhbCI6ImVzdGl2ZW5kYW5pZWw3NzJAZ21haWwuY29tIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJyb2wiOiJlbXByZXNhIiwicm9sZSI6ImNvbXBhbnkiLCJzdWIiOiIwZDAzZWZiZi02NDdiLTQ2N2YtODNkZi00MzUwMzM3ZDYyYTciLCJ2ZXJpZmljYWRvIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MjQ0Mzc1Mn1dLCJzZXNzaW9uX2lkIjoiZTcxZjBkNGYtNDU3YS00NGIzLThlZWUtNTEzNmI0NjU5Yzc2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.iOPQqCGLUtNESB7ij6XQM4FEimplOAEvK-oCocN4gQLCc05vftm7le8rM0EA39NSxa2VNKNtogB07nBfmALvxA";

async function run() {
  const res = await fetch('https://llrveqigkgyafgzofoqh.supabase.co/functions/v1/generate-ai-bio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: "{}"
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Length:", Buffer.byteLength(text, 'utf8'));
  console.log("Body:", text);
}

run();
