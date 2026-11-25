## Pré-requisitos

Node.js 22 ou mais novo e o Claude Code instalado. Clone o [claude-kit](https://github.com/felipe-sant/claude-kit) numa pasta fora do repositório que vai receber o time:

```bash
git clone https://github.com/felipe-sant/claude-kit.git ~/claude-kit
```

## Aplicar em um repositório

```bash
node ~/claude-kit/bin/ai-sync.js /caminho/do/repositorio
```

Dentro do próprio repositório, o caminho pode ser omitido. Ao final, o `ai-sync` mostra as stacks detectadas e o que foi criado, atualizado, removido e mantido. Versione o arquivo `.claude/claude-core.lock.json` junto com o repositório.

## Montar o time

Abra o Claude Code no repositório e rode `/team-setup`. A sessão principal passa a ser a orquestradora: ela pergunta os nomes do time, propõe quem participa de cada tarefa e confirma antes de delegar.

## Opções

| Opção            | O que faz                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `--profile nome` | Aplica um perfil escolhido à mão (`default`, `frontend`, `backend` ou `tooling`) no lugar da detecção de stack. |
| `--force`        | Reinstala também os arquivos que foram editados no repositório.                                                 |
| `--teams`        | Liga o modo experimental de time de agentes, só na configuração local. `--no-teams` desliga.                    |
| `--check`        | Confere se catálogo, arquivos e perfis do kit estão coerentes, sem aplicar nada.                                |

Repositórios de ferramentas, scripts e conteúdo, sem stack detectável, usam `--profile tooling`.
