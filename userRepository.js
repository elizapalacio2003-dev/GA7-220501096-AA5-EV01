// userRepository.js
// -----------------------------------------------------------------------
// Persistencia de usuarios en la base de datos MySQL alojada en Railway
// -----------------------------------------------------------------------

const mysql = require('mysql2/promise');

// Cadena de conexión a MySQL en Railway (reemplaza con tu variable de entorno o URL real)
const connectionUri = process.env.MYSQL_URL || 'mysql://root:KVbOysIaWIdhpxComTgYwsCMsrAKCdjY@metro.proxy.rlwy.net:45595/railway';

// Creación del pool de conexiones
const pool = mysql.createPool(connectionUri);

/**
 * Busca un usuario por su nombre exacto en la tabla 'usuarios'
 * @param {string} usuario - Nombre del usuario a buscar
 * @returns {Promise<Object|null>} - Retorna el objeto del usuario o null si no lo encuentra
 */
async function buscarUsuario(usuario) {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error al consultar el usuario en MySQL:', error.message);
    throw error;
  }
}

/**
 * Registra un nuevo usuario en la base de datos
 * @param {Object} datosUsuario - Objeto con { usuario, password }
 */
async function guardarUsuario({ usuario, password }) {
  try {
    await pool.query(
      'INSERT INTO usuarios (usuario, password) VALUES (?, ?)',
      [usuario, password]
    );
  } catch (error) {
    console.error('Error al guardar el usuario en MySQL:', error.message);
    throw error;
  }
}



module.exports = {
  buscarUsuario,
  guardarUsuario
};