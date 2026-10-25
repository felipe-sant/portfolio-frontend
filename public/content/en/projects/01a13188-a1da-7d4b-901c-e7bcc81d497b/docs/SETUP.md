## Prerequisites

Node.js and npm installed. The [maps](https://github.com/felipe-sant/maps) repository brings the backend and the frontend together as submodules; clone it with `git clone --recurse-submodules https://github.com/felipe-sant/maps.git`.

## Backend

```bash
cd maps/back
npm install
npm run dev
```

It starts at `http://localhost:3001`, with routes prefixed with `/api`.

## Frontend

```bash
cd maps/front
npm install
npm start
```

It starts at `http://localhost:3000`.

## Note

The production frontend points to an old version of the backend. To test locally with the current backend, you need to update the URL in `src/connection/BackendConnection.ts` (see [issue #3](https://github.com/felipe-sant/maps-front/issues/3)).
