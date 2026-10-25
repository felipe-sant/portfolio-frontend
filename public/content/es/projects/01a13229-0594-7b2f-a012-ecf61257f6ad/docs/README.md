## Contexto

Proyecto académico para practicar el manejo de estado y formularios en React: convertir entre sí unidades de longitud, peso y temperatura.

## Mi rol

Lo desarrollé yo solo, frontend puro, sin backend.

## Solución

El usuario elige una categoría (longitud, peso o temperatura), ingresa un valor y la unidad de origen, y el sistema calcula y muestra el valor convertido en la unidad de destino. Un botón permite invertir rápidamente la unidad de origen y la de destino.

## Decisiones técnicas

Toda la lógica de conversión se ejecuta en el cliente, sin necesidad de una API externa. Las fórmulas de conversión entre unidades son fijas y conocidas, así que no hay motivo para depender de un servicio externo para esto (a diferencia de las conversiones que dependen de datos actualizados, como las de moneda).

## Resultado

Funciona como se esperaba, probado convirtiendo longitud (km a m).

## Aprendizajes

Un proyecto pequeño, pero útil para reforzar que no toda funcionalidad "de conversión" necesita una API: a veces la lógica pura ya lo resuelve, con menos puntos de falla.
