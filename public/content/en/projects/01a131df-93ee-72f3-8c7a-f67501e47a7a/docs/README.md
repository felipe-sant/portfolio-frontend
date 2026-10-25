## Context

Personal project to practice the full cycle of an AI product: training a handwritten digit recognition model and exposing it in an interactive web application, from the drawing to the prediction.

## My role

I developed all three layers on my own: the frontend (drawing canvas), the backend (intermediary between front and AI) and the Python inference service, in addition to training the model.

## Solution

The user draws a number from 0 to 9 on an HTML canvas. When clicking "Adivinhar" (Guess), the frontend sends the drawn image to a Node.js/Express backend, which forwards it to a separate Python service (FastAPI) responsible for loading the trained model (Keras/TensorFlow) and returning the predicted digit.

## Technical decisions

Separating AI inference into its own Python service, independent from the Node backend, makes it possible to use AI libraries native to the Python ecosystem (TensorFlow/Keras) without forcing them into the JavaScript runtime. The Node backend acts only as an intermediary/gateway, handling file upload (Multer) and forwarding it to the AI service.

## Outcome

The application works correctly end to end, tested locally by drawing digits and checking the model's prediction. The public demo has a limitation: the AI service hosted on Railway is down (free deploy expired), so the prediction fails in production even though the rest of the application is up normally. Bug documented in [issue #1 of mnist-classifier-ai](https://github.com/felipe-sant/mnist-classifier-ai/issues/1).

## Learnings

Architecting a polyglot system (Node.js + Python) with well-separated responsibilities, and dealing with the challenges of keeping several services hosted on different free plans up at the same time.
