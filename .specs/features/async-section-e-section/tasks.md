# Tasks: AsyncSection e Section para o padrão carregando, erro e dados

> Spec: `./spec.md`

## Plano de execução

```
Fase 1 (T1 [P] e T2 [P])  →  Fase 2 (T3 [P] e T4 [P])  →  Fase 3 (T5 e T6)
```

Pré-requisito: o PO responde as questões em aberto 1 a 3 da spec; mudou a resposta, a spec volta para ajuste antes do `executor`. Refatoração: os testes de página existentes (`About`, `Home`, `Projects`) são a rede de segurança e não mudam.

## Tarefas

- [ ] T1 [P] — `AsyncSection`
    - **Arquivo(s):** `src/components/AsyncSection.tsx`, `src/components/test/AsyncSection.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - `isLoading` mostra só o esqueleto, sem `LoadError` nem filhos (CA1) em `src/components/test/AsyncSection.test.tsx`
        - `isError` mostra o `LoadError` com `role="alert"` e depois os filhos; o botão chama `onRetry` (CA1), mesmo arquivo
        - `announce={false}` não põe `role` e `id` é repassado ao `LoadError` (CA1), mesmo arquivo
        - sem erro nem carregamento mostra só os filhos (CA1), mesmo arquivo
        - `expectNoAxeViolations(container)` nos três estados (CA1), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/AsyncSection.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado existe
    - **Evidência:** (executor)

- [ ] T2 [P] — `Section`
    - **Arquivo(s):** `src/components/Section.tsx`, `src/styles/components/section.module.css`, `src/components/test/Section.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - rende `<section>` com `aria-labelledby` apontando para o `h2` com o texto e o `id` dados (CA2) em `src/components/test/Section.test.tsx`
        - com `reveal` envolve em `Reveal`; sem `reveal` não (CA2), mesmo arquivo
        - `h2` focável tem `tabIndex={-1}`; sem a opção não tem (CA2), mesmo arquivo
        - a dica aparece abaixo do `h2` só quando informada (CA2), mesmo arquivo
        - `expectNoAxeViolations(container)` (CA2), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/Section.test.tsx`
    - **Feito quando:** o gate passa; `.container` e `.sectionHeading` com os mesmos valores de `about.module.css`
    - **Evidência:** (executor)

- [ ] T3 [P] — Informações em partes
    - **Arquivo(s):** `src/components/AboutHero.tsx`, `AboutMeSection.tsx`, `AboutTrajectory.tsx`, `AboutStack.tsx`, `AboutComplements.tsx`, `src/pages/About.page.tsx`, `src/styles/pages/about.module.css`, `src/components/test/About*.test.tsx`
    - **Depende de:** T1, T2
    - **Testes (escritos antes, RED):**
        - cada parte, com dados, carregando e erro (com `id` e `announce` como hoje), mostra o texto em português (CA3) em `src/components/test/AboutHero.test.tsx`, `AboutMeSection.test.tsx`, `AboutTrajectory.test.tsx`, `AboutStack.test.tsx` e `AboutComplements.test.tsx`
        - cada parte passa em `expectNoAxeViolations` (CA3), mesmos arquivos
        - `src/pages/test/About.page.test.tsx` segue verde sem alteração (CA3, CA5)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test src/pages/test/About.page.test.tsx`
    - **Feito quando:** o gate passa; `About.page.tsx` sem `SkeletonSwap` nem `LoadError` e abaixo de 120 linhas; nenhuma classe de `about.module.css` sem uso
    - **Evidência:** (executor)

- [ ] T4 [P] — `AsyncSection` no Início e em Projetos
    - **Arquivo(s):** `src/pages/Home.page.tsx`, `src/pages/Projects.page.tsx`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (refatoração); `src/pages/test/Home.page.test.tsx` e `src/pages/test/Projects.page.test.tsx` seguem verdes sem alteração (CA4)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/test/Home.page.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa; nenhum par `SkeletonSwap` + `LoadError` escrito à mão sobra nas duas páginas
    - **Evidência:** (executor)

- [ ] T5 — Documentação
    - **Arquivo(s):** `docs/architecture/components.md`
    - **Depende de:** T3, T4
    - **Testes (escritos antes, RED):** não se aplica (documentação); `npm run lint` verde (CA7)
    - **Gate:** `npm run lint`
    - **Feito quando:** o catálogo lista `AsyncSection`, `Section` e as cinco partes, com a frase de quando usar cada uma
    - **Evidência:** (executor)

- [ ] T6 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1 a T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` (carga abaixo de 14) e `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada); o E2E roda no CI do PR. Depois, `npm run changeset -- --empty`
    - **Feito quando:** o gate passa
    - **Evidência:** (executor)

## Verificação manual (fora do TDD, com o PO)

- `npm run dev -- --port <porta> --strictPort`: `/pt-BR/about`, `/pt-BR` e `/pt-BR/projects`, claro e escuro, rede lenta, falha forçada do dado e movimento reduzido, comparando com a `staging`.
