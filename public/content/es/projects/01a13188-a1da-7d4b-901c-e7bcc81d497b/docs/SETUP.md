## Requisitos previos

Node.js y npm instalados. El repositorio [maps](https://github.com/felipe-sant/maps) reúne el backend y el frontend como submódulos; clónalo con `git clone --recurse-submodules https://github.com/felipe-sant/maps.git`.

## Backend

```bash
cd maps/back
npm install
npm run dev
```

Se inicia en `http://localhost:3001`, con las rutas con el prefijo `/api`.

## Frontend

```bash
cd maps/front
npm install
npm start
```

Se inicia en `http://localhost:3000`.

## Observación

El frontend en producción apunta a una versión antigua del backend. Para probar localmente con el backend actual, es necesario actualizar la URL en `src/connection/BackendConnection.ts` (ver [issue #3](https://github.com/felipe-sant/maps-front/issues/3)).
