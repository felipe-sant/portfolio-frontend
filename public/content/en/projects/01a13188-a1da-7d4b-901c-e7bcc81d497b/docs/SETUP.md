## Pré-requisitos

Node.js e npm instalados.

## Backend

```bash
cd maps-back
npm install
npm run dev
```

Sobe em `http://localhost:3001`, com as rotas prefixadas em `/api`.

## Frontend

```bash
cd maps-front
npm install
npm start
```

Sobe em `http://localhost:3000`.

## Observação

O frontend em produção aponta para uma versão antiga do backend. Para testar localmente com o backend atual, é necessário atualizar a URL em `src/connection/BackendConnection.ts` (ver [issue #3](https://github.com/felipe-sant/maps-front/issues/3)).
