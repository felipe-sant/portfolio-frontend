## Contexto

Acompanhar os pedidos exigia abrir três sistemas diferentes.

## Meu papel

Fiz sozinho a API e o modelo de dados.

## Solução

Um comando consulta os sistemas de pedidos, mostra o status em uma tabela e avisa quando um pedido passa do prazo.

## Decisões técnicas

| Decisão | Motivo                                      |
| ------- | ------------------------------------------- |
| Go      | Binário único, fácil de distribuir          |
| Docker  | Mesmo ambiente de execução para todo o time |

## Resultado

O acompanhamento diário passou a levar poucos minutos.
