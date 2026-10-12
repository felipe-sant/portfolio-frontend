## Contexto

La lista de asistencia de los eventos de la facultad se llevaba en papel y tardaba en revisarse.

## Mi rol

Participé en el proyecto de punta a punta, en un equipo de tres personas.

## Solución

Una aplicación móvil lee el código QR del participante y envía la asistencia a una API, que actualiza la lista en tiempo real. La API sigue la estructura de [Mapa de la ciudad](project:01a13107-7699-73d4-8e74-d2595a05bb59/docs/SETUP.md).

## Decisiones técnicas

| Decisión     | Motivo                                             |
| ------------ | -------------------------------------------------- |
| React Native | Un solo código para Android e iOS                  |
| WebSocket    | Actualización de la lista sin recargar la pantalla |

## Resultado

La revisión de la lista pasó de horas a minutos en el evento donde se probó la aplicación.
