# Gestor de Tareas ADSO

Este proyecto es una aplicación FullStack para la gestión de tareas, con autenticación, persistencia en base de datos y un panel de administración.

## Documentación de Requerimientos: Gestión de Usuarios Real

Este documento resume las especificaciones técnicas cumplidas durante la transición del sistema de usuarios estáticos a una arquitectura profesional basada en persistencia de datos.

### 1. Requerimientos Funcionales (RF)

Los requerimientos funcionales definen los servicios que el sistema debe proporcionar y cómo debe reaccionar ante entradas particulares.

| ID | Requerimiento | Descripción |
|---|---|---|
| **RF-01** | Persistencia de Datos (MySQL) | El sistema debe almacenar la información de los usuarios de forma permanente en una base de datos relacional, eliminando la dependencia de archivos de código estáticos (`USUARIOS_FALSOS`). |
| **RF-02** | CRUD Completo de Usuarios | Se implementa una interfaz administrativa para Crear, Leer (Listar), Actualizar (nombre/avatar) y Eliminar usuarios del sistema. |
| **RF-03** | Integridad Referencial | Toda tarea creada en el sistema debe estar obligatoriamente vinculada a un id de usuario válido existente en la tabla usuarios. |
| **RF-04** | Gestión de Sesión para CRUD | Las funciones de escritura (POST, PUT, DELETE) sobre los usuarios deben ser accesibles únicamente por administradores autenticados mediante una sesión válida. |
| **RF-05** | Gestión de Avatares Dinámicos | El sistema debe permitir asignar y modificar una imagen de perfil a cada usuario seleccionándola de un catálogo de activos del servidor. |
| **RF-06** | Eliminación en Cascada | Al eliminar un usuario, el sistema debe limpiar automáticamente la base de datos eliminando todas las tareas que le pertenecen para evitar datos huérfanos. |
| **RF-07** | Reactividad Automatizada | La interfaz de usuario debe utilizar Angular Signals para asegurar que los cambios realizados (creación/edición) se reflejen globalmente en la aplicación sin recargas manuales. |

### 2. Requerimientos No Funcionales (RNF)

Los requerimientos no funcionales se refieren a las propiedades del sistema y las restricciones bajo las cuales opera.

| ID | Categoría | Requerimiento / Restricción |
|---|---|---|
| **RNF-01** | Seguridad | La comunicación entre el frontend y el backend debe estar protegida por un middleware de autenticación basado en Tokens JWT (JSON Web Token). |
| **RNF-02** | Usabilidad | La interfaz de gestión debe ser tipo "Single Page Application" (SPA) con modales animados, desenfoque de fondo (backdrop-filter) y transiciones suaves para una experiencia premium. |
| **RNF-03** | Robustez | El sistema debe incluir mecanismos de "fallback" para la interfaz. En caso de fallo en la carga de fuentes externas (como Google Fonts/Icons), se deben mostrar etiquetas en español legibles. |
| **RNF-04** | Localización | El 100% de las etiquetas de usuario, mensajes de éxito, errores y placeholders deben estar en idioma Español. |
| **RNF-05** | Escalabilidad | La arquitectura del backend debe ser capaz de manejar volúmenes crecientes de usuarios y tareas mediante el uso de comandos SQL optimizados. |
| **RNF-06** | Disponibilidad | Se incluye un script de inicialización (`setup-db.js`) para asegurar que el entorno de base de datos se pueda replicar en cualquier host compatible con Node.js y MySQL de forma rápida. |

## Guía de Instalación y Ejecución

### 1. Inicializar la Base de Datos

Ejecute el script de inicialización para crear la base de datos `tareas_db`, las tablas necesarias (`administradores`, `usuarios`, `tareas`) y sembrar los datos iniciales.

```bash
cd backend
node setup-db.js
```

### 2. Iniciar el Backend

```bash
cd backend
npm install
node index.js
```

El backend se ejecutará en `http://localhost:3000`.

### 3. Iniciar el Frontend

```bash
cd frontend
npm install
ng serve -o
```

La aplicación Angular se abrirá automáticamente en `http://localhost:4200`.

## Accesos por Defecto

**Administrador:**
- **Usuario:** `admin`
- **Contraseña:** `admin123`
