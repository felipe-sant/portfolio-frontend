## Contexto

Los formularios de los proyectos repetían las mismas reglas de validación y mensajes.

## Mi rol

Hice el proyecto yo solo, desde la base de datos hasta la interfaz.

## Solución

Una biblioteca pequeña define reglas reutilizables, infiere los tipos del formulario y traduce los mensajes.

## Decisiones técnicas

| Decisión   | Motivo                                        |
| ---------- | --------------------------------------------- |
| TypeScript | Tipos inferidos a partir de las reglas        |
| Vitest     | Casos de prueba escritos como ejemplos de uso |

## Resultado

Se publicó como paquete npm y redujo el código de validación de los proyectos que la usan.
