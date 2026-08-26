// server.js
// -----------------------------------------------------------------------
// Evidencia GA7-220501096-AA5-EV01
// Diseño y desarrollo de servicios web - caso.
//
// Servicio web REST que expone dos endpoints:
//   1) POST /registro  -> Registra un nuevo usuario (usuario + contraseña)
//   2) POST /login     -> Autentica un usuario existente
//
// Se construyó usando únicamente módulos nativos de Node.js (http),
// por lo que no requiere instalar dependencias externas para funcionar.
// -----------------------------------------------------------------------

const http = require('http');
const { hashPassword, verifyPassword } = require('./passwordUtils');
const { buscarUsuario, guardarUsuario } = require('./userRepository');

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
        // Si no envían body, devolvemos un objeto vacío
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
 * Recibe { usuario, password } y crea un nuevo usuario si no existe.
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

    // Verificamos que el usuario no exista previamente
    if (buscarUsuario(usuario)) {
      return enviarRespuesta(res, 409, {
        mensaje: 'El usuario ya se encuentra registrado.'
      });
    }

    // Guardamos la contraseña de forma segura (hasheada), nunca en texto plano
    const passwordHasheada = hashPassword(password);
    guardarUsuario({ usuario, password: passwordHasheada });

    return enviarRespuesta(res, 201, {
      mensaje: 'Usuario registrado exitosamente.'
    });
  } catch (error) {
    return enviarRespuesta(res, 400, { mensaje: error.message });
  }
}

/**
 * Lógica del endpoint de LOGIN (inicio de sesión).
 * Recibe { usuario, password } y valida las credenciales contra
 * lo almacenado en el repositorio de usuarios.
 */
async function manejarLogin(req, res) {
  try {
    const { usuario, password } = await leerCuerpoJSON(req);

    if (!usuario || !password) {
      return enviarRespuesta(res, 400, {
        mensaje: 'Debe enviar "usuario" y "password" para iniciar sesión.'
      });
    }

    const usuarioEncontrado = buscarUsuario(usuario);

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
    return enviarRespuesta(res, 400, { mensaje: error.message });
  }
}

// Creamos el servidor HTTP y enrutamos las peticiones según método y ruta
const servidor = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === 'POST' && url === '/registro') {
    await manejarRegistro(req, res);
  } else if (method === 'POST' && url === '/login') {
    await manejarLogin(req, res);
  } else {
    // Cualquier otra ruta/método no soportado
    enviarRespuesta(res, 404, { mensaje: 'Ruta no encontrada.' });
  }
});

servidor.listen(PUERTO, () => {
  console.log(`Servicio web escuchando en http://localhost:${PUERTO}`);
  console.log('Endpoints disponibles:');
  console.log('  POST /registro  { "usuario": "...", "password": "..." }');
  console.log('  POST /login     { "usuario": "...", "password": "..." }');
});
