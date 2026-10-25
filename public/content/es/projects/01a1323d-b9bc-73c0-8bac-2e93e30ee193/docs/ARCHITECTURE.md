## Visión general

El proyecto se divide en dos partes, en repositorios separados:

- [player-profile-clustering-ai](https://github.com/felipe-sant/player-profile-clustering-ai) — Python. Notebook de entrenamiento del modelo K-Means, exportación a ONNX.
- [player-profile-clustering-service](https://github.com/felipe-sant/player-profile-clustering-service) — Node.js/TypeScript. API que ejecuta la inferencia del modelo exportado y consulta métricas de atletas en PostgreSQL.

## Flujo de datos

1. Las métricas de sesión se cargan desde una planilla (`players.xlsx`) y se filtran (por ejemplo, partidos con un volumen mínimo de distancia).
2. Se calcula una métrica derivada ("Explosividade", explosividad) a partir del sprint, la distancia y la velocidad máxima.
3. Las métricas se normalizan (StandardScaler) y se usan para entrenar un K-Means con 4 clusters.
4. Los clusters se nombran automáticamente según las características de los centroides (por ejemplo, alta intensidad y sprint corto = "explosivo").
5. El pipeline entrenado (normalización + K-Means) se exporta a ONNX, junto con los parámetros del normalizador.
6. El servicio Node.js carga el modelo ONNX mediante `onnxruntime-node`, normaliza los datos de entrada con los mismos parámetros del entrenamiento, ejecuta la inferencia e interpreta el resultado (cluster + confianza).

## Por qué ONNX en lugar de mantener un servicio Python

Ejecutar la inferencia en Node.js evita mantener dos runtimes (Python + Node) en producción. El modelo entrenado en Python se exporta una sola vez, y el servicio que lo consume no necesita ninguna dependencia de IA además de ONNX Runtime.
