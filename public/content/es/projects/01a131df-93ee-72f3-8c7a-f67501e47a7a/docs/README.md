## Contexto

Proyecto personal para practicar el ciclo completo de un producto con IA: entrenar un modelo de reconocimiento de dígitos manuscritos y exponerlo en una aplicación web interactiva, desde el dibujo hasta la predicción.

## Mi rol

Desarrollé yo solo las tres capas: el frontend (canvas de dibujo), el backend (intermediario entre front e IA) y el servicio de inferencia en Python, además de entrenar el modelo.

## Solución

El usuario dibuja un número del 0 al 9 en un canvas HTML. Al hacer clic en "Adivinhar" (Adivinar), el frontend envía la imagen dibujada a un backend en Node.js/Express, que la reenvía a un servicio separado en Python (FastAPI) responsable de cargar el modelo entrenado (Keras/TensorFlow) y devolver el dígito predicho.

## Decisiones técnicas

Separar la inferencia de IA en un servicio Python propio, independiente del backend en Node, permite usar bibliotecas de IA nativas del ecosistema Python (TensorFlow/Keras) sin forzarlas dentro del runtime de JavaScript. El backend en Node actúa solo como intermediario/gateway, encargándose de la carga de archivos (Multer) y de reenviarlos al servicio de IA.

## Resultado

La aplicación funciona correctamente de punta a punta, probada localmente dibujando dígitos y verificando la predicción del modelo. La demo pública tiene una limitación: el servicio de IA alojado en Railway está caído (el despliegue gratuito expiró), así que la predicción falla en producción aunque el resto de la aplicación esté en línea con normalidad. Bug documentado en la [issue #1 de mnist-classifier-ai](https://github.com/felipe-sant/mnist-classifier-ai/issues/1).

## Aprendizajes

Diseñar la arquitectura de un sistema políglota (Node.js + Python) con responsabilidades bien separadas, y lidiar con los desafíos de mantener en línea varios servicios alojados en distintos planes gratuitos al mismo tiempo.
