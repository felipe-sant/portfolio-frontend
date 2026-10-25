## Overview

The project is split into three independent services, each in its own repository:

- mnist-classifier-front — React. Drawing canvas and result display.
- mnist-classifier-back — Node.js/Express. Receives the image through upload (Multer) and forwards it to the AI service.
- mnist-classifier-ai — Python/FastAPI. Loads the trained model (Keras/TensorFlow) and returns the prediction.

## Data flow

1. The user draws on the canvas (front).
2. The front converts the canvas into an image and sends it via POST to the back (`/ia/predict`).
3. The back forwards the image, as multipart/form-data, to the AI service (`/predict`).
4. The AI preprocesses the image (grayscale, resize to 28x28, normalization) and runs inference on the model.
5. The result (predicted digit) returns through the same chain to the front.

## Why three separate services

The Node back does not have a suitable runtime to run TensorFlow/Keras models directly. Separating the AI into a Python service makes it possible to use the ecosystem's native libraries, keeping the Node back as a thin integration layer (upload, validation, routing) between the front and the AI.
