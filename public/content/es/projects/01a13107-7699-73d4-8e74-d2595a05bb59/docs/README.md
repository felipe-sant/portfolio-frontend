## Contexto

Los puntos de interés de la ciudad estaban dispersos en hojas de cálculo y sitios distintos, sin un mapa único para consultar.

## Mi rol

Hice el proyecto yo solo, desde la base de datos hasta la interfaz.

## Solución

Una aplicación web con mapa interactivo y una API que calcula rutas y filtra puntos por categoría mediante consultas espaciales.

## Decisiones técnicas

| Decisión | Motivo                                          |
| -------- | ----------------------------------------------- |
| PostGIS  | Consultas espaciales dentro de la base de datos |
| Vite     | Compilación rápida y configuración mínima       |

## Resultado

El mapa está publicado y recibe nuevos puntos cada semana. La misma estructura de API se reutilizó en la aplicación de registro de asistencia. Vea también [Registro de asistencia a eventos](project:01a13107-7699-72c5-a7a5-a5ddd278d026).

## Aprendizajes

Medir el tiempo de las consultas espaciales antes de optimizar evitó trabajo innecesario.
