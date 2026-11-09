# Agentes e skills de IA

Esta pasta guarda como o Claude Code trabalha neste repositório. As regras e convenções vivem em [`CLAUDE.md`](CLAUDE.md), a fonte da verdade; este arquivo só diz quem faz o quê. A política de uso de IA do projeto está na seção "Como este projeto é feito" do [`README.md`](../README.md) da raiz.

## Agentes

Ficam em `agents/` e rodam nesta ordem, cada um revisando o trabalho do anterior e nunca o próprio:

| Agente     | Papel                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `sdd`      | Planeja: escreve `spec.md` e `tasks.md` em `.specs/` e nunca toca em `src/`.                     |
| `executor` | Implementa as tarefas de um `tasks.md` aprovado, em branch dedicada, com TDD e commits atômicos. |
| `reviewer` | Revisa o diff contra o `CLAUDE.md`, somente leitura, depois de cada estágio.                     |
| `qa`       | Testa a tela no navegador com Playwright, reporta bugs e escreve os testes de `e2e/`.            |
| `tester`   | Valida a suíte inteira, audita a adequação dos testes e cria os testes de unidade que faltam.    |

## Skills

Ficam em `skills/<nome>/SKILL.md` e são carregadas sob demanda pelo agente que precisa delas.

| Skill                         | Papel                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `tdd-patterns`                | Ciclo vermelho, verde e refatora, adequação dos testes e sensor de discriminação.           |
| `react-page-scaffold`         | Página em `src/pages/` com CSS Module, namespace de tradução e registro de rota.            |
| `react-component-scaffold`    | Componente em `src/components/` com CSS Module e teste em `test/`.                          |
| `redux-store-scaffold`        | Slice em `src/store/slices/`, registro no `rootReducer` e hooks tipados.                    |
| `rtk-query-endpoint-scaffold` | Endpoints em `src/store/api/` por `api.injectEndpoints`.                                    |
| `vitest-specialist`           | Teste de unidade em `test/` com Vitest e Testing Library.                                   |
| `playwright-e2e`              | Teste E2E em `e2e/` com Playwright e axe.                                                   |
| `screen-qa`                   | Roteiro de QA exploratório de uma tela e formato do relatório de bugs.                      |
| `accessibility-audit`         | Auditoria de acessibilidade de uma tela contra `docs/product/accessibility.md`.             |
| `nfr-verification`            | Verificação dos requisitos não funcionais de `docs/product/non-functional-requirements.md`. |

## Fluxo

`sdd` planeja, o PO aprova a spec, `executor` implementa, o PO confere a tela quando há uma, `reviewer` revisa, `qa` e `tester` validam e o PO revisa o PR antes do merge. Detalhe em "Tooling de IA" no [`CLAUDE.md`](CLAUDE.md).
