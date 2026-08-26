// userRepository.js
// -----------------------------------------------------------------------
// Este módulo funciona como una pequeña "base de datos" basada en un
// archivo JSON (data/usuarios.json). Permite leer y guardar los
// usuarios registrados sin necesidad de instalar un motor de base de
// datos externo, lo cual es suficiente para el alcance de esta
// evidencia académica.
// -----------------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const RUTA_ARCHIVO = path.join(__dirname, 'data', 'usuarios.json');

// Si el archivo de usuarios no existe todavía, lo creamos vacío
function asegurarArchivo() {
  if (!fs.existsSync(RUTA_ARCHIVO)) {
    fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Obtiene la lista completa de usuarios almacenados.
 * @returns {Array<{usuario: string, password: string}>}
 */
function obtenerUsuarios() {
  asegurarArchivo();
  const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
  return JSON.parse(contenido || '[]');
}

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} usuario
 * @returns {Object|undefined} el usuario encontrado o undefined
 */
function buscarUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  return usuarios.find(u => u.usuario === usuario);
}

/**
 * Guarda un nuevo usuario en el archivo JSON.
 * @param {{usuario: string, password: string}} nuevoUsuario
 */
function guardarUsuario(nuevoUsuario) {
  const usuarios = obtenerUsuarios();
  usuarios.push(nuevoUsuario);
  fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(usuarios, null, 2), 'utf-8');
}

module.exports = { obtenerUsuarios, buscarUsuario, guardarUsuario };
