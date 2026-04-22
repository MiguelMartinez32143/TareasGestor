// ==========================================
// SETUP-DB: Script de Inicialización de Base de Datos (RNF-06)
// ==========================================
// Uso: node setup-db.js
// Este script crea la base de datos y todas las tablas necesarias
// para que el sistema funcione en cualquier host con Node.js y MySQL.
// ==========================================

require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Configuración de conexión (sin base de datos, se crea primero)
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'tareas_db';

// Conexión inicial sin seleccionar base de datos
const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('❌ No se pudo conectar a MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Conexión a MySQL establecida.');

    // Paso 1: Crear base de datos si no existe
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``, (err) => {
        if (err) {
            console.error('❌ Error creando base de datos:', err.message);
            process.exit(1);
        }
        console.log(`✅ Base de datos "${DB_NAME}" verificada/creada.`);

        // Paso 2: Usar la base de datos
        connection.query(`USE \`${DB_NAME}\``, (err) => {
            if (err) {
                console.error('❌ Error seleccionando base de datos:', err.message);
                process.exit(1);
            }

            // Paso 3: Crear tablas en orden
            crearTablas();
        });
    });
});

function crearTablas() {
    const tablaAdmins = `
    CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

    const tablaUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(10) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        avatar VARCHAR(255) NOT NULL DEFAULT 'usuario-1.png'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

    const tablaTareas = `
    CREATE TABLE IF NOT EXISTS tareas (
        id VARCHAR(50) PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        resumen TEXT,
        expira VARCHAR(50),
        idUsuario VARCHAR(10) NOT NULL,
        completada TINYINT DEFAULT 0,
        INDEX idx_idUsuario (idUsuario)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

    // Ejecutar en secuencia
    connection.query(tablaAdmins, (err) => {
        if (err) {
            console.error('❌ Error creando tabla administradores:', err.message);
            process.exit(1);
        }
        console.log('✅ Tabla "administradores" lista.');

        connection.query(tablaUsuarios, (err) => {
            if (err) {
                console.error('❌ Error creando tabla usuarios:', err.message);
                process.exit(1);
            }
            console.log('✅ Tabla "usuarios" lista.');

            connection.query(tablaTareas, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla tareas:', err.message);
                    process.exit(1);
                }
                console.log('✅ Tabla "tareas" lista.');

                // Paso 4: Seed de datos iniciales
                seedDatos();
            });
        });
    });
}

function seedDatos() {
    // Verificar si ya hay administradores
    connection.query('SELECT COUNT(*) AS total FROM administradores', async (err, results) => {
        if (err) {
            console.error('❌ Error verificando admins:', err.message);
            finalizar();
            return;
        }

        if (results[0].total === 0) {
            try {
                const hashPassword = await bcrypt.hash('admin123', 10);
                connection.query(
                    'INSERT INTO administradores (username, password) VALUES (?, ?)',
                    ['admin', hashPassword],
                    (err) => {
                        if (err) {
                            console.error('❌ Error creando admin:', err.message);
                        } else {
                            console.log('✅ Admin inicial creado: username=admin, password=admin123');
                        }
                        seedUsuarios();
                    }
                );
            } catch (hashErr) {
                console.error('❌ Error hasheando password:', hashErr.message);
                seedUsuarios();
            }
        } else {
            console.log('ℹ️  Administradores ya existen. Seed de admins omitido.');
            seedUsuarios();
        }
    });
}

function seedUsuarios() {
    connection.query('SELECT COUNT(*) AS total FROM usuarios', (err, results) => {
        if (err) {
            console.error('❌ Error verificando usuarios:', err.message);
            finalizar();
            return;
        }

        if (results[0].total === 0) {
            const usuarios = [
                ['u1', 'Valeria Montes', 'usuario-1.png'],
                ['u2', 'Diego Navarro', 'usuario-2.png'],
                ['u3', 'Camila Rojas', 'usuario-3.png'],
                ['u4', 'Mateo Sandoval', 'usuario-4.png'],
                ['u5', 'Isabella Cruz', 'usuario-5.png'],
                ['u6', 'Javier Delgado', 'usuario-6.png'],
            ];

            connection.query(
                'INSERT INTO usuarios (id, nombre, avatar) VALUES ?',
                [usuarios],
                (err) => {
                    if (err) {
                        console.error('❌ Error sembrando usuarios:', err.message);
                    } else {
                        console.log('✅ 6 usuarios iniciales creados.');
                    }
                    finalizar();
                }
            );
        } else {
            console.log('ℹ️  Usuarios ya existen. Seed de usuarios omitido.');
            finalizar();
        }
    });
}

function finalizar() {
    console.log('\n========================================');
    console.log('✅ Inicialización de base de datos completada.');
    console.log('   Ahora puede ejecutar: node index.js');
    console.log('========================================');
    connection.end();
    process.exit(0);
}
