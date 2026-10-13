## Visão geral

O projeto é dividido em duas partes, em repositórios separados:

- [player-profile-clustering-ai](https://github.com/felipe-sant/player-profile-clustering-ai) — Python. Notebook de treinamento do modelo K-Means, exportação para ONNX.
- [player-profile-clustering-service](https://github.com/felipe-sant/player-profile-clustering-service) — Node.js/TypeScript. API que roda a inferência do modelo exportado e consulta métricas de atletas no PostgreSQL.

## Fluxo de dados

1. Métricas de sessão são carregadas de uma planilha (`players.xlsx`) e filtradas (ex.: partidas com volume mínimo de distância).
2. Uma métrica derivada ("Explosividade") é calculada a partir de sprint, distância e velocidade máxima.
3. As métricas são normalizadas (StandardScaler) e usadas para treinar um K-Means com 4 clusters.
4. Os clusters são nomeados automaticamente com base nas características dos centroides (ex.: alta intensidade e sprint curto = "explosivo").
5. O pipeline treinado (normalização + K-Means) é exportado para ONNX, junto com os parâmetros do normalizador.
6. O serviço Node.js carrega o modelo ONNX via `onnxruntime-node`, normaliza os dados de entrada com os mesmos parâmetros do treino, roda a inferência e interpreta o resultado (cluster + confiança).

## Por que ONNX em vez de manter um serviço Python

Rodar a inferência em Node.js evita manter dois runtimes (Python + Node) em produção — o modelo treinado em Python é exportado uma vez, e o serviço que o consome não precisa de nenhuma dependência de IA além do ONNX Runtime.
