# Tasks: Fatia os hooks useProjects e useAbout por responsabilidade

> Spec: `./spec.md`

Regras de todas as tarefas: nenhum comentário em código; identificadores em inglês; `npm test -- --run --maxWorkers=2 <arquivo>` (nunca todos os workers); conferir `uptime` antes de Vitest/build (load acima de 14: esperar); um commit atômico por tarefa no formato `Refactor :recycle: [#165] <descrição>` (`Test :test_tube:` na T1, `Docs :bulb:` na T10), sempre verde; asserção de comportamento de teste existente nunca é editada.

## Plano de execução

```
T0 → T1 → Fase Informações (T2 → T3 → T4 → T5) → Fase Projetos (T6 → T7 → T8 → T9) → T10 → T11
```

Sequencial (as duas fases editam hooks e páginas que cada uma depende de si); as fases de Informações e Projetos são independentes entre si, mas rodam uma de cada vez para o rebase e a revisão ficarem simples.

## Tarefas

- [ ] T0 — Linha de base do HTML pré-renderizado (sem commit)
    - **Arquivo(s):** nenhum no repositório; saída em `/tmp/claude-1000/-home-felipe-faculdade-portfolio-frontend--maestri-roles-a18f6928-4d12-40d4-bc54-14ecab3390d9/31be6ed5-5491-40f9-ac17-23e0bdd173c7/scratchpad/` (ou o scratchpad da sessão)
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` com load até 14; `npm run build`; gerar `sha256sum` dos HTML de `about` e `projects` nos três idiomas (caminhos em `dist/` conforme `src/prerender/prerenderRoutes.ts`) e guardar a lista
    - **Feito quando:** a lista de seis hashes existe fora do repositório e `npx vitest run --maxWorkers=2` dos quatro arquivos da rede de segurança (`useAbout`, `useProjects`, `About.page`, `Projects.page`) está verde antes de qualquer mudança
    - **Evidência:** ...

- [ ] T1 — Testes de caracterização das lacunas
    - **Arquivo(s):** `src/pages/hooks/test/useAbout.test.tsx`, `src/pages/hooks/test/useProjects.test.tsx` (e `src/pages/test/Projects.page.test.tsx` só se faltar o caso de `canClearFilters`; nesse caso é adição, nunca edição de asserção, e a regra do VAL-165-02 vale a partir da T2)
    - **Depende de:** T0
    - **Testes (escritos antes, RED):** estes testes caracterizam o código atual e passam já (verde); ler os `it` listados em "Lacunas" da spec e acrescentar só o que faltar:
        - retry da trajetória que falha de novo foca `about-timeline-alert`; retry do perfil com sucesso foca `about-hero-heading` (VAL-165-05) em `useAbout.test.tsx`
        - depois do foco tratado, nova renderização não refoca (VAL-165-05) em `useAbout.test.tsx`
        - `breadcrumbJsonLd` indefinido carregando e com Início > Projetos ao chegar a lista (VAL-165-07) em `useProjects.test.tsx`
        - `canClearFilters` falso com filtro + erro e com filtro + carregando (VAL-165-07), em `Projects.page.test.tsx` se `it` 329/378 não cobrirem
        - `isEmptyContent` x `isNoResults` com e sem filtro (VAL-165-07) em `useProjects.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useAbout.test.tsx src/pages/hooks/test/useProjects.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa contra o código sem fatiar (se algum caso falhar, é bug real: parar e avisar o Orc em vez de mudar o código) e cada lacuna da spec tem um `it` identificável
    - **Evidência:** ...

- [ ] T2 — Util `aboutElementIds`
    - **Arquivo(s):** `src/utils/aboutElementIds.ts`, `src/utils/test/aboutElementIds.test.ts`, `src/pages/hooks/useAbout.ts` (troca `FOCUS_IDS` pelo util, ids com os mesmos valores)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - os quatro ids têm os valores atuais (`about-hero-heading`, `about-profile-alert`, `about-trajectory-heading`, `about-timeline-alert`) (VAL-165-01) em `src/utils/test/aboutElementIds.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/aboutElementIds.test.ts src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx`
    - **Feito quando:** o gate passa e `FOCUS_IDS` não existe mais
    - **Evidência:** ...

