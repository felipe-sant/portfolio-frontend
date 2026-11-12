# Specs

Cada mudança não trivial nasce de uma spec escrita pelo agente `sdd` e versionada na branch da feature, junto do código. O fluxo completo está em [`.claude/CLAUDE.md`](../.claude/CLAUDE.md#tooling-de-ia-agents-skills-e-spec-driven) e em [`CONTRIBUTING.md`](../CONTRIBUTING.md).

| Pasta                                  | O que guarda                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `_template/`                           | Molde de `spec.md` e `tasks.md`, copiado para cada spec nova                 |
| `features/<slug>/`                     | Spec e tarefas de uma feature                                                |
| `bugs/<slug>/`                         | Spec e tarefas de uma correção de bug                                        |
| `features/_archive/`, `bugs/_archive/` | Resumos legados, de antes de a spec ser versionada; não recebem arquivo novo |

O estado vive no `**Status:**` do `spec.md`: `rascunho` → `em-revisao` → `aprovada` → `em-andamento` → `implementada`. Só humano promove para `aprovada`. Depois de `implementada`, a spec continua na árvore como contexto para tarefas futuras.
