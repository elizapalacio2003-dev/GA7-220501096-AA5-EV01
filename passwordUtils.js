// passwordUtils.js
// -----------------------------------------------------------------------
// Este módulo se encarga de todo lo relacionado con el manejo seguro
// de contraseñas: generar un "hash" (huella) de la contraseña y
// verificar si una contraseña ingresada coincide con el hash guardado.
//
// Se usa el módulo nativo "crypto" de Node.js (no requiere instalar
// dependencias externas) con el algoritmo scrypt, que es robusto para
// almacenar contraseñas de forma segura.
// -----------------------------------------------------------------------

const crypto = require('crypto');

/**
 * Genera un hash seguro de la contraseña usando scrypt + una sal (salt)
 * aleatoria. La sal evita que dos contraseñas iguales generen el mismo
 * hash, protegiendo contra ataques de diccionario/rainbow tables.
 *
 * @param {string} password - Contraseña en texto plano.
 * @returns {string} Cadena con el formato "salt:hash" que se guarda en la BD.
 */
function hashPassword(password) {
  // Generamos una sal aleatoria de 16 bytes
  const salt = crypto.randomBytes(16).toString('hex');

  // Generamos el hash de la contraseña combinada con la sal
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  // Guardamos la sal junto con el hash separados por ":"
  return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña en texto plano coincide con el hash
 * almacenado (que incluye la sal usada originalmente).
 *
 * @param {string} password - Contraseña ingresada por el usuario.
 * @param {string} storedHash - Valor guardado en la BD con formato "salt:hash".
 * @returns {boolean} true si la contraseña es correcta, false si no.
 */
function verifyPassword(password, storedHash) {
  try {
    const [salt, originalHash] = storedHash.split(':');

    // Recalculamos el hash con la misma sal para poder compararlos
    const hashToCompare = crypto.scryptSync(password, salt, 64).toString('hex');

    // Comparación segura contra ataques de "timing attack"
    return crypto.timingSafeEqual(
      Buffer.from(originalHash, 'hex'),
      Buffer.from(hashToCompare, 'hex')
    );
  } catch (error) {
    // Si algo falla en el formato del hash, se considera inválido
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
