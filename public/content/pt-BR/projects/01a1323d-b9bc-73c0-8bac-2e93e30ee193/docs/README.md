## Contexto

Projeto pessoal para aplicar aprendizado não supervisionado (K-Means) a um problema real de ciência do esporte: agrupar atletas de futebol em perfis de desempenho físico a partir de métricas de sessão (distância percorrida, sprints, velocidade máxima, intensidade), para apoiar decisões táticas e ajustes de treino.

## Meu papel

Desenvolvi sozinho todo o pipeline: desde o treinamento do modelo em Python até a API de inferência em produção.

## Solução

O modelo foi treinado em Python com scikit-learn (pipeline de normalização + K-Means com 4 clusters), incluindo uma métrica derivada de "explosividade" calculada a partir da distância de sprint e velocidade máxima. Os clusters resultantes são nomeados automaticamente com base nas características dos centróides (ex. maior distância de sprint = "explosivo"). O modelo treinado é exportado para o formato ONNX e servido por uma API em Node.js/TypeScript, que roda a inferência via ONNX Runtime sem depender de Python em produção — e também calcula o perfil predominante de um atleta ao longo de várias partidas, consultando um banco PostgreSQL.

## Decisões técnicas

Exportar o modelo para ONNX e rodar a inferência em Node.js (em vez de manter um serviço Python em produção) simplifica o deploy e evita manter dois runtimes diferentes rodando. Os parâmetros do normalizador (média e desvio padrão) são exportados junto do modelo, para garantir que o pré-processamento em produção seja idêntico ao do treinamento.

## Resultado

Testado com múltiplos perfis de entrada sintéticos: métricas de alta intensidade e sprint curto foram corretamente classificadas como "explosivo", enquanto métricas de longa distância e baixa intensidade foram classificadas como "resistente" — confirmando que o modelo distingue os perfis de forma coerente.

## Aprendizados

Nomear clusters automaticamente com base nas características dos centróides (em vez de rotular manualmente após cada treino) torna o pipeline mais robusto a retreinos com dados diferentes.
