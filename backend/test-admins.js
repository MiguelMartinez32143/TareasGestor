const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tareas_db',
});

db.connect(err => {
    if (err) throw err;
    db.query('SELECT * FROM administradores', async (err, results) => {
        if (err) throw err;
        console.log('Admins en BD:', results);
        if (results.length > 0) {
            const match = await bcrypt.compare('admin123', results[0].password);
            console.log('¿admin123 coincide con password del primer usuario?', match);
        }
        process.exit();
    });
});
