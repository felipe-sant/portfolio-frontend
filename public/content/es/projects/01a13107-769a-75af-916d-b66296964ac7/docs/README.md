## Contexto

Seguir los pedidos exigía abrir tres sistemas diferentes.

## Mi rol

Hice yo solo la API y el modelo de datos.

## Solución

Un comando consulta los sistemas de pedidos, muestra el estado en una tabla y avisa cuando un pedido supera el plazo.

## Decisiones técnicas

| Decisión | Motivo                                         |
| -------- | ---------------------------------------------- |
| Go       | Un único binario, fácil de distribuir          |
| Docker   | Mismo entorno de ejecución para todo el equipo |

## Resultado

El seguimiento diario pasó a llevar pocos minutos.
