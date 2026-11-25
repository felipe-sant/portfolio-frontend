## Contexto

Uso Claude Code todos los días, en varios repositorios, y repetía en cada uno la misma configuración: agentes, reglas de código, skills y ajustes del `settings.json`. Con el tiempo cada copia se volvía distinta de las demás, y una mejora hecha en un proyecto no llegaba a los otros. Inspirado en mi experiencia de trabajo con equipos de agentes, creé un kit personal que lleva ese equipo a cualquier repositorio con un solo comando.

## Mi rol

Hice el proyecto solo: el comando `ai-sync`, el contenido de los agentes, las reglas y las skills, las pruebas, el lint y la automatización en GitHub Actions. El propio kit se desarrolla con el equipo que instala, y los problemas que aparecen cuando uso el equipo en otros proyectos se convierten en issues en el repositorio.

## Solución

`ai-sync` es un script en Node.js que recibe la ruta del repositorio de destino. Lee el `package.json` y el `composer.json` de la raíz y de las carpetas de primer nivel, detecta el stack (React, NestJS, Laravel o AdonisJS) y copia en la carpeta `.claude/` los agentes, las reglas y las skills que sirven a ese proyecto, además de una configuración base de Claude Code. Quien prefiere elegir a mano usa un perfil (`default`, `frontend`, `backend` o `tooling`).

Después de la sincronización, basta con abrir Claude Code y ejecutar `/team-setup`. La skill convierte la sesión principal en la orquestadora: conversa con el usuario, arma el equipo de cada tarea y solo delega. El flujo pasa por el `product-owner`, que define reglas y alcance, por el `sdd`, que escribe la especificación, por los devs (frontend, backend, mobile, base de datos, devops, fullstack y documentación), que implementan con TDD y delegan las tareas mecánicas al `executor`, y por el `reviewer`, obligatorio siempre que hay un dev en el equipo. El `qa` y el `designer` entran cuando la tarea lo pide.

El equipo guarda una memoria por repositorio, solo con lo que sigue vigente después de la tarea, y puede funcionar como subagentes o, de forma opcional, como equipo de agentes que intercambian mensajes entre sí. En el repositorio del kit, un agente en GitHub Actions clasifica las issues abiertas por tamaño y abre pull request solo de las pequeñas.

```bash
node ~/claude-kit/bin/ai-sync.js /ruta/del/repositorio
```

## Decisiones técnicas

- **Una sincronización que no borra el trabajo de nadie.** `ai-sync` registra en un archivo de lock la ruta, la versión y la huella digital (SHA-256) de cada archivo instalado. Un archivo editado por el usuario nunca se sobrescribe ni se elimina; la herramienta solo avisa que hay una versión nueva. Sobrescribir exige `--force`, de forma explícita.
- **Un único punto de registro.** Cada agente, regla, skill y stack está en `catalog.json`, con la regla de a qué proyectos se aplica. El lint y las pruebas comprueban que catálogo, archivos y perfiles sean coherentes.
- **Orquestadora como skill, no como agente.** Al principio la orquestadora era un agente abierto con `--agent`. La cambié por una skill cargada en la sesión principal, lo que deja una sola fuente para el rol y usa el modelo que la sesión ya tiene.
- **Configuración base sin permisos amplios.** La plantilla de `settings.json` no habilita comandos ni directorios, y el lint rechaza cualquier plantilla que lo intente. Lo que el usuario ya definió nunca se modifica: lo que difiere aparece como sugerencia.
- **El kit se aplica a sí mismo.** Un hook de pre-commit sincroniza el `.claude/` del propio repositorio en cada commit, y una prueba en el CI rechaza la copia desactualizada.
- **Agente de issues con acceso mínimo.** Solo lee el texto de quienes colaboran en el repositorio, solo ejecuta comandos de una lista cerrada, tiene la acción fijada por el hash del commit y nunca hace merge.

## Resultado

En cinco días de desarrollo, el repositorio llegó a 196 commits, 30 pull requests aceptados y 41 issues registradas, 38 de ellas ya cerradas. Buena parte de esas issues surgió del uso real del equipo en otros proyectos. El kit entrega 13 agentes, 11 reglas (7 generales y 4 por stack), 8 skills y 4 perfiles, cubiertos por 241 pruebas automatizadas que pasan. Ya está sincronizado en el repositorio de ProconChat, un proyecto de la facultad, y en el repositorio que uso para registrar mis entregas semanales.

## Aprendizajes

- Una instrucción que se contradice dentro del mismo prompt deja al agente sin saber qué orden vale. La solución es una excepción explícita y acotada, no elegir una de las dos.
- `git commit -- ruta` arma un índice temporal. Un hook que regenera archivos a partir de la carpeta mezcla el trabajo de agentes que comparten la misma worktree; la validación segura compara con el stage exportado.
- El contenido en markdown también merece TDD: la prueba que falla primero muestra si el texto nuevo realmente cubre el hueco en el comportamiento del agente.
- Un repositorio que se aplica a sí mismo es una buena prueba de sus propias reglas y evita que la copia en uso se quede atrás.
