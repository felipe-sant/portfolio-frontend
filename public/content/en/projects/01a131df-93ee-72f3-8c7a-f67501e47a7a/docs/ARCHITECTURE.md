## Visão geral

O projeto é dividido em três serviços independentes, cada um em seu próprio repositório:

- mnist-classifier-front — React. Canvas de desenho e exibição do resultado.
- mnist-classifier-back — Node.js/Express. Recebe a imagem via upload (Multer) e repassa para o serviço de IA.
- mnist-classifier-ai — Python/FastAPI. Carrega o modelo treinado (Keras/TensorFlow) e retorna a predição.

## Fluxo de dados

1. Usuário desenha no canvas (front).
2. Front converte o canvas em imagem e envia via POST para o back (`/ia/predict`).
3. Back repassa a imagem, via multipart/form-data, para o serviço de IA (`/predict`).
4. IA pré-processa a imagem (grayscale, resize 28x28, normalização) e roda a inferência no modelo.
5. Resultado (dígito previsto) volta pela mesma cadeia até o front.

## Por que três serviços separados

O back em Node não tem um runtime adequado pra rodar modelos TensorFlow/Keras diretamente. Separar a IA num serviço Python permite usar as bibliotecas nativas do ecossistema, mantendo o back em Node como uma camada fina de integração (upload, validação, roteamento) entre o front e a IA.