- [ ] T3 — Hook `useTrajectorySelection`
    - **Arquivo(s):** `src/pages/hooks/useTrajectorySelection.ts`, `src/pages/hooks/test/useTrajectorySelection.test.tsx`, `src/pages/hooks/useAbout.ts` (passa a chamar o hook e a devolver `trajectory: { selectedItem, open, close, registerTrigger }`), `src/pages/hooks/test/useAbout.test.tsx` e `src/pages/About.page.tsx` (só acessores: `selectedItem`/`open`/`close`/`registerTrigger` viram `trajectory.*`)
    - **Depende de:** T2
    - **Testes (escritos antes, RED):** (`MemoryRouter` com `renderHook`, refs reais no DOM)
        - `registerTrigger(id)` remove o gatilho ao receber `null` e mantém a identidade entre renderizações (VAL-165-06)
        - `open` guarda o item e `close` o limpa (VAL-165-06)
        - ao fechar o foco vai ao gatilho registrado do item, também com o foco no `body` (VAL-165-06; herda o `it` 233 de `useAbout.test.tsx`)
        - sem gatilho registrado, fechar não lança e não foca nada (VAL-165-06)
        - mudar o `pathname` fecha o item sem alterar o histórico e sem `useEffect` de reset (VAL-165-06; herda o `it` 255)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useTrajectorySelection.test.tsx src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx`
    - **Feito quando:** o gate passa; os `it` 233 e 255 de `useAbout.test.tsx` continuam presentes com a mesma asserção; `About.page.test.tsx` sem edição
    - **Evidência:** ...

- [ ] T4 — Hook `useAboutRetryFocus`
    - **Arquivo(s):** `src/pages/hooks/useAboutRetryFocus.ts`, `src/pages/hooks/test/useAboutRetryFocus.test.tsx`, `src/pages/hooks/useAbout.ts`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** (`renderHook` com fontes simuladas controláveis por `rerender`, elementos com os ids de `aboutElementIds` no DOM)
        - `retryProfile` chama só o `refetch` do perfil e `retryTimeline` só o da trajetória (VAL-165-05)
        - fonte sem erro depois do retry: foco no título (VAL-165-05; herda `it` 186)
        - fonte com erro depois do retry: foco no alerta (VAL-165-05; herda `it` 209)
        - com a fonte em `isFetching` nada é focado e o foco acontece quando `isFetching` cai (VAL-165-05)
        - elemento ausente no DOM: não foca nem marca como tratado; ao aparecer, foca uma vez (VAL-165-05)
        - depois de tratado, nova renderização não refoca (VAL-165-05; herda o teste da T1)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useAboutRetryFocus.test.tsx src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx`
    - **Feito quando:** o gate passa; `retry` de `profile` e `timeline` em `useAbout` vêm do hook novo; `useAbout.test.tsx` mantém 186 e 209 sem edição de asserção
    - **Evidência:** ...

- [ ] T5 — Formato final do retorno de `useAbout` e da página
    - **Arquivo(s):** `src/pages/hooks/useAbout.ts`, `src/pages/About.page.tsx`, `src/pages/hooks/test/useAbout.test.tsx` (só acessores)
    - **Depende de:** T4
    - **Testes (escritos antes, RED):** não se aplica (só reorganiza o retorno); a rede é `useAbout.test.tsx` e `About.page.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx src/components/test/AboutHero.test.tsx src/components/test/AboutTrajectory.test.tsx src/components/test/AboutStack.test.tsx src/components/test/AboutComplements.test.tsx src/components/test/AboutMeSection.test.tsx`
    - **Feito quando:** o retorno tem exatamente `{ t, shareImage, jsonLd, isLoading, resume, paths, ids, profile, timeline, content, show, trajectory }`; `git diff origin/staging -- src/components src/types/about src/pages/test/About.page.test.tsx` vazio; `useAbout.ts` abaixo de 100 linhas (VAL-165-03, 08)
    - **Evidência:** ...

- [ ] T6 — Hook `useProjectsSeo`
    - **Arquivo(s):** `src/pages/hooks/useProjectsSeo.ts`, `src/pages/hooks/test/useProjectsSeo.test.tsx`, `src/pages/hooks/useProjects.ts` (devolve `seo: { jsonLd, breadcrumbJsonLd }`), `src/pages/Projects.page.tsx` e `src/pages/hooks/test/useProjects.test.tsx` (só acessores `jsonLd`/`breadcrumbJsonLd` para `seo.*`)
    - **Depende de:** T5
    - **Testes (escritos antes, RED):**
        - `firstPageItems` indefinido devolve `{ jsonLd: undefined, breadcrumbJsonLd: undefined }` (VAL-165-07)
        - com itens, o `ItemList` lista os itens com título e descrição do idioma ativo em `pt-BR`, `en` e `es` (VAL-165-07)
        - breadcrumb com Início e Projetos e URLs com prefixo do idioma (VAL-165-07)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjectsSeo.test.tsx src/pages/hooks/test/useProjects.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa; o describe "JSON-LD do primeiro lote" (669) segue verde com a mesma asserção, só com acessor novo
    - **Evidência:** ...

