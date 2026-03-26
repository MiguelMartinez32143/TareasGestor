const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tareas_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error de conexión:', err.message);
        process.exit(1);
    }
    
    db.query('SELECT * FROM tareas', (err, results) => {
        if (err) {
            console.error('❌ Error ejecutando query:', err.message);
            process.exit(1);
        }
        
        console.log('✅ Conexión exitosa a tareas_db.');
        console.log('✅ La tabla tareas existe.');
        console.log('✅ Tareas actuales encontradas:', results.length);
        process.exit(0);
    });
});
