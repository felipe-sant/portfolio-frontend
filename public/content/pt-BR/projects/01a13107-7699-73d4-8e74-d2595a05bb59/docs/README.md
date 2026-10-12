## Contexto

Os pontos de interesse da cidade estavam espalhados em planilhas e sites diferentes, sem um mapa único para consultar.

## Meu papel

Fiz o projeto sozinho, do banco de dados à interface.

## Solução

Uma aplicação web com mapa interativo e uma API que calcula rotas e filtra pontos por categoria usando consultas espaciais.

## Decisões técnicas

| Decisão | Motivo                              |
| ------- | ----------------------------------- |
| PostGIS | Consultas espaciais direto no banco |
| Vite    | Build rápido e configuração mínima  |

## Resultado

O mapa está publicado e recebe novos pontos toda semana. A mesma estrutura de API foi reaproveitada no check-in de eventos. Veja também o [Check-in de eventos](project:01a13107-7699-72c5-a7a5-a5ddd278d026).

## Aprendizados

Medir o tempo das consultas espaciais antes de otimizar evitou trabalho desnecessário.
