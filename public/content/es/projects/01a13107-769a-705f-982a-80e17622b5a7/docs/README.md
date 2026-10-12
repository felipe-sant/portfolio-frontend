## Contexto

Armar informes recurrentes exigía copiar datos entre archivos y dar formato a todo manualmente.

## Mi rol

Hice yo solo la API y el modelo de datos.

## Solución

Un comando recibe un archivo de datos y una plantilla y genera el informe en PDF o CSV.

## Decisiones técnicas

| Decisión  | Motivo                                           |
| --------- | ------------------------------------------------ |
| Node.js   | Distribución sencilla como paquete npm           |
| Commander | Lectura de argumentos sin escribir un analizador |

## Resultado

El proyecto se discontinuó cuando el equipo pasó a usar el panel de ventas para los mismos informes.
