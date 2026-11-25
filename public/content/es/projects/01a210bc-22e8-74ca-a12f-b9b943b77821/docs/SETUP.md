## Requisitos previos

Node.js 22 o más reciente y Claude Code instalado. Clona [claude-kit](https://github.com/felipe-sant/claude-kit) en una carpeta fuera del repositorio que va a recibir el equipo:

```bash
git clone https://github.com/felipe-sant/claude-kit.git ~/claude-kit
```

## Aplicar en un repositorio

```bash
node ~/claude-kit/bin/ai-sync.js /ruta/del/repositorio
```

Dentro del propio repositorio, la ruta se puede omitir. Al final, `ai-sync` muestra los stacks detectados y lo que se creó, actualizó, eliminó y mantuvo. Versiona el archivo `.claude/claude-core.lock.json` junto con el repositorio.

## Armar el equipo

Abre Claude Code en el repositorio y ejecuta `/team-setup`. La sesión principal pasa a ser la orquestadora: pregunta los nombres del equipo, propone quién participa en cada tarea y confirma antes de delegar.

## Opciones

| Opción             | Qué hace                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `--profile nombre` | Aplica un perfil elegido a mano (`default`, `frontend`, `backend` o `tooling`) en lugar de la detección de stack. |
| `--force`          | Reinstala también los archivos que se editaron en el repositorio.                                                 |
| `--teams`          | Activa el modo experimental de equipo de agentes, solo en la configuración local. `--no-teams` lo desactiva.      |
| `--check`          | Comprueba que el catálogo, los archivos y los perfiles del kit sean coherentes, sin aplicar nada.                 |

Los repositorios de herramientas, scripts y contenido, sin stack detectable, usan `--profile tooling`.
