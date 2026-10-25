## Contexto

Proyecto académico para practicar cálculo geográfico e integración entre frontend y backend: simular una ruta de vuelo real entre dos puntos aleatorios de Brasil, teniendo en cuenta la curvatura de la Tierra en lugar de una línea recta en un plano cartesiano.

## Mi rol

Desarrollé yo solo tanto el frontend como el backend.

## Solución

El frontend renderiza el mapa con Leaflet, permite ingresar coordenadas manualmente o hacer clic directamente en el mapa, y simula la trayectoria de la aeronave en tiempo real. El backend entrega coordenadas válidas dentro del territorio brasileño y, en cada actualización de posición, devuelve información geográfica (país, estado, municipio, microrregión y mesorregión) a partir de la API del IBGE.

## Decisiones técnicas

El cálculo de la posición a lo largo de la ruta usa interpolación esférica (Slerp) sobre el arco de círculo máximo entre las dos coordenadas, en lugar de interpolación lineal. Esto garantiza que la trayectoria represente la curvatura real de la Tierra y no una línea recta en un plano cartesiano. El backend fue reescrito en diciembre de 2025, estructurado en capas de rutas, controllers y services, con pruebas unitarias usando Jest.

## Resultado

El frontend está en línea y funciona de forma aislada, pero apunta a una versión anterior del backend (rutas antiguas), ya que el backend fue reescrito después del último ajuste del frontend. Por eso el panel de localidad durante el vuelo siempre devuelve "Desconhecido" (Desconocido), un bug documentado en la [issue #3](https://github.com/felipe-sant/maps-front/issues/3).

## Aprendizajes

Entender la diferencia entre interpolación lineal y esférica para cálculos geográficos, y la importancia de mantener sincronizados el frontend y el backend cuando son repositorios separados. La ruptura de compatibilidad solo se notó en una revisión posterior de los proyectos.