- [ ] T7 — Hook `useProjectsFilterOptions`
    - **Arquivo(s):** `src/pages/hooks/useProjectsFilterOptions.ts`, `src/pages/hooks/test/useProjectsFilterOptions.test.tsx`, `src/pages/hooks/useProjects.ts`
    - **Depende de:** T6
    - **Testes (escritos antes, RED):** (store real com `stubContentFetch`, como em `useProjects.test.tsx`)
        - `typeOptions` começa com "Todos" e lista só `availableTypes` na ordem do enum (VAL-165-07; herda 334)
        - `typeValue` vazio sem tipo e igual ao tipo aplicado (VAL-165-07; herda 358)
        - `categoryOptions` traz todas as categorias do enum e `sortOptions` todas as ordenações (VAL-165-07)
        - `technologyOptions` e `yearOptions` vêm do endpoint por idioma e ficam vazios enquanto carrega e com o perfil falhando (VAL-165-07; herda 801-860)
        - `filtersCount` conta só tecnologia e ano e `appliedFilters` traz `tech`, `year` e `sort` (VAL-165-07; herda 929)
        - muda o idioma: refaz a consulta de opções uma vez (VAL-165-07; herda 821)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjectsFilterOptions.test.tsx src/pages/hooks/test/useProjects.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa; `useProjects` não chama mais `projectsApi.useGetProjectFilterOptionsQuery` nem importa os enums de opções
    - **Evidência:** ...

- [ ] T8 — Hook `useProjectsResults`
    - **Arquivo(s):** `src/pages/hooks/useProjectsResults.ts`, `src/pages/hooks/test/useProjectsResults.test.tsx`, `src/pages/hooks/useProjects.ts`
    - **Depende de:** T7
    - **Testes (escritos antes, RED):** (`renderHook` com um `pages` simulado e `MemoryRouter` quando preciso; `setLanguage` dentro do `it`)
        - texto vazio com erro e sem dados; "carregando" enquanto carrega; `countNone` e `count` com `total` e `shown` (VAL-165-07; herda 170 e 384)
        - o texto inicial é `""` sem dados e o anterior se mantém até o novo chegar (`useDeferredValue`) (VAL-165-07; herda 546)
        - `isEmptyContent` só com dados, `total` 0, sem filtro e sem tipo disponível; `isNoResults` com `total` 0 e não vazio (VAL-165-07)
        - `canClearFilters` verdadeiro só com `hasFilters`, sem carregando, sem erro e sem `isNoResults` (VAL-165-07)
        - `mainItems` e `experimentItems` na ordem recebida (VAL-165-07; herda 148 e 160)
        - `retry` foca `#projects-heading` antes do `refetch` e devolve a promessa (VAL-165-07; herda 565)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjectsResults.test.tsx src/pages/hooks/test/useProjects.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa; `canClearFilters` deixa de ser calculado em `Projects.page.tsx`
    - **Evidência:** ...

- [ ] T9 — Formato final do retorno de `useProjects` e da página
    - **Arquivo(s):** `src/pages/hooks/useProjects.ts`, `src/pages/Projects.page.tsx`, `src/pages/hooks/test/useProjects.test.tsx` (`Probe` e acessores, mais os `it` 860 e 945 olhando todos os subobjetos)
    - **Depende de:** T8
    - **Testes (escritos antes, RED):** não se aplica (só reorganiza o retorno); a rede é `useProjects.test.tsx` e `Projects.page.test.tsx` (inalterado)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjects.test.tsx src/pages/hooks/test/useProjectsFilters.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o retorno tem exatamente `{ t, shareImage, ids, seo, filters, search, filterBar, modal, results, list, more }`; `Projects.page.tsx` desestrutura no máximo 12 nomes; `git diff origin/staging -- src/pages/test` vazio; `useProjects.ts` abaixo de 100 linhas (VAL-165-02, 04, 08)
    - **Evidência:** ...

- [ ] T10 — Documentação
    - **Arquivo(s):** `docs/screens/about.md` (parágrafo de `useAbout`, linha cerca de 454), `docs/screens/projects.md` (Implementação de `useProjects`), e qualquer outro `docs/` achado por `grep -rn "useProjects\|useAbout" docs/` que cite o formato antigo
    - **Depende de:** T9
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint` e `grep -rn "useAboutRetryFocus\|useTrajectorySelection\|useProjectsResults" docs/` com ao menos uma ocorrência por hook novo
    - **Feito quando:** a documentação cita os cinco hooks novos, o util `aboutElementIds` e o formato por subobjetos, sem texto de UI nem comentário em código (VAL-165-11)
    - **Evidência:** ...

- [ ] T11 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` até 14; `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada); depois comparar os seis `sha256sum` do HTML com os da T0; depois `npm run build:fatec` e `npx playwright test e2e/about.spec.ts e2e/projects.spec.ts e2e/projects-filters.spec.ts e2e/no-javascript.spec.ts e2e/accessibility.spec.ts e2e/keyboard.spec.ts` (um de cada vez); conferir `git diff origin/staging -- src/components src/types/about src/pages/test e2e` vazio (exceto a adição eventual da T1 em `Projects.page.test.tsx`) e o grep de memoização do VAL-165-09
    - **Feito quando:** tudo passa, os seis hashes são iguais aos da T0 e os critérios VAL-165-01 a 11 estão marcados
    - **Evidência:** ...
