# Tasks: Cabeçalho e título da Início sem vazamento com o espaçamento de texto

> Spec: `./spec.md`

## Tarefas

- [ ] T1 — E2E de reprodução do espaçamento de texto (largura x idioma)
    - **Arquivo(s):** `e2e/text-spacing.spec.ts`, `e2e/support/specClassification.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** com o espaçamento de 1.4.12 aplicado, o cabeçalho a 768 px e o `h1` da Início a 360 px não passam da largura da tela em pt-BR, en e es (critérios 1, 2 e 4 da spec); axe sem violações
    - **Gate:** `npm run typecheck && npm run lint` localmente; o E2E roda no CI (falha antes do CSS, passa depois)
    - **Feito quando:** o teste cobre os dois pontos nos três idiomas e entra em exatamente uma lista de `specClassification.ts`
    - **Evidência:** (executor)

- [ ] T2 — Cabeçalho sem vazamento a 768 px (#264)
    - **Arquivo(s):** `src/styles/components/header.module.css`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (CSS; coberto pelo E2E de T1)
    - **Gate:** `npm run typecheck && npm run lint`; medição no navegador (dev server na porta própria)
    - **Feito quando:** excesso 0 px em pt-BR, en e es a 768 px com o espaçamento, e visual igual sem ele
    - **Evidência:** (executor)

- [ ] T3 [P] — Título da Início cabe a 360 px (#265)
    - **Arquivo(s):** `src/styles/pages/home.module.css`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (CSS; coberto pelo E2E de T1)
    - **Gate:** `npm run typecheck && npm run lint`; medição no navegador
    - **Feito quando:** excesso 0 px a 360 px (e com zoom de 200%) com o espaçamento, nos três idiomas, e visual igual sem ele
    - **Evidência:** (executor)

- [ ] T4 — Verificação final
    - **Arquivo(s):** nenhum
    - **Depende de:** T2, T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint && npx vitest --run --maxWorkers=2 src/components src/pages/test/Home.page.test.tsx`; CI do PR roda build e E2E
    - **Feito quando:** o gate passa e o CI do PR fica verde
    - **Evidência:** (executor)
