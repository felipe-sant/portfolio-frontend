## Prerequisites

Node.js, npm and a MongoDB instance (local or Atlas).

## Backend

```bash
cd back
npm install
```

Create a `.env` file at the root of the back with:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

```bash
npm start
```

It starts at `http://localhost:3001`.

## Frontend

```bash
cd front
npm install
npm start
```

It starts at `http://localhost:3000`, already configured to consume the API at `http://localhost:3001`.

## Note

For local testing, a quick alternative is to run MongoDB through Docker:

```bash
docker run -d -p 27017:27017 mongo:7
```

And use `MONGODB_URI=mongodb://localhost:27017/despesas` in the `.env`.
