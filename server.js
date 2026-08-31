// server.js
// -----------------------------------------------------------------------
// Evidencia GA7-220501096-AA5-EV01
// Servicio web REST conectado a la base de datos en Railway (MySQL)
// -----------------------------------------------------------------------

const http = require('http');
const { hashPassword, verifyPassword } = require('./passwordUtils');
const { buscarUsuario, guardarUsuario } = require('./userRepository');
const { obtenerProductos, obtenerProductoPorId, eliminarProducto, crearProducto, actualizarProducto } = require('./productRepository');

const PUERTO = process.env.PORT || 3000;
/**
 * Función auxiliar para leer y parsear el cuerpo (body) de una petición
 * HTTP que llega en formato JSON.
 */
function leerCuerpoJSON(req) {
  return new Promise((resolve, reject) => {
    let datos = '';

    req.on('data', chunk => {
      datos += chunk;
    });

    req.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch (error) {
        reject(new Error('El cuerpo de la petición no es un JSON válido'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * Función auxiliar para enviar una respuesta en formato JSON con un
 * código de estado HTTP determinado.
 */
function enviarRespuesta(res, statusCode, objeto) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(objeto));
}

/**
 * Lógica del endpoint de REGISTRO.
 * Recibe { usuario, password } y crea un nuevo usuario en la BD de Railway.
 */
async function manejarRegistro(req, res) {
  try {
    const { usuario, password } = await leerCuerpoJSON(req);

    // Validación básica de los datos recibidos
    if (!usuario || !password) {
      return enviarRespuesta(res, 400, {
        mensaje: 'Debe enviar "usuario" y "password" para registrarse.'
      });
    }

    // Verificamos de forma asíncrona si el usuario ya existe en Railway
    const usuarioExistente = await buscarUsuario(usuario);
    if (usuarioExistente) {
      return enviarRespuesta(res, 409, {
        mensaje: 'El usuario ya se encuentra registrado.'
      });
    }

    // Guardamos la contraseña de forma segura (hasheada)
    const passwordHasheada = hashPassword(password);
    await guardarUsuario({ usuario, password: passwordHasheada });

    return enviarRespuesta(res, 201, {
      mensaje: 'Usuario registrado exitosamente.'
    });
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

/**
 * Lógica del endpoint de LOGIN (inicio de sesión).
 * Recibe { usuario, password } y valida las credenciales contra Railway.
 */
async function manejarLogin(req, res) {
  try {
    const { usuario, password } = await leerCuerpoJSON(req);

    if (!usuario || !password) {
      return enviarRespuesta(res, 400, {
        mensaje: 'Debe enviar "usuario" y "password" para iniciar sesión.'
      });
    }

    // Buscamos de forma asíncrona en la BD de Railway
    const usuarioEncontrado = await buscarUsuario(usuario);

    // Si el usuario no existe, la autenticación falla
    if (!usuarioEncontrado) {
      return enviarRespuesta(res, 401, {
        mensaje: 'Error en la autenticación.'
      });
    }

    // Comparamos la contraseña ingresada contra el hash almacenado
    const passwordCorrecta = verifyPassword(password, usuarioEncontrado.password);

    if (passwordCorrecta) {
      return enviarRespuesta(res, 200, {
        mensaje: 'Autenticación satisfactoria.'
      });
    } else {
      return enviarRespuesta(res, 401, {
        mensaje: 'Error en la autenticación.'
      });
    }
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

// --- MANEJADORES DE PRODUCTOS ---
async function manejarObtenerProductos(req, res) {
  try {
    const productos = await obtenerProductos();
    return enviarRespuesta(res, 200, productos);
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

async function manejarObtenerProductoPorId(req, res, id) {
  try {
    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return enviarRespuesta(res, 404, { mensaje: 'Producto no encontrado.' });
    }
    return enviarRespuesta(res, 200, producto);
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

async function manejarCrearProducto(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    if (!datos.nombre_producto || !datos.precio) {
      return enviarRespuesta(res, 400, { mensaje: 'El nombre_producto y precio son obligatorios.' });
    }
    const idNuevo = await crearProducto(datos);
    return enviarRespuesta(res, 201, {
      mensaje: 'Producto creado exitosamente.',
      id_producto: idNuevo
    });
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

async function manejarEliminarProducto(req, res, id) {
  try {
    const eliminado = await eliminarProducto(id);
    if (!eliminado) {
      return enviarRespuesta(res, 404, { mensaje: 'Producto no encontrado o ya eliminado.' });
    }
    return enviarRespuesta(res, 200, { mensaje: 'Producto eliminado exitosamente.' });
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}

async function manejarActualizarProducto(req, res, id) {
  try {
    const datos = await leerCuerpoJSON(req);
    if (!datos.nombre_producto || !datos.precio) {
      return enviarRespuesta(res, 400, { mensaje: 'El nombre_producto y precio son obligatorios.' });
    }
    const actualizado = await actualizarProducto(id, datos);
    if (!actualizado) {
      return enviarRespuesta(res, 404, { mensaje: 'Producto no encontrado.' });
    }
    return enviarRespuesta(res, 200, { mensaje: 'Producto actualizado exitosamente.' });
  } catch (error) {
    return enviarRespuesta(res, 500, { mensaje: error.message });
  }
}



// Creamos el servidor HTTP y enrutamos las peticiones según método y ruta
const servidor = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Validación de rutas con ID numérico (ejemplo: /productos/1)
  const coincidenciaProductoId = url.match(/^\/productos\/(\d+)$/);

  if (method === 'POST' && url === '/registro') {
    await manejarRegistro(req, res);
  } else if (method === 'POST' && url === '/login') {
    await manejarLogin(req, res);
  } else if (method === 'GET' && url === '/productos') {
    await manejarObtenerProductos(req, res);
  } else if (method === 'POST' && url === '/productos') {
    await manejarCrearProducto(req, res);
  } else if (method === 'GET' && coincidenciaProductoId) {
    const id = coincidenciaProductoId[1];
    await manejarObtenerProductoPorId(req, res, id);
  } else if (method === 'DELETE' && coincidenciaProductoId) {
    const id = coincidenciaProductoId[1];
    await manejarEliminarProducto(req, res, id);
  } else if (method === 'PUT' && coincidenciaProductoId) {
    const id = coincidenciaProductoId[1];
    await manejarActualizarProducto(req, res, id);
  } else {
    enviarRespuesta(res, 404, { mensaje: 'Ruta no encontrada.' });
  }
});

servidor.listen(PUERTO, () => {
  console.log(`Servicio web escuchando en http://localhost:${PUERTO}`);
  console.log('Endpoints disponibles:');
  console.log('  POST /registro   { "usuario": "...", "password": "..." }');
  console.log('  POST /login      { "usuario": "...", "password": "..." }');
  console.log('  GET  /productos');
  console.log('  POST /productos  { "nombre_producto": "...", ... }');
  console.log('  GET    /productos/:id');
  console.log('  DELETE /productos/:id');
  console.log('  UPDATE /productos/:id');
});