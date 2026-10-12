## Contexto

Projeto pessoal para praticar o ciclo completo de um produto com IA: treinar/usar um modelo de reconhecimento de dígitos manuscritos e expor isso numa aplicação web interativa, do desenho até a predição.

## Mi rol

Desenvolvi sozinho as três camadas: o frontend (canvas de desenho), o backend (intermediário entre front e IA) e o serviço de inferência em Python.

## Solución

O usuário desenha um número de 0 a 9 num canvas HTML. Ao clicar em "Adivinhar", o frontend envia a imagem desenhada para um backend em Node.js/Express, que repassa a imagem para um serviço separado em Python (FastAPI) responsável por carregar o modelo treinado (Keras/TensorFlow) e retornar o dígito previsto.

## Decisiones técnicas

Separar a inferência de IA num serviço Python próprio, independente do backend em Node, permite usar bibliotecas de IA nativas do ecossistema Python (TensorFlow/Keras) sem forçar isso dentro do runtime JavaScript. O backend em Node atua só como intermediário/gateway, lidando com upload de arquivo (Multer) e repassando para o serviço de IA.

## Resultado

A aplicação funciona corretamente de ponta a ponta — testado localmente desenhando dígitos e conferindo a predição do modelo. A demo pública está com uma limitação: o serviço de IA hospedado no Railway está fora do ar (deploy gratuito expirado), então a predição falha em produção, mesmo com o resto da aplicação no ar normalmente. Bug documentado na [issue #1 do mnist-classifier-ai](https://github.com/felipe-sant/mnist-classifier-ai/issues/1).

## Aprendizajes

Arquitetar um sistema poliglota (Node.js + Python) com responsabilidades bem separadas, e lidar com os desafios de manter múltiplos serviços de deploys gratuitos diferentes no ar ao mesmo tempo.
