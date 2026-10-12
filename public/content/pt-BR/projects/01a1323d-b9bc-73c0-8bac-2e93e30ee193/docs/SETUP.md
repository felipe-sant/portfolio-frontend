## Treinamento do modelo (opcional — já existe um modelo treinado em model/)

```bash
cd player-profile-clustering-ai
pip install -r requirements.txt
```

Abrir e rodar `src/k-means_model.ipynb` (Jupyter). Gera `model/player-profile-clustering.onnx` e `model/scaler_params.json`.

## Serviço de inferência

```bash
cd player-profile-clustering-service
npm install
```

Criar um `.env` com:

```env
POSTGRESQL_URL=sua_connection_string_do_postgres
```

(obrigatório só para o endpoint `/api/athlete/metrics`; o endpoint `/api/match/predict` funciona sem banco, só com o modelo.)

```bash
npm run dev
```

Sobe em `http://localhost:3000`.

## Testando a predição sem banco

```bash
curl -X POST http://localhost:3000/api/match/predict \
  -H "Content-Type: application/json" \
  -d '{"distanceM": 9500, "highIntensityRunningM": 1200, "highIntensityEvents": 35, "sprintDistanceM": 450, "numberOfSprints": 18, "topSpeedKph": 32.5, "avgSpeedKph": 7.2, "accelerations": 40, "decelerations": 38, "metresPerMinuteM": 105, "workloadIntensity": 0.78}'
```
