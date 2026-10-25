## Requisitos previos

- Node.js y npm
- Python 3.11 (TensorFlow no es compatible con versiones muy recientes de Python, como 3.13/3.14)

## IA (Python)

```bash
cd mnist-classifier-ai
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn index:app --host 0.0.0.0 --port 8000
```

Se inicia en `http://localhost:8000`.

## Backend (Node)

```bash
cd mnist-classifier-back
npm install
npx tsc && node dist/index.js
```

Se inicia en `http://localhost:3001`. Observación: `npm run dev` (ts-node) está roto por una incompatibilidad de tipos de multer, ver [issue #1](https://github.com/felipe-sant/mnist-classifier-back/issues/1). Usa el build manual de arriba como alternativa mientras no se corrija.

## Frontend (React)

```bash
cd mnist-classifier-front
npm install
npm start
```

Se inicia en `http://localhost:3000`.

## Observación

En producción, los tres servicios apuntan a URLs fijas (Vercel/Railway). Para probar localmente con los servicios locales, es necesario actualizar temporalmente las URLs en `IA.service.ts` (back) y `UploadImage.ts` (front).
