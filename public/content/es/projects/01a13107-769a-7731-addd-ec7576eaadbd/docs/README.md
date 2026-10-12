## Contexto

La clínica agendaba citas por teléfono y perdía horarios por falta de confirmación.

## Mi rol

Participé en el proyecto de punta a punta, en un equipo de tres personas.

## Solución

Un sitio permite elegir el horario, y una API en Java confirma por correo y actualiza el panel de la recepción.

## Decisiones técnicas

| Decisión    | Motivo                                         |
| ----------- | ---------------------------------------------- |
| Spring Boot | Estructura madura para la API y la validación  |
| PostgreSQL  | Restricciones para impedir horarios duplicados |

## Resultado

Las ausencias sin aviso bajaron después de que se empezó a usar la confirmación por correo.
