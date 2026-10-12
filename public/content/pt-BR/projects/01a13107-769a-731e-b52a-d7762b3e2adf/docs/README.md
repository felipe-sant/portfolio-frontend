## Contexto

Os indicadores de venda eram montados à mão em planilhas e só ficavam prontos no fim do mês.

## Meu papel

Conduzi sozinho a análise dos dados, o modelo e a apresentação dos resultados.

## Solução

Um pipeline em Python consolida as planilhas e um painel web mostra os indicadores por região e período.

## Decisões técnicas

| Decisão    | Motivo                                         |
| ---------- | ---------------------------------------------- |
| Pandas     | Limpeza e agregação dos dados em poucas linhas |
| PostgreSQL | Histórico consultável por período              |

## Resultado

Os indicadores passaram a ficar disponíveis no dia seguinte ao fechamento de cada venda.
