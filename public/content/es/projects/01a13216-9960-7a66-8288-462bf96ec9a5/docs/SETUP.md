## Requisitos previos

Node.js, npm y una instancia de MongoDB (local o Atlas).

## Backend

```bash
cd back
npm install
```

Crea un archivo `.env` en la raíz del back con:

```env
MONGODB_URI=tu_connection_string_de_mongodb
PORT=3001
```

```bash
npm start
```

Se inicia en `http://localhost:3001`.

## Frontend

```bash
cd front
npm install
npm start
```

Se inicia en `http://localhost:3000`, ya configurado para consumir la API en `http://localhost:3001`.

## Observación

Para pruebas locales, una alternativa rápida es ejecutar MongoDB con Docker:

```bash
docker run -d -p 27017:27017 mongo:7
```

Y usar `MONGODB_URI=mongodb://localhost:27017/despesas` en el `.env`.
