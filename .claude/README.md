# Agentes e skills de IA

Esta pasta guarda como o Claude Code trabalha neste repositório. As regras e convenções vivem em [`CLAUDE.md`](CLAUDE.md), a fonte da verdade; este arquivo só diz quem faz o quê. A política de uso de IA do projeto está na seção "Como este projeto é feito" do [`README.md`](../README.md) da raiz.

## Agentes

Ficam em `agents/` e rodam nesta ordem, cada um revisando o trabalho do anterior e nunca o próprio:

| Agente     | Papel                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| `sdd`      | Cria a branch da feature, escreve `spec.md` e `tasks.md` em `.specs/`, commita a spec e não toca em `src/`. |
| `executor` | Implementa as tarefas de um `tasks.md` aprovado, na branch criada pelo `sdd`, com TDD e commits atômicos.   |
| `reviewer` | Revisa o diff contra o `CLAUDE.md`, somente leitura, depois de cada estágio.                                |
| `qa`       | Testa a tela no navegador com Playwright, reporta bugs e escreve os testes de `e2e/`.                       |
| `tester`   | Valida a suíte inteira, audita a adequação dos testes e cria os testes de unidade que faltam.               |

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

## Detalhe de agentes, skills, specs e docs

- `.claude/agents/` — cinco papéis num fluxo de TDD, `sdd` → `executor` → verificação manual do PO →
  `reviewer` → `qa` → `reviewer` → `tester` → `reviewer`: `sdd` (só planeja, cria a branch da feature,
  escreve e commita `spec.md`/`tasks.md` em `.specs/`, nunca toca em `src/`; toda tarefa lista os "Testes" a provar e o
  "Gate"), `executor` (implementa a feature inteira de um `tasks.md` já aprovado, na branch criada
  pelo `sdd`, em TDD: teste antes do código, um por vez, vermelho → verde → refatora, gate e tabela de adequação
  por tarefa, commit atômico com teste e código juntos), `reviewer` (audita contra o `CLAUDE.md`,
  somente leitura, e revisa o trabalho do estágio anterior, nunca o próprio), `qa` (testa a tela no
  navegador com Playwright contra `docs/`, escreve os testes de `e2e/` e reporta bugs; só escreve em
  `e2e/`; só entra se a feature tem tela) e `tester` (valida toda a suíte, audita a adequação dos
  testes, roda o sensor de discriminação e cria testes de unidade que faltam; só escreve em
  `src/**/test/` e `src/testUtils/`). As regras do fluxo estão em "Tooling de IA" no `CLAUDE.md`.
- `.claude/skills/` — conhecimento carregável sob demanda. São dez, separadas pela pasta do
  artefato: `react-page-scaffold` (página em `src/pages/` + CSS Module + registro de rota),
  `react-component-scaffold` (componente reutilizável em `src/components/` + CSS Module em
  `src/styles/components/`), `vitest-specialist` (teste em `test/` por diretório com Vitest +
  Testing Library, `src/setupTests.ts` e o bloco `test` do `vite.config.ts`),
  `redux-store-scaffold` (slice em `src/store/slices/` + registro no `rootReducer` + hooks tipados),
  `rtk-query-endpoint-scaffold` (endpoints em `src/store/api/` via `api.injectEndpoints`),
  `tdd-patterns` (ciclo vermelho, verde, refatora, adequação dos testes e sensor de discriminação;
  usada por `executor`, `tester` e `reviewer`) e, do agente `qa`, `playwright-e2e` (teste de `e2e/`),
  `accessibility-audit` (auditoria de acessibilidade contra `docs/product/accessibility.md`),
  `screen-qa` (roteiro de QA exploratório de uma tela) e `nfr-verification` (requisitos não
  funcionais de `docs/product/non-functional-requirements.md`).
- `.specs/` — specs por feature/bug (`.specs/features/<slug>/`, `.specs/bugs/<slug>/`), a partir de
  `.specs/_template/`. A spec nasce na branch da feature, criada pelo `sdd`, é versionada com ela e removida pelo
  `executor` (`git rm -r`, commit `Docs` próprio) ao chegar em `implementada`, antes do PR.
  O estado vive no campo `**Status:**` do `spec.md` (`rascunho` → `em-revisao` → `aprovada` →
  `em-andamento` → `implementada`); só humano promove para `aprovada`.
- `docs/` — documentação versionada **só deste frontend**: visão do produto e glossário
  (`docs/product/`), design system (`docs/design/`), arquitetura (`docs/architecture/`), ADRs
  (`docs/adr/`), diagramas de fluxo e entidades (`docs/diagrams/`), ambientes (`docs/setup/`) e o
  modelo de documentação de tela (`docs/screens/`). O sistema inteiro fica no repositório pai,
  que reúne backend e frontend como submódulos, e o contrato da API fica no backend. Índice em
  `docs/README.md`; o `sdd` não escreve lá, só em `.specs/`.

Ao mudar uma convenção do `CLAUDE.md`, verifique se algum agente ou skill a repete — eles citam o `CLAUDE.md` como fonte da verdade, mas duplicam os pontos que precisam aplicar sozinhos.
