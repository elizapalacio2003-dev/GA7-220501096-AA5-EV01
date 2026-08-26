# GA7-220501096-AA5-EV01
## Diseño y desarrollo de servicios web - caso

Servicio web REST que permite **registrar** usuarios e **iniciar sesión**,
desarrollado en **Node.js** utilizando únicamente módulos nativos (no
requiere instalar dependencias externas).

## Descripción del caso

Se requiere un servicio web para registro e inicio de sesión. El servicio
recibe un usuario y una contraseña:
- Si la autenticación es correcta, retorna el mensaje **"Autenticación satisfactoria."**
- Si la autenticación es incorrecta, retorna el mensaje **"Error en la autenticación."**

## Estructura del proyecto

```
GA7-220501096-AA5-EV01/
├── server.js            # Servidor HTTP y definición de los endpoints
├── passwordUtils.js      # Funciones para hashear y verificar contraseñas
├── userRepository.js     # Persistencia de usuarios en archivo JSON
├── data/
│   └── usuarios.json     # "Base de datos" de usuarios (se genera en tiempo de ejecución)
├── package.json
├── .gitignore
└── README.md
```

## Requisitos

- [Node.js](https://nodejs.org/) versión 14 o superior (no requiere instalar
  paquetes adicionales con `npm install`, ya que solo usa módulos nativos).

## Cómo ejecutar el servicio

```bash
node server.js
```

El servicio quedará disponible en: `http://localhost:3000`

## Endpoints disponibles

### 1. Registro de usuario
`POST /registro`

**Body (JSON):**
```json
{
  "usuario": "eliza",
  "password": "clave123"
}
```

**Respuesta exitosa (201):**
```json
{ "mensaje": "Usuario registrado exitosamente." }
```

**Respuesta si el usuario ya existe (409):**
```json
{ "mensaje": "El usuario ya se encuentra registrado." }
```

### 2. Inicio de sesión
`POST /login`

**Body (JSON):**
```json
{
  "usuario": "eliza",
  "password": "clave123"
}
```

**Respuesta si la autenticación es correcta (200):**
```json
{ "mensaje": "Autenticación satisfactoria." }
```

**Respuesta si la autenticación es incorrecta (401):**
```json
{ "mensaje": "Error en la autenticación." }
```

## Ejemplos de prueba con cURL

```bash
# Registrar un usuario
curl -X POST http://localhost:3000/registro \
  -H "Content-Type: application/json" \
  -d '{"usuario":"eliza","password":"clave123"}'

# Iniciar sesión con credenciales correctas
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"eliza","password":"clave123"}'

# Iniciar sesión con credenciales incorrectas
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"eliza","password":"clave-mala"}'
```

También se puede probar con **Postman** o **Thunder Client**, enviando
las mismas peticiones POST con un body tipo `raw JSON`.

## Seguridad

Las contraseñas nunca se almacenan en texto plano: se guardan usando el
algoritmo **scrypt** con una sal (salt) aleatoria por usuario, mediante
el módulo nativo `crypto` de Node.js.

## Control de versiones

Este proyecto fue versionado con **Git** y publicado en el siguiente
repositorio de GitHub:

https://github.com/elizapalacio2003-dev/GA7-220501096-AA5-EV01

## Autor

Eliza Palacio
