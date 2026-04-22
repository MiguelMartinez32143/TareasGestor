const http = require('http');

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/admins',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer FAKE_TOKEN'
    }
}, res => {
    let rawData = '';
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => {
        console.log('Status completo:', res.statusCode);
        console.log('Respuesta del backend para Token fake:', rawData);
    });
});

req.on('error', e => {
    console.error('Error con request local:', e.message);
});
req.write(JSON.stringify({ username: 'test', password: '123' }));
req.end();
