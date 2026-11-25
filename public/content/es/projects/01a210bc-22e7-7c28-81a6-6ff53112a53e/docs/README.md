## Contexto

Proyecto académico del 6.º semestre de Desarrollo de Software Multiplataforma de la Fatec Jacareí, en alianza con el PROCON de Jacareí, el órgano municipal de defensa del consumidor. Buena parte de la demanda del PROCON viene de dudas que se repiten: qué hacer ante un cobro indebido, cuál es el plazo de arrepentimiento, qué documentos llevar. El desafío era un chatbot de WhatsApp que orientara al consumidor por los flujos definidos por el propio PROCON y, cuando la orientación no bastara, agendara una atención presencial.

El desafío traía restricciones claras: usar de preferencia la API oficial de WhatsApp, no usar ninguna API externa de modelo de lenguaje, aunque fuera gratuita, y tratar los datos de los ciudadanos conforme a la LGPD, la ley brasileña de protección de datos. El trabajo lo hizo un equipo de 7 personas, en 3 sprints de Scrum, de agosto a noviembre de 2026.

## Mi rol

Fui el Scrum Master del equipo y el desarrollador principal: cerca de 1.550 de los casi 1.700 commits del repositorio son míos. Mantuve el tablero y los cierres de sprint, con la trazabilidad de los requisitos, y revisé los PR del equipo.

En el código, trabajé en las tres partes del sistema. En el backend y en el gateway de WhatsApp, entregué cuentas con permisos granulares, la cancelación por parte del equipo con aviso al ciudadano, la reprogramación y la cancelación desde el propio chatbot, el seguimiento de los estados de entrega de Meta, la parte de LGPD y la IA en el flujo de la conversación. En el panel, hice las pantallas de Usuarios, Horarios de atención y Contenido del chatbot, entre otras. También escribí la prueba de extremo a extremo del flujo principal y los manuales en PDF entregados al PROCON. Planifiqué y revisé buena parte de las entregas con agentes de IA, en TDD.

## Solución

El ciudadano envía un mensaje por WhatsApp y el bot conduce la conversación con listas y botones: elige la categoría (cobro indebido, contratos, arrepentimiento, garantía), después la pregunta, y recibe la orientación con la base legal, los documentos necesarios y qué hacer a continuación. Si la duda no se resuelve, el bot ofrece los horarios libres y agenda la atención presencial, y el ciudadano puede volver después para reprogramar o cancelar.

El sistema tiene cinco partes, todas en Docker Compose:

- **Gateway de WhatsApp:** recibe el webhook de Meta, verifica la firma, procesa los mensajes en una cola por teléfono y envía las respuestas.
- **Backend:** guarda el estado de la conversación, arma las respuestas a partir del contenido de la base de datos, calcula los cupos de la agenda, envía los avisos al ciudadano y sirve la API del panel.
- **Modelo de lenguaje local:** Ollama, con `llama3.2:3b`, reescribe la explicación de la respuesta oficial en tono de conversación.
- **PostgreSQL:** guarda contenido, agenda, conversaciones y el registro de cada paso para los informes.
- **Panel web:** el equipo del PROCON gestiona las citas, edita el contenido del chatbot, configura horarios, documentos, usuarios y la conexión con WhatsApp, y sigue los informes.

La producción corre en una VM en la nube, con HTTPS, y el despliegue sale por GitHub Actions.

## Decisiones técnicas

- **API oficial de WhatsApp.** En el primer sprint usamos una automatización no oficial de WhatsApp Web. Dejaba de entregar mensajes a parte de los contactos y ponía el número en riesgo de bloqueo, así que migré a la WhatsApp Cloud API antes de empezar el panel. Las credenciales de Meta se configuran desde el panel, se guardan cifradas y solo se graban después de una prueba de conexión exitosa.
- **La IA nunca decide el flujo.** Quien elige la respuesta es el código, a partir del contenido registrado por el PROCON. El modelo solo reescribe la explicación, y el texto generado solo se usa si trae todos los números de la respuesta oficial y ningún número nuevo. Toda respuesta generada lleva la etiqueta "Gerado com auxílio de IA" (generado con ayuda de IA) y, si el modelo está caído o tarda demasiado, el ciudadano recibe el texto oficial.
- **Datos personales guardados solo cuando hace falta.** El teléfono de la conversación se convierte en un hash, y el CPF (documento fiscal brasileño) se guarda solo como hash y en versión enmascarada. Una revisión mostró que el identificador de mensaje de Meta lleva el teléfono codificado, así que también pasó a guardarse solo como hash. El teléfono de la cita se borra cuando llega la hora, y hay una anonimización por plazo, apagada por defecto, que limpia nombres y CPF manteniendo las cifras de los informes.
- **Concurrencia en la agenda.** La reserva y la reprogramación usan bloqueos de PostgreSQL por horario, siempre en el mismo orden, y las reglas de negocio se verifican dentro de la transacción, después del bloqueo, para que dos ciudadanos nunca se queden con el mismo cupo.
- **Módulos lógicos, no microservicios.** El backend es un solo servicio, dividido en módulos de conversación, decisión, agenda, mensajes y panel. Solo el modelo de lenguaje tiene contenedor propio, porque carga el modelo entero en memoria.

## Resultado

El proyecto se entregó el 23/11/2026, con los 16 requisitos del desafío (8 funcionales y 8 no funcionales) concluidos y el sistema en producción. En el tercer sprint, 17 de las 22 entregas tenían mi nombre entre los responsables.

La base de pruebas superó los 3.700 casos automatizados en Vitest entre backend, gateway y panel, con pruebas de integración corriendo contra un PostgreSQL real en el CI. La prueba de extremo a extremo simula el webhook firmado de Meta, desde el primer "hola" hasta la atención registrada en el panel, y pasó en el CI ya en la primera ejecución. Una revisión por mutación de esa prueba mostró que el CPF con formato no se verificaba, y la falla se corrigió antes del merge.

Quedó claro un límite: en CPU, el modelo local tarda de 23 a 38 segundos por respuesta. Por eso el bot muestra el indicador de escribiendo mientras espera, atiende una generación a la vez y responde con el texto oficial cuando la IA está ocupada. La VM de producción no tiene memoria para el modelo, así que la versión en línea responde solo con el texto oficial, salvo que el Ollama de una máquina del equipo esté conectado por red privada.

## Aprendizajes

Aprendí que una prueba en verde no demuestra cobertura: solo alterar el código a propósito y ver fallar la prueba muestra que protege la regla. También aprendí que una verificación hecha fuera del bloqueo tiene que repetirse dentro de él, y que los datos personales aparecen donde menos se espera, como en el identificador de un mensaje. Como Scrum Master, vi que el final del sprint acumula entregas cuando la documentación y las pruebas quedan para después, y empecé a adelantarlas.
