## Contexto

Los indicadores de ventas se armaban a mano en hojas de cálculo y solo estaban listos a fin de mes.

## Mi rol

Realicé yo solo el análisis de los datos, el modelo y la presentación de los resultados.

## Solución

Un pipeline en Python consolida las hojas de cálculo y un panel web muestra los indicadores por región y período.

## Decisiones técnicas

| Decisión   | Motivo                                         |
| ---------- | ---------------------------------------------- |
| Pandas     | Limpieza y agregación de datos en pocas líneas |
| PostgreSQL | Historial consultable por período              |

## Resultado

Los indicadores pasaron a estar disponibles el día siguiente al cierre de cada venta.
