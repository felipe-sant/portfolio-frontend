## Entrenamiento del modelo (opcional)

```bash
cd player-profile-clustering-ai
pip install -r requirements.txt
```

Abre y ejecuta `src/k-means_model.ipynb` (Jupyter). Genera `model/player-profile-clustering.onnx` y `model/scaler_params.json`.

## Servicio de inferencia

```bash
cd player-profile-clustering-service
npm install
```

Crea un `.env` con:

```env
POSTGRESQL_URL=tu_connection_string_de_postgres
```

La variable es obligatoria solo para el endpoint `/api/athlete/metrics`; `/api/match/predict` funciona sin base de datos, solo con el modelo.

```bash
npm run dev
```

Se inicia en `http://localhost:3000`.

## Probando la predicción sin base de datos

```bash
curl -X POST http://localhost:3000/api/match/predict \
  -H "Content-Type: application/json" \
  -d '{"distanceM": 9500, "highIntensityRunningM": 1200, "highIntensityEvents": 35, "sprintDistanceM": 450, "numberOfSprints": 18, "topSpeedKph": 32.5, "avgSpeedKph": 7.2, "accelerations": 40, "decelerations": 38, "metresPerMinuteM": 105, "workloadIntensity": 0.78}'
```
