## Prerequisites

- Node.js and npm
- Python 3.11 (TensorFlow is not compatible with very recent Python versions, such as 3.13/3.14)

## AI (Python)

```bash
cd mnist-classifier-ai
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn index:app --host 0.0.0.0 --port 8000
```

It starts at `http://localhost:8000`.

## Backend (Node)

```bash
cd mnist-classifier-back
npm install
npx tsc && node dist/index.js
```

It starts at `http://localhost:3001`. Note: `npm run dev` (ts-node) is broken by a multer type incompatibility, see [issue #1](https://github.com/felipe-sant/mnist-classifier-back/issues/1). Use the manual build above as an alternative until this is fixed.

## Frontend (React)

```bash
cd mnist-classifier-front
npm install
npm start
```

It starts at `http://localhost:3000`.

## Note

In production, the three services point to fixed URLs (Vercel/Railway). To test locally with the local services, you need to temporarily update the URLs in `IA.service.ts` (back) and `UploadImage.ts` (front).
