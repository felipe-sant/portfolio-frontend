## Context

Personal project to apply unsupervised learning (K-Means) to a real sports science problem: grouping soccer athletes into physical performance profiles from session metrics (distance covered, sprints, top speed, intensity), to support tactical decisions and training adjustments.

## My role

I developed the whole pipeline on my own: from training the model in Python to the inference API in production. The API lives in its own repository, [player-profile-clustering-service](https://github.com/felipe-sant/player-profile-clustering-service), and consumes the model exported by this one.

## Solution

The model was trained in Python with scikit-learn (normalization pipeline + K-Means with 4 clusters), including a derived "explosiveness" metric calculated from sprint distance and top speed. The resulting clusters are named automatically based on the characteristics of the centroids (e.g., high intensity and short sprint = "explosivo", explosive). The trained model is exported to the ONNX format and served by a Node.js/TypeScript API, which runs inference through ONNX Runtime without depending on Python in production. It also calculates an athlete's predominant profile across several matches, querying a PostgreSQL database.

## Technical decisions

Exporting the model to ONNX and running inference in Node.js (instead of keeping a Python service in production) simplifies deployment and avoids keeping two different runtimes running. The normalizer parameters (mean and standard deviation) are exported along with the model, to guarantee that preprocessing in production is identical to the one in training.

## Outcome

Tested with multiple synthetic input profiles: high-intensity metrics with short sprints were correctly classified as "explosivo" (explosive), while long-distance, low-intensity metrics were classified as "resistente" (endurance), confirming that the model distinguishes the profiles coherently.

## Learnings

Naming clusters automatically based on the characteristics of the centroids (instead of labeling manually after each training run) makes the pipeline more robust to retraining with different data.
