// ==========================================
// IMPORTACIONES
// ==========================================
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateToken, JWT_SECRET } = require('./middleware/validateToken');
const { seedAdmin } = require('./seed');

// ==========================================
// CONFIGURACIÓN APP
// ==========================================
const app = express();

app.use(cors({
    origin: [
        'http://localhost:4200',
        process.env.CORS_ORIGIN_PROD
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // permite recibir JSON

// ==========================================
// CONEXIÓN MYSQL (SOPORTE UNIVERSAL)
// ==========================================
let db;
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;

// Debug: Imprimir las llaves disponibles (sin mostrar valores por seguridad)
console.log('🔑 Variables de entorno disponibles:', Object.keys(process.env).filter(k => k.includes('MYSQL') || k.includes('DB') || k.includes('PASS')));

if (dbUrl) {
    // Si el entorno provee una URL de conexión completa
    console.log('🔗 Conectando a la BD usando URL de conexión...');
    db = mysql.createConnection(dbUrl);
} else {
    // Variables por separado buscando los nombres más comunes en cualquier hosting
    console.log('🔗 Conectando a la BD usando variables por separado...');
    db = mysql.createConnection({
        host: process.env.MYSQLHOST || process.env.DB_HOST || process.env.DATABASE_HOST || process.env.HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || process.env.DATABASE_USER || process.env.USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || process.env.PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || process.env.DATABASE_NAME || 'tareas_db',
        port: process.env.MYSQLPORT || process.env.DB_PORT || process.env.DATABASE_PORT || 3306
    });
}

// ==========================================
// CATÁLOGO DE AVATARES DISPONIBLES (RF-05)
// ==========================================
const AVATARES_CATALOGO = [
    'usuario-1.png',
    'usuario-2.png',
    'usuario-3.png',
    'usuario-4.png',
    'usuario-5.png',
    'usuario-6.png',
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg',
    '6.jpg'
];

// CONECTAR
db.connect((err) => {
    if (err) {
        console.error('❌ Error conexión MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL');

    // Auto-crear tabla administradores si no existe
    const crearTablaAdmins = `
    CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )`;

    // Auto-crear tabla usuarios si no existe (RF-01)
    const crearTablaUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(10) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        avatar VARCHAR(255) NOT NULL DEFAULT 'usuario-1.png'
    )`;

    // Auto-crear tabla tareas si no existe
    const crearTablaTareas = `
    CREATE TABLE IF NOT EXISTS tareas (
        id VARCHAR(50) PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        resumen TEXT,
        expira VARCHAR(50),
        idUsuario VARCHAR(10) NOT NULL,
        completada TINYINT DEFAULT 0
    )`;

    db.query(crearTablaAdmins, (err) => {
        if (err) {
            console.error('❌ Error creando tabla administradores:', err.message);
            return;
        }
        // Ejecutar seed después de asegurar que la tabla existe
        seedAdmin(db).catch((e) => console.error('❌ Error en seed:', e.message));
    });

    db.query(crearTablaUsuarios, (err) => {
        if (err) {
            console.error('❌ Error creando tabla usuarios:', err.message);
            return;
        }
        console.log('✅ Tabla usuarios verificada/creada');

        // Seed de usuarios iniciales si la tabla está vacía
        seedUsuarios(db);
    });

    db.query(crearTablaTareas, (err) => {
        if (err) {
            console.error('❌ Error creando tabla tareas:', err.message);
            return;
        }
        console.log('✅ Tabla tareas verificada/creada');
    });
});

// ==========================================
// SEED DE USUARIOS INICIALES
// ==========================================
function seedUsuarios(db) {
    db.query('SELECT COUNT(*) AS total FROM usuarios', (err, results) => {
        if (err) {
            console.error('❌ Error verificando usuarios:', err.message);
            return;
        }

        if (results[0].total > 0) {
            console.log('ℹ️  La tabla usuarios ya tiene registros. Seed omitido.');
            return;
        }

        const usuariosIniciales = [
            ['u1', 'Valeria Montes', 'usuario-1.png'],
            ['u2', 'Diego Navarro', 'usuario-2.png'],
            ['u3', 'Camila Rojas', 'usuario-3.png'],
            ['u4', 'Mateo Sandoval', 'usuario-4.png'],
            ['u5', 'Isabella Cruz', 'usuario-5.png'],
            ['u6', 'Javier Delgado', 'usuario-6.png'],
        ];

        const sql = 'INSERT INTO usuarios (id, nombre, avatar) VALUES ?';
        db.query(sql, [usuariosIniciales], (err) => {
            if (err) {
                console.error('❌ Error sembrando usuarios:', err.message);
                return;
            }
            console.log('✅ Usuarios iniciales creados (6 registros)');
        });
    });
}

// ==========================================
// POST -> LOGIN DE ADMINISTRADOR
// ==========================================
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ mensaje: 'Username y password son requeridos.' });
    }

    const sql = 'SELECT * FROM administradores WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('❌ Error LOGIN:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        const admin = results[0];

        const passwordValido = await bcrypt.compare(password, admin.password);

        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        // Firmar JWT con id y username
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, admin: { id: admin.id, username: admin.username } });
    });
});
// ✅ RF/RNF cubiertos: [RF-A1, RNF-A1, RNF-A2]

// ==========================================
// POST -> CREAR NUEVO ADMINISTRADOR (PROTEGIDO)
// ==========================================
app.post('/admins', validateToken, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ mensaje: 'Username y password son requeridos.' });
    }

    bcrypt.hash(password, 10).then((hashPassword) => {
        const sql = 'INSERT INTO administradores (username, password) VALUES (?, ?)';

        db.query(sql, [username, hashPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ mensaje: 'El username ya existe.' });
                }
                console.error('❌ Error creando admin:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor.' });
            }

            res.json({ mensaje: 'Administrador creado correctamente.' });
        });
    }).catch((err) => {
        console.error('❌ Error hasheando password:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    });
});
// ✅ RF/RNF cubiertos: [RF-A2, RNF-A1, RNF-A2]

// ==========================================
// PUT -> EDITAR PERFIL DE ADMINISTRADOR (PROTEGIDO)
// ==========================================
app.put('/admins/:id', validateToken, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username && !password) {
        return res.status(400).json({ mensaje: 'Debe enviar al menos username o password.' });
    }

    try {
        // Si se envía password, hashearla
        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            if (username) {
                // Actualizar ambos
                const sql = 'UPDATE administradores SET username = ?, password = ? WHERE id = ?';
                db.query(sql, [username, hashPassword, id], (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ mensaje: 'El username ya existe.' });
                        }
                        console.error('❌ Error editando admin:', err);
                        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
                    }
                    res.json({ mensaje: 'Perfil actualizado correctamente.', admin: { id: Number(id), username } });
                });
            } else {
                // Solo password
                const sql = 'UPDATE administradores SET password = ? WHERE id = ?';
                db.query(sql, [hashPassword, id], (err) => {
                    if (err) {
                        console.error('❌ Error editando password:', err);
                        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
                    }
                    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
                });
            }
        } else {
            // Solo username
            const sql = 'UPDATE administradores SET username = ? WHERE id = ?';
            db.query(sql, [username, id], (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ mensaje: 'El username ya existe.' });
                    }
                    console.error('❌ Error editando username:', err);
                    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
                }
                res.json({ mensaje: 'Username actualizado correctamente.', admin: { id: Number(id), username } });
            });
        }
    } catch (err) {
        console.error('❌ Error en actualización:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ==========================================
// GET -> OBTENER TODOS LOS USUARIOS (RF-02)
// ==========================================
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios ORDER BY nombre ASC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error GET usuarios:', err);
            return res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
        }
        res.json(results);
    });
});
// ✅ RF/RNF cubiertos: [RF-01, RF-02]

// ==========================================
// GET -> CATÁLOGO DE AVATARES (RF-05)
// ==========================================
app.get('/avatares', (req, res) => {
    res.json(AVATARES_CATALOGO);
});
// ✅ RF/RNF cubiertos: [RF-05]

// ==========================================
// POST -> CREAR USUARIO (PROTEGIDO) (RF-02)
// ==========================================
app.post('/usuarios', validateToken, (req, res) => {
    const { nombre, avatar } = req.body;

    if (!nombre) {
        return res.status(400).json({ mensaje: 'El nombre es requerido.' });
    }

    // Generar ID incremental basado en timestamp
    const id = 'u' + Date.now();
    const avatarFinal = avatar || 'usuario-1.png';

    const sql = 'INSERT INTO usuarios (id, nombre, avatar) VALUES (?, ?, ?)';

    db.query(sql, [id, nombre, avatarFinal], (err) => {
        if (err) {
            console.error('❌ Error creando usuario:', err);
            return res.status(500).json({ mensaje: 'Error al crear usuario.' });
        }

        res.json({ mensaje: 'Usuario creado correctamente.', usuario: { id, nombre, avatar: avatarFinal } });
    });
});
// ✅ RF/RNF cubiertos: [RF-02, RF-04]

// ==========================================
// PUT -> EDITAR USUARIO (PROTEGIDO) (RF-02)
// ==========================================
app.put('/usuarios/:id', validateToken, (req, res) => {
    const { id } = req.params;
    const { nombre, avatar } = req.body;

    if (!nombre && !avatar) {
        return res.status(400).json({ mensaje: 'Debe enviar al menos nombre o avatar.' });
    }

    // Construir query dinámico
    const campos = [];
    const valores = [];

    if (nombre) {
        campos.push('nombre = ?');
        valores.push(nombre);
    }
    if (avatar) {
        campos.push('avatar = ?');
        valores.push(avatar);
    }

    valores.push(id);

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('❌ Error editando usuario:', err);
            return res.status(500).json({ mensaje: 'Error al editar usuario.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Retornar usuario actualizado
        db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err2, rows) => {
            if (err2) {
                return res.json({ mensaje: 'Usuario actualizado correctamente.' });
            }
            res.json({ mensaje: 'Usuario actualizado correctamente.', usuario: rows[0] });
        });
    });
});
// ✅ RF/RNF cubiertos: [RF-02, RF-04, RF-05]

// ==========================================
// DELETE -> ELIMINAR USUARIO + CASCADA (PROTEGIDO) (RF-06)
// ==========================================
app.delete('/usuarios/:id', validateToken, (req, res) => {
    const { id } = req.params;

    // Primero eliminar todas las tareas del usuario (RF-06: Eliminación en Cascada)
    const sqlTareas = 'DELETE FROM tareas WHERE idUsuario = ?';

    db.query(sqlTareas, [id], (err, resultTareas) => {
        if (err) {
            console.error('❌ Error eliminando tareas del usuario:', err);
            return res.status(500).json({ mensaje: 'Error al eliminar tareas del usuario.' });
        }

        const tareasEliminadas = resultTareas.affectedRows;

        // Luego eliminar el usuario
        const sqlUsuario = 'DELETE FROM usuarios WHERE id = ?';

        db.query(sqlUsuario, [id], (err2, resultUsuario) => {
            if (err2) {
                console.error('❌ Error eliminando usuario:', err2);
                return res.status(500).json({ mensaje: 'Error al eliminar usuario.' });
            }

            if (resultUsuario.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
            }

            console.log(`🗑️ Usuario ${id} eliminado. ${tareasEliminadas} tarea(s) eliminada(s) en cascada.`);
            res.json({
                mensaje: 'Usuario y sus tareas eliminados correctamente.',
                tareasEliminadas
            });
        });
    });
});
// ✅ RF/RNF cubiertos: [RF-02, RF-04, RF-06]

// ==========================================
// GET -> OBTENER TODAS LAS TAREAS
// ==========================================
app.get('/tareas', (req, res) => {
    const sql = 'SELECT * FROM tareas';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error GET:', err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// ==========================================
// POST -> CREAR TAREA (RF-03: vinculada a usuario válido)
// ==========================================
app.post('/tareas', validateToken, (req, res) => {
    const { id, titulo, resumen, expira, idUsuario } = req.body;

    console.log(' Datos recibidos:', req.body);

    // RF-03: Verificar que el idUsuario exista en la tabla usuarios
    db.query('SELECT id FROM usuarios WHERE id = ?', [idUsuario], (errCheck, rows) => {
        if (errCheck) {
            console.error('❌ Error verificando usuario:', errCheck);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }

        if (rows.length === 0) {
            return res.status(400).json({ mensaje: 'El idUsuario no corresponde a un usuario válido.' });
        }

        const sql = `
        INSERT INTO tareas (id, titulo, resumen, expira, idUsuario, completada)
        VALUES (?, ?, ?, ?, ?, 0)
        `;

        db.query(sql, [id, titulo, resumen, expira, idUsuario], (err) => {
            if (err) {
                console.error('❌ Error INSERT:', err);
                return res.status(500).json(err);
            }

            res.json({ mensaje: 'Tarea creada correctamente' });
        });
    });
});
// ✅ RF/RNF cubiertos: [RF-03]

// ==========================================
// PUT -> COMPLETAR TAREA
// ==========================================
app.put('/tareas/:id', validateToken, (req, res) => {
    const { id } = req.params;

    console.log('📌 Completar ID:', id);

    const sql = 'UPDATE tareas SET completada = 1 WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error UPDATE:', err);
            return res.status(500).json(err);
        }

        console.log('✔️ Filas afectadas:', result.affectedRows);

        res.json({ mensaje: 'Tarea completada' });
    });
});

// ==========================================
// PUT -> EDITAR CAMPOS DE TAREA
// ==========================================
app.put('/tareas/:id/editar', validateToken, (req, res) => {
    const { id } = req.params;
    const { titulo, resumen, expira } = req.body;

    console.log('✏️ Editar ID:', id, '| Datos:', { titulo, resumen, expira });

    const sql = 'UPDATE tareas SET titulo = ?, resumen = ?, expira = ? WHERE id = ?';

    db.query(sql, [titulo, resumen, expira, id], (err, result) => {
        if (err) {
            console.error('❌ Error UPDATE editar:', err);
            return res.status(500).json(err);
        }

        console.log('✔️ Filas editadas:', result.affectedRows);

        res.json({ mensaje: 'Tarea editada correctamente' });
    });
});

// ==========================================
// DELETE -> ELIMINAR TAREA
// ==========================================
app.delete('/tareas/:id', validateToken, (req, res) => {
    const { id } = req.params;

    console.log('🗑️ Eliminar ID:', id);

    const sql = 'DELETE FROM tareas WHERE id = ?';

    db.query(sql, [id], (err) => {
        if (err) {
            console.error('❌ Error DELETE:', err);
            return res.status(500).json(err);
        }

        res.json({ mensaje: 'Tarea eliminada' });
    });
});

// ==========================================
// SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Servidor corriendo en el puerto ${PORT}`);
});