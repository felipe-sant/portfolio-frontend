## Pré-requisitos

Node.js, npm e uma instância do MongoDB (local ou Atlas).

## Backend

```bash
cd back
npm install
```

Crie um arquivo `.env` na raiz do back com:

```env
MONGODB_URI=sua_connection_string_do_mongodb
PORT=3001
```

```bash
npm start
```

Sobe em `http://localhost:3001`.

## Frontend

```bash
cd front
npm install
npm start
```

Sobe em `http://localhost:3000`, já configurado para consumir a API em `http://localhost:3001`.

## Observação

Para testes locais, uma alternativa rápida é rodar um MongoDB via Docker:

```bash
docker run -d -p 27017:27017 mongo:7
```

E usar `MONGODB_URI=mongodb://localhost:27017/despesas` no `.env`.
