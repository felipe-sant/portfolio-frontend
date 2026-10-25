## Overview

The project is split into two parts, in separate repositories:

- [player-profile-clustering-ai](https://github.com/felipe-sant/player-profile-clustering-ai) — Python. K-Means model training notebook, export to ONNX.
- [player-profile-clustering-service](https://github.com/felipe-sant/player-profile-clustering-service) — Node.js/TypeScript. API that runs inference on the exported model and queries athlete metrics in PostgreSQL.

## Data flow

1. Session metrics are loaded from a spreadsheet (`players.xlsx`) and filtered (e.g., matches with a minimum distance volume).
2. A derived metric ("Explosividade", explosiveness) is calculated from sprint, distance and top speed.
3. The metrics are normalized (StandardScaler) and used to train a K-Means with 4 clusters.
4. The clusters are named automatically based on the characteristics of the centroids (e.g., high intensity and short sprint = "explosivo", explosive).
5. The trained pipeline (normalization + K-Means) is exported to ONNX, along with the normalizer parameters.
6. The Node.js service loads the ONNX model through `onnxruntime-node`, normalizes the input data with the same parameters used in training, runs inference and interprets the result (cluster + confidence).

## Why ONNX instead of keeping a Python service

Running inference in Node.js avoids keeping two runtimes (Python + Node) in production. The model trained in Python is exported once, and the service that consumes it does not need any AI dependency besides ONNX Runtime.
