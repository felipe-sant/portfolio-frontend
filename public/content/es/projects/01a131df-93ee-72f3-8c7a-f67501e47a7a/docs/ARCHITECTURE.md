## Visión general

El proyecto se divide en tres servicios independientes, cada uno en su propio repositorio:

- mnist-classifier-front — React. Canvas de dibujo y presentación del resultado.
- mnist-classifier-back — Node.js/Express. Recibe la imagen mediante carga (Multer) y la reenvía al servicio de IA.
- mnist-classifier-ai — Python/FastAPI. Carga el modelo entrenado (Keras/TensorFlow) y devuelve la predicción.

## Flujo de datos

1. El usuario dibuja en el canvas (front).
2. El front convierte el canvas en imagen y la envía por POST al back (`/ia/predict`).
3. El back reenvía la imagen, vía multipart/form-data, al servicio de IA (`/predict`).
4. La IA preprocesa la imagen (escala de grises, redimensionamiento a 28x28, normalización) y ejecuta la inferencia en el modelo.
5. El resultado (dígito predicho) vuelve por la misma cadena hasta el front.

## Por qué tres servicios separados

El back en Node no tiene un runtime adecuado para ejecutar modelos TensorFlow/Keras directamente. Separar la IA en un servicio Python permite usar las bibliotecas nativas del ecosistema, manteniendo el back en Node como una capa delgada de integración (carga, validación, enrutamiento) entre el front y la IA.
