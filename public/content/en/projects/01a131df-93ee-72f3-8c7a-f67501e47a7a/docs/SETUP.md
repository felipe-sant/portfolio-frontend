## Pré-requisitos

- Node.js e npm
- Python 3.11 (TensorFlow não é compatível com versões muito recentes do Python, como 3.13/3.14)

## IA (Python)

```bash
cd mnist-classifier-ai
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn index:app --host 0.0.0.0 --port 8000
```

Sobe em `http://localhost:8000`.

## Backend (Node)

```bash
cd mnist-classifier-back
npm install
npx tsc && node dist/index.js
```

Sobe em `http://localhost:3001`. Observação: `npm run dev` (ts-node) está quebrado por uma incompatibilidade de tipos do multer — ver [issue #1](https://github.com/felipe-sant/mnist-classifier-back/issues/1). Use o build manual acima como alternativa enquanto isso não é corrigido.

## Frontend (React)

```bash
cd mnist-classifier-front
npm install
npm start
```

Sobe em `http://localhost:3000`.

## Observação

Os três serviços, em produção, apontam para URLs fixas (Vercel/Railway). Para testar localmente com os serviços locais, é necessário atualizar temporariamente as URLs em `IA.service.ts` (back) e `UploadImage.ts` (front).
