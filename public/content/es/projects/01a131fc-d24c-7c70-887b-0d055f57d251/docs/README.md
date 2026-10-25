## Contexto

Proyecto de hobby, hecho solo por diversión en un único día: un sitio de "pedido de noviazgo imposible de rechazar", donde el botón de rechazo huye del cursor cada vez que el usuario intenta acercarse.

## Mi rol

Lo desarrollé yo solo, desde cero hasta el despliegue.

## Solución

Al pasar el mouse cerca del botón "Não" (No), su posición se recalcula aleatoriamente dentro de la pantalla, lo que vuelve prácticamente imposible hacer clic en él. El botón "Sim" (Sí) acepta la invitación y redirige a una canción.

## Decisiones técnicas

La lógica de "huida" es simple y directa: en el evento de mouseover (y en el clic, como seguridad extra), el botón recibe una nueva posición absoluta generada aleatoriamente dentro de una franja segura de la pantalla, mediante una función utilitaria de generación de posición.

## Resultado

Proyecto pequeño y funcional, publicado y en línea.

## Aprendizajes

A veces un proyecto no necesita resolver un problema serio para ser un buen ejercicio de frontend. Fue una forma ligera de practicar la manipulación del DOM y el posicionamiento dinámico de elementos.
