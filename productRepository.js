// productRepository.js
const mysql = require('mysql2/promise');

const connectionUri = process.env.MYSQL_URL || 'mysql://root:KVbOysIaWIdhpxComTgYwsCMsrAKCdjY@metro.proxy.rlwy.net:45595/railway';
const pool = mysql.createPool(connectionUri);

/**
 * Obtiene la lista de todos los productos
 */
async function obtenerProductos() {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    return rows;
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    throw error;
  }
}

/**
 * Obtiene un producto por su ID
 */
async function obtenerProductoPorId(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error al obtener producto por ID:', error.message);
    throw error;
  }
}

/**
 * Crea un nuevo producto
 */
async function crearProducto(datosProducto) {
  const { nombre_producto, categoria, talla, color, precio, stock, descripcion, url_imagen } = datosProducto;
  try {
    const [resultado] = await pool.query(
      `INSERT INTO productos (nombre_producto, categoria, talla, color, precio, stock, descripcion, url_imagen) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre_producto, categoria, talla, color, precio, stock, descripcion, url_imagen]
    );
    return resultado.insertId;
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    throw error;
  }
}
/**
 * Elimina un producto por su ID
 */
async function eliminarProducto(id) {
  try {
    const [resultado] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);
    return resultado.affectedRows > 0; // Retorna true si eliminó algún registro
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    throw error;
  }
}
/**
 * Actualiza un producto por su ID
 */
async function actualizarProducto(id, datosProducto) {
  const { nombre_producto, categoria, talla, color, precio, stock, descripcion, url_imagen } = datosProducto;
  try {
    const [resultado] = await pool.query(
      `UPDATE productos 
       SET nombre_producto = ?, categoria = ?, talla = ?, color = ?, precio = ?, stock = ?, descripcion = ?, url_imagen = ?
       WHERE id_producto = ?`,
      [nombre_producto, categoria, talla, color, precio, stock, descripcion, url_imagen, id]
    );
    return resultado.affectedRows > 0; // Retorna true si encontró el producto y ejecutó los cambios
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto,
  crearProducto,
  actualizarProducto
};