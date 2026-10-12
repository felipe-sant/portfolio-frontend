## Contexto

Los cobros se revisaban manualmente y los errores de conciliación solo aparecían días después.

## Mi rol

Hice yo solo la API y el modelo de datos.

## Solución

Una API en Go registra cada cobro, consume eventos de pago desde una cola y reprocesa lo que falló.

## Decisiones técnicas

| Decisión   | Motivo                                              |
| ---------- | --------------------------------------------------- |
| Redis      | Cola simple para reprocesar eventos                 |
| PostgreSQL | Transacciones para mantener los saldos consistentes |

## Resultado

La conciliación pasó a ser automática y los errores aparecen el mismo día.
