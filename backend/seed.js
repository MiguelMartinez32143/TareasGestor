// ==========================================
// SEED: Creación automática de admin inicial
// ==========================================
const bcrypt = require('bcryptjs');

async function seedAdmin(db) {
    return new Promise((resolve, reject) => {
        // Verificar si la tabla administradores está vacía
        db.query('SELECT COUNT(*) AS total FROM administradores', async (err, results) => {
            if (err) {
                console.error('❌ Error verificando admins:', err.message);
                return reject(err);
            }

            const total = results[0].total;

            if (total > 0) {
                // Admin ya existe: actualizar contraseña para asegurar acceso
                try {
                    const hashPassword = await bcrypt.hash('admin123', 10);
                    db.query('UPDATE administradores SET password = ? WHERE username = ?', [hashPassword, 'admin'], (err) => {
                        if (err) {
                            console.error('❌ Error actualizando password:', err.message);
                            return reject(err);
                        }
                        console.log('✅ Password del admin actualizada a: admin123');
                        resolve();
                    });
                } catch (hashErr) {
                    console.error('❌ Error hasheando password:', hashErr.message);
                    reject(hashErr);
                }
                return;
            }

            // Tabla vacía → crear admin inicial
            try {
                const hashPassword = await bcrypt.hash('admin123', 10);

                const sql = 'INSERT INTO administradores (username, password) VALUES (?, ?)';
                db.query(sql, ['admin', hashPassword], (err) => {
                    if (err) {
                        console.error('❌ Error creando admin inicial:', err.message);
                        return reject(err);
                    }

                    console.log('✅ Admin inicial creado: username=admin, password=admin123');
                    resolve();
                });
            } catch (hashErr) {
                console.error('❌ Error hasheando password:', hashErr.message);
                reject(hashErr);
            }
        });
    });
}

module.exports = { seedAdmin };

// ✅ RF/RNF cubiertos: [RF-A3, RNF-A2]
// ⚠️ CONFLICTO DETECTADO: Requiere que la tabla 'administradores' exista en MySQL.
//    Ejecutar antes:
//    CREATE TABLE IF NOT EXISTS administradores (
//      id INT AUTO_INCREMENT PRIMARY KEY,
//      username VARCHAR(50) NOT NULL UNIQUE,
//      password VARCHAR(255) NOT NULL
//    );
