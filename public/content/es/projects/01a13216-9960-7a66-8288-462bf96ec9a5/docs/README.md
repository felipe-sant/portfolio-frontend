## Contexto

Proyecto académico para practicar operaciones CRUD completas (crear, listar, editar, eliminar) con una base de datos NoSQL, construyendo tanto el frontend como la API.

## Mi rol

Desarrollé yo solo el frontend y el backend.

## Solución

La aplicación permite registrar gastos (descripción, fecha y valor), listar todos los gastos registrados, y editar y eliminar cada uno. El frontend consume una API REST propia, que persiste los datos en MongoDB mediante Mongoose.

## Decisiones técnicas

Separación clara entre frontend y backend en repositorios propios, unidos por un repositorio contenedor con git submodules. El backend expone una API REST simple en Express, y el frontend usa React puro (sin bibliotecas de estado), con llamadas directas a la API.

## Resultado

El CRUD funciona de punta a punta, probado creando, listando y confirmando la persistencia de un gasto. La interfaz, sin embargo, todavía está a nivel de prototipo (sin estilos reales, con textos de relleno como "Hello world"), por lo que el proyecto está marcado para un retrabajo visual futuro.

## Aprendizajes

La idea y la base funcional del proyecto son sólidas. La mayor carencia hoy es solo de acabado de la interfaz, no de lógica ni de arquitectura.
