# Tasks: alvos e proporções da home no celular

> Spec: `./spec.md`

## Plano de execução

Tudo é CSS e documentação: nenhuma tarefa tem teste Vitest (aparência não entra em TDD). O `executor` faz T1 a T5 e
fecha com a Verificação completa (T5). Depois vêm a verificação manual do PO (T6) e os E2E do `qa` (T7, T8). Aprovar a spec
como está equivale a escolher "indicar que rola" (ver "Questões em aberto" da spec); se o PO escolher quebrar linha, a spec
volta ao `sdd` antes de aprovar.

```
executor: Fase 1          Fase 2              Fase 3   |  PO: T6  |  qa: T7 [P]   T8 [P]
          T1 [P] T2 [P]   T3 [P] T4 [P]       T5       |          |
```

## Tarefas

- [x] T1 [P] — Alvo de 44 px no link de título do destaque da Início (#204)
    - **Arquivo(s):** `src/styles/components/featuredProject.module.css`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** não se aplica (CSS; coberto pelos E2E de T7)
    - **Mudança:** `.link` ganha `display: inline-flex`, `align-items: center`,
      `padding-block: calc((var(--hit-min) - 1lh) / 2)` e `margin-block: calc((var(--hit-min) - 1lh) / -2)`, mantendo
      `color: inherit` e `text-decoration: none`; `.link::after` fica como está; `.link:focus-visible` passa a
      `outline-offset: 0.25rem`. `.title` e o componente `FeaturedProject.tsx` não mudam.
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** o gate passa e a regra está no estado descrito; aparência conferida em T6.
    - **Evidência:** `2f995d8`; `featuredProject.module.css` `.link` com `inline-flex`, `padding-block`/`margin-block` de `(var(--hit-min) - 1lh) / ±2` e `.link:focus-visible` em `outline-offset: 0.25rem`; `typecheck` e `lint` verdes.

- [x] T2 [P] — Esmaecimento nas bordas da linha de filtros de Projetos abaixo de 640 px (#205, `D70`)
    - **Arquivo(s):** `src/styles/pages/projects.module.css`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** não se aplica (CSS; coberto pelos E2E de T8)
    - **Mudança:** no `.filters` base,
      `mask-image: linear-gradient(to right, transparent, #000 calc(var(--pad-page) - var(--space-1)), #000 calc(100% - (var(--pad-page) - var(--space-1))), transparent)`;
      no bloco `@media (min-width: 640px)` existente, `.filters` ganha `mask-image: none`. Nada de cor, token novo, estilo
      inline ou CSS global.
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** o gate passa e a regra está no estado descrito; aparência conferida em T6.
    - **Evidência:** `678007c`; `.filters` com `mask-image: linear-gradient(...)` de `calc(var(--pad-page) - var(--space-1))` e `mask-image: none` no `@media (min-width: 640px)`; `typecheck` e `lint` verdes.

- [x] T3 [P] — Documentar o alvo do título do destaque
    - **Arquivo(s):** `docs/screens/home.md`, `docs/product/accessibility.md`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Mudança:** na linha de `RF-HOME-19` (tabela de "Projetos em destaque") e no item `RF-HOME-19` do checklist, acrescentar
      que o link de título tem alvo de 44 px sem mudar a altura da linha do título (mesmo padrão de `RF-PROJECTS-15`, #137),
      com `A11Y-G08` na coluna de origem; no item `A11Y-G08` de `accessibility.md`, trocar "inclusive o link de título de
      cada cartão de projeto" por redação que inclua também o link de título de cada destaque da Início.
    - **Gate:** nenhum comando (documentação)
    - **Feito quando:** as três passagens citam o alvo de 44 px do título do destaque.
    - **Evidência:** `35516d7`; `RF-HOME-19` na tabela (com `A11Y-G08` na origem) e no checklist de `home.md`, e `A11Y-G08` de `accessibility.md`, citam o alvo de 44px do título do destaque.

- [x] T4 [P] — Registrar `D70` e atualizar `RF-PROJECTS-08`
    - **Arquivo(s):** `docs/design/decisions.md`, `docs/screens/projects.md`
    - **Depende de:** T2
    - **Testes (escritos antes, RED):** não se aplica
    - **Mudança:** nova linha `D70` em `decisions.md` ("Indicação de rolagem dos filtros no celular": contexto da #205,
      opções "esmaecimento nas bordas" e "quebrar linha", decisão pelo esmaecimento só abaixo de 640 px, sem esmaecer o
      contorno de foco, citando `D16`, `D27` e `D62`); `RF-PROJECTS-08` em `projects.md` (linha da tabela e item do
      checklist) passa a dizer que, abaixo de 640 px, as bordas da linha esmaecem para indicar que ela rola, com `D70` na
      coluna de origem.
    - **Gate:** nenhum comando (documentação)
    - **Feito quando:** `D70` existe em `decisions.md` e `RF-PROJECTS-08` cita o esmaecimento e `D70` na tabela e no checklist.
    - **Evidência:** `aebbdca`; linha `D70` em `decisions.md` (e item em "Divergências do protótipo e do handoff"); `RF-PROJECTS-08` cita o esmaecimento e `D70` na tabela e no checklist de `projects.md`.

- [x] T5 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1, T2, T3, T4
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada; não roda Playwright)
    - **Feito quando:** o gate passa
    - **Evidência:** `npm run typecheck` e `npm run lint` verdes; `npm run build` verde com `VITE_SITE_URL=https://felipe-sant.vercel.app` (sem a variável o build falha por desenho, `scripts/resolveSiteUrl.ts`), e o CSS de `dist/assets/` traz o `mask-image` e o `padding-block` do alvo; `npm test -- --run` com 2904 de 2905 testes verdes e uma falha intermitente de tempo em `src/prerender/test/mountClient.test.tsx` ("renderiza no cliente usando o BASE_URL como basename") com a máquina sob carga 16 a 19, que passa 19/19 em três rodadas isoladas e não toca arquivo desta spec; `test:cov` trocado pela suíte completa pedida pelo Orc.

- [x] T6 — Verificação manual do PO (CA4, CA9, CA10)
    - **Arquivo(s):** nenhum
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Roteiro:** `npm run dev -- --port <porta do Dev> --strictPort`; Início (`/pt-BR`) e Projetos (`/pt-BR/projects`) em
      320, 375, 390 e 768 px, nos temas claro e escuro.
        - Início: o título de cada destaque está na mesma posição e com o mesmo espaçamento que na `staging`, inclusive
          "Player Profile Clustering" em duas linhas a 320 px; Tab no título mostra o anel em volta do alvo, sem corte; as
          capas aparecem em 16:9; clicar na imagem ou em "Ver projeto →" abre o projeto.
        - Projetos: com a linha de filtros no início, o primeiro chip está inteiro e sem esmaecimento e a borda direita
          esmaece; rolada até o fim, o inverso; no meio, as duas bordas esmaecem; Tab até o primeiro e o último chip mostra o
          anel inteiro e opaco; a 768 px não há esmaecimento; nenhuma das telas rola na horizontal.
    - **Gate:** aprovação do PO
    - **Feito quando:** o PO aprova ou devolve ajustes (que voltam ao `executor`, em T1/T2).
    - **Evidência:** aprovado pelo Felipe em 11/11/2026 (teste visual).

- [x] T7 [P] — E2E da Início (responsável: `qa`)
    - **Arquivo(s):** `e2e/home.spec.ts` (sem spec novo; `e2e/support/specClassification.ts` não muda)
    - **Depende de:** T6
    - **Testes:**
        - `RF-HOME-19, A11Y-G08` — no describe "estrutura da página", ao lado do teste de `RF-HOME-16, RF-HOME-22`: em laço por
          320, 375 e 768 px (`setViewportSize`) e na largura do projeto, cada link de título de destaque tem altura ≥ 44 (CA1).
        - `RF-HOME-19, A11Y-G08` — a 320 px, em todo destaque, `|altura do h3 − altura do texto do link (Range)| ≤ 1` (CA2),
          modelado no teste de `RF-PROJECTS-15` de `e2e/projects.spec.ts`; se "Player Profile Clustering" quebrar em duas
          linhas a 320 px, o teste afirma antes a pré-condição (texto do link com altura > 40 px, por `expect.poll`); se não
          quebrar, o `qa` registra isso na evidência e o caso de duas linhas fica só na verificação manual (T6).
        - `RF-HOME-21, NF-DE-16` — no describe "imagens dos destaques", em cada idioma e destaque, depois de
          `naturalWidth > 0`: altura renderizada = largura × 9/16 ± 1 px; `|naturalWidth/naturalHeight − 16/9| ≤ 0,01`;
          `|width/height (atributos) − 16/9| ≤ 0,01` (CA5). Sem comparar `naturalWidth` com o `width` declarado.
        - `NF-RE-03` — em 320, 375, 390 e 768 px, a Início não rola na horizontal (CA8).
    - **Gate:** `npm run build:fatec && npm run test:e2e -- e2e/home.spec.ts`
    - **Feito quando:** o gate passa nos projetos de 390 e 1280 px, nos dois temas, e os testes listados existem com esses IDs.
    - **Evidência:** E2E da Início em `e2e/home.spec.ts` entregues pelo `qa` (commits 5c0e749 e 0b397fa), com os checks de E2E do PR #245 verdes no CI.

- [x] T8 [P] — E2E de Projetos (responsável: `qa`)
    - **Arquivo(s):** `e2e/projects.spec.ts`
    - **Depende de:** T6
    - **Testes:**
        - `RF-PROJECTS-08, D70` — abaixo de 640 px, `maskImage` da linha de filtros contém `linear-gradient`; a partir de
          640 px é `none` (CA6).
        - `A11Y-G06, D70` — abaixo de 640 px, para cada chip focado por Tab,
          `box.x ≥ linha.x + paddingLeft − 1` e `box.x + box.width ≤ linha.x + linha.width − paddingRight + 1`, com o padding
          lido de `getComputedStyle(linha)` (CA6b).
        - `NF-RE-03` — em 320, 375, 390 e 768 px, Projetos não rola na horizontal (CA8).
        - Os testes existentes de `RF-PROJECTS-08` seguem sem alteração e verdes (CA7).
    - **Gate:** `npm run build:fatec && npm run test:e2e -- e2e/projects.spec.ts`
    - **Feito quando:** o gate passa nos projetos de 390 e 1280 px, nos dois temas.
    - **Evidência:** E2E de Projetos em `e2e/projects.spec.ts` entregues pelo `qa` (commits f2ae147 e 8f13bb0), com os checks de E2E do PR #245 verdes no CI.
