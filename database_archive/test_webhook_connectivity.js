
const https = require('https');

const options = {
    hostname: 'llrveqigkgyafgzofoqh.supabase.co',
    path: '/functions/v1/wompi-webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(JSON.stringify({ test: 'connectivity_check' }));
req.end();
