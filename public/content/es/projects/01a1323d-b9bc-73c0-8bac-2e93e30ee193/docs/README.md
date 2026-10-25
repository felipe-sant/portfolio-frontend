## Contexto

Proyecto personal para aplicar aprendizaje no supervisado (K-Means) a un problema real de ciencias del deporte: agrupar atletas de fútbol en perfiles de rendimiento físico a partir de métricas de sesión (distancia recorrida, sprints, velocidad máxima, intensidad), para apoyar decisiones tácticas y ajustes de entrenamiento.

## Mi rol

Desarrollé yo solo todo el pipeline: desde el entrenamiento del modelo en Python hasta la API de inferencia en producción. La API está en un repositorio propio, [player-profile-clustering-service](https://github.com/felipe-sant/player-profile-clustering-service), y consume el modelo exportado por este.

## Solución

El modelo se entrenó en Python con scikit-learn (pipeline de normalización + K-Means con 4 clusters), incluyendo una métrica derivada de "explosividad" calculada a partir de la distancia de sprint y la velocidad máxima. Los clusters resultantes se nombran automáticamente según las características de los centroides (por ejemplo, alta intensidad y sprint corto = "explosivo"). El modelo entrenado se exporta al formato ONNX y se sirve mediante una API en Node.js/TypeScript, que ejecuta la inferencia con ONNX Runtime sin depender de Python en producción. También calcula el perfil predominante de un atleta a lo largo de varios partidos, consultando una base de datos PostgreSQL.

## Decisiones técnicas

Exportar el modelo a ONNX y ejecutar la inferencia en Node.js (en lugar de mantener un servicio Python en producción) simplifica el despliegue y evita mantener dos runtimes distintos en ejecución. Los parámetros del normalizador (media y desviación estándar) se exportan junto con el modelo, para garantizar que el preprocesamiento en producción sea idéntico al del entrenamiento.

## Resultado

Probado con múltiples perfiles de entrada sintéticos: las métricas de alta intensidad y sprint corto se clasificaron correctamente como "explosivo", mientras que las métricas de larga distancia y baja intensidad se clasificaron como "resistente", lo que confirma que el modelo distingue los perfiles de forma coherente.

## Aprendizajes

Nombrar los clusters automáticamente según las características de los centroides (en lugar de etiquetarlos manualmente después de cada entrenamiento) vuelve el pipeline más robusto frente a reentrenamientos con datos distintos.
