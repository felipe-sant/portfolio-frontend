## Contexto

As cobranças eram conferidas manualmente e erros de conciliação só apareciam dias depois.

## Meu papel

Fiz sozinho a API e o modelo de dados.

## Solução

Uma API em Go registra cada cobrança, consome eventos de pagamento por fila e reprocessa o que falhou.

## Decisões técnicas

| Decisão    | Motivo                                        |
| ---------- | --------------------------------------------- |
| Redis      | Fila simples para reprocessar eventos         |
| PostgreSQL | Transações para manter os saldos consistentes |

## Resultado

A conciliação passou a ser automática e os erros aparecem no mesmo dia.
