## Model training (optional)

```bash
cd player-profile-clustering-ai
pip install -r requirements.txt
```

Open and run `src/k-means_model.ipynb` (Jupyter). It generates `model/player-profile-clustering.onnx` and `model/scaler_params.json`.

## Inference service

```bash
cd player-profile-clustering-service
npm install
```

Create a `.env` with:

```env
POSTGRESQL_URL=your_postgres_connection_string
```

The variable is required only for the `/api/athlete/metrics` endpoint; `/api/match/predict` works without a database, with only the model.

```bash
npm run dev
```

It starts at `http://localhost:3000`.

## Testing the prediction without a database

```bash
curl -X POST http://localhost:3000/api/match/predict \
  -H "Content-Type: application/json" \
  -d '{"distanceM": 9500, "highIntensityRunningM": 1200, "highIntensityEvents": 35, "sprintDistanceM": 450, "numberOfSprints": 18, "topSpeedKph": 32.5, "avgSpeedKph": 7.2, "accelerations": 40, "decelerations": 38, "metresPerMinuteM": 105, "workloadIntensity": 0.78}'
```
