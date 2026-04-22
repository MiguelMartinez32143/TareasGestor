// ==========================================
// MIDDLEWARE: Validación de Token JWT
// ==========================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_gestor_tareas_2026';

function validateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
    }
}

module.exports = { validateToken, JWT_SECRET };

// ✅ RF/RNF cubiertos: [RNF-A1]
// ⚠️ CONFLICTO DETECTADO: Ninguno
