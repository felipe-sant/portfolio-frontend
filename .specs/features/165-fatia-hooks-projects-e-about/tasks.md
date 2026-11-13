# Tasks: Fatia os hooks useProjects e useAbout por responsabilidade

> Spec: `./spec.md` <br />
> **Status:** `em-andamento`

Regras de todas as tarefas: nenhum comentário em código; identificadores em inglês; `npm test -- --run --maxWorkers=2 <arquivo>` (nunca todos os workers); conferir `uptime` antes de Vitest/build (load acima de 14: esperar); um commit atômico por tarefa no formato `Refactor :recycle: [#165] <descrição>` (`Test :test_tube:` na T1, `Docs :bulb:` na T18; componentes novos de Projetos entram como `Refactor :recycle:` com o CSS movido no mesmo commit), sempre verde; asserção de comportamento de teste existente nunca é editada.

## Plano de execução

```
T0 → T1 → Fase Informações (T2 → T3 → T4 → T5) → Fase hooks de Projetos (T6 → T7 → T8 → T9) → Fase componentes de Projetos (T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17) → T18 → T19
```

Sequencial (as três fases editam hooks e páginas que cada uma depende de si); as fases de Informações e Projetos são independentes entre si, mas rodam uma de cada vez para o rebase e a revisão ficarem simples. Na fase de componentes, cada tarefa move uma região do JSX de `Projects.page.tsx` e as classes dela de `src/styles/pages/projects.module.css` para o módulo novo; a ordem vai das folhas para o todo (vazio, grade, Experimentos, miolo de resultados) e depois as regiões soltas, e cada tarefa deixa a página verde e funcionando.

## Tarefas

- [ ] T0 — Linha de base do HTML pré-renderizado (sem commit)
    - **Arquivo(s):** nenhum no repositório; saída em `/tmp/claude-1000/-home-felipe-faculdade-portfolio-frontend--maestri-roles-a18f6928-4d12-40d4-bc54-14ecab3390d9/31be6ed5-5491-40f9-ac17-23e0bdd173c7/scratchpad/` (ou o scratchpad da sessão)
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` com load até 14; `npm run build`; normalizar o HTML (nomes de `/assets/` sem o hash e sufixo hash das classes de CSS Module reduzido ao nome base) com um script guardado no scratchpad; gerar `sha256sum` do HTML normalizado de `about` e `projects` nos três idiomas (caminhos em `dist/` conforme `src/prerender/prerenderRoutes.ts`) e guardar a lista e o script
    - **Feito quando:** a lista de seis hashes e o script de normalização existem fora do repositório e `npx vitest run --maxWorkers=2` dos quatro arquivos da rede de segurança (`useAbout`, `useProjects`, `About.page`, `Projects.page`) está verde antes de qualquer mudança
    - **Evidência:** ...

- [x] T1 — Testes de caracterização das lacunas
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
    - **Evidência:** verde contra o código sem fatiar (3 arquivos, 164 testes). Lacunas: useAbout.test.tsx "foca o alerta da trajetória quando o retry da trajetória falha de novo" (expect(alert).toHaveFocus()), "foca o título do perfil quando o retry do perfil dá certo" (expect(heading).toHaveFocus()), "não refoca depois de tratado..." (expect(heading).not.toHaveFocus()); useProjects.test.tsx describe "breadcrumb do primeiro lote" (toBeUndefined, depois BreadcrumbList com Início antes de Projetos) e "conteúdo vazio e sem resultado" (isEmptyContent x isNoResults com e sem filtro); Projects.page.test.tsx dois `it` novos "não mostra Limpar filtros com filtro aplicado e a lista com erro" / "...enquanto a lista carrega" (queryByRole(...).not.toBeInTheDocument()), só adições.

- [x] T2 — Util `aboutElementIds`
    - **Arquivo(s):** `src/utils/aboutElementIds.ts`, `src/utils/test/aboutElementIds.test.ts`, `src/pages/hooks/useAbout.ts` (troca `FOCUS_IDS` pelo util, ids com os mesmos valores)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - os quatro ids têm os valores atuais (`about-hero-heading`, `about-profile-alert`, `about-trajectory-heading`, `about-timeline-alert`) (VAL-165-01) em `src/utils/test/aboutElementIds.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/aboutElementIds.test.ts src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx`
    - **Feito quando:** o gate passa e `FOCUS_IDS` não existe mais
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 61 testes); `FOCUS_IDS` removido; src/utils/test/aboutElementIds.test.ts "mantém os quatro ids de foco" (expect(aboutElementIds).toEqual({...os quatro valores})).

- [x] T3 — Hook `useTrajectorySelection`
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
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 67 testes). useTrajectorySelection.test.tsx (7 it): "devolve o foco ao gatilho registrado do item ao fechar, mesmo com o foco no body" (expect(button).toHaveFocus()), "fecha o item quando o caminho muda, sem alterar o histórico" (expect(window.history.length).toBe(before); selectedItem toBeNull), "mantém a identidade de registerTrigger" (toBe(first)), remoção com null, sem gatilho não lança. useAbout.test.tsx: `it` 233 e 255 mantidos, só acessores `about.trajectory.*`; About.page.test.tsx sem edição.

- [x] T4 — Hook `useAboutRetryFocus`
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
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 66 testes). useAboutRetryFocus.test.tsx (6 it): retry de cada fonte chama só o refetch dela (toHaveBeenCalledTimes), foco no título sem erro (expect(heading).toHaveFocus()), no alerta com erro, sem foco durante isFetching e foco quando cai, elemento ausente foca uma vez ao aparecer, não refoca depois de tratado (not.toHaveFocus()). useAbout.test.tsx 186 e 209 sem edição de asserção.

- [x] T5 — Formato final do retorno de `useAbout` e da página
    - **Arquivo(s):** `src/pages/hooks/useAbout.ts`, `src/pages/About.page.tsx`, `src/pages/hooks/test/useAbout.test.tsx` (só acessores)
    - **Depende de:** T4
    - **Testes (escritos antes, RED):** não se aplica (só reorganiza o retorno); a rede é `useAbout.test.tsx` e `About.page.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useAbout.test.tsx src/pages/test/About.page.test.tsx src/components/test/AboutHero.test.tsx src/components/test/AboutTrajectory.test.tsx src/components/test/AboutStack.test.tsx src/components/test/AboutComplements.test.tsx src/components/test/AboutMeSection.test.tsx`
    - **Feito quando:** o retorno tem exatamente `{ t, shareImage, jsonLd, isLoading, resume, paths, ids, profile, timeline, content, show, trajectory }`; `git diff origin/staging -- src/components src/types/about src/pages/test/About.page.test.tsx` vazio; `useAbout.ts` abaixo de 100 linhas (VAL-165-03, 08)
    - **Evidência:** gate verde (typecheck, lint, 7 arquivos, 92 testes); retorno com exatamente { shareImage, t, jsonLd, isLoading, resume, paths, ids, profile, timeline, content, show, trajectory }; `git diff origin/staging --stat -- src/components src/types/about src/pages/test/About.page.test.tsx` vazio; useAbout.ts com 88 linhas. Desvio: `language` saiu do retorno (fora do formato da spec) e o `it` "carrega o idioma novo" passou a ler `getLanguage()` no lugar de `about.language`, mesma asserção.

- [x] T6 — Hook `useProjectsSeo`
    - **Arquivo(s):** `src/pages/hooks/useProjectsSeo.ts`, `src/pages/hooks/test/useProjectsSeo.test.tsx`, `src/pages/hooks/useProjects.ts` (devolve `seo: { jsonLd, breadcrumbJsonLd }`), `src/pages/Projects.page.tsx` e `src/pages/hooks/test/useProjects.test.tsx` (só acessores `jsonLd`/`breadcrumbJsonLd` para `seo.*`)
    - **Depende de:** T5
    - **Testes (escritos antes, RED):**
        - `firstPageItems` indefinido devolve `{ jsonLd: undefined, breadcrumbJsonLd: undefined }` (VAL-165-07)
        - com itens, o `ItemList` lista os itens com título e descrição do idioma ativo em `pt-BR`, `en` e `es` (VAL-165-07)
        - breadcrumb com Início e Projetos e URLs com prefixo do idioma (VAL-165-07)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjectsSeo.test.tsx src/pages/hooks/test/useProjects.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa; o describe "JSON-LD do primeiro lote" (669) segue verde com a mesma asserção, só com acessor novo
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 151 testes). useProjectsSeo.test.tsx: "devolve os dois JSON-LD indefinidos sem itens" (toEqual({ jsonLd: undefined, breadcrumbJsonLd: undefined })) e it.each pt-BR/en/es (toMatchObject com name/description do idioma, itens Primeiro/Segundo, breadcrumb Início/Projetos e URLs com `/<idioma>"` e `/<idioma>/projects"`). Describe "JSON-LD do primeiro lote" sem mudança de asserção, só `latest.seo.jsonLd`.

- [x] T7 — Hook `useProjectsFilterOptions`
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
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 155 testes). useProjectsFilterOptions.test.tsx (8 it): "Todos" primeiro e só disponíveis na ordem do enum (toEqual(["", "web", "api", "iot"])), typeValue, categorias e ordenações do enum, technologyOptions/yearOptions vazias e depois do endpoint, perfil falhando mantém vazias, filtersCount 3 (só tech e year) e appliedFilters com sort, mudança de idioma refaz a consulta uma vez por idioma (originalArgs [{lang:"pt-BR"},{lang:"en"}]). `useProjects` não chama mais `useGetProjectFilterOptionsQuery` nem importa os enums de opções.

- [x] T8 — Hook `useProjectsResults`
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
    - **Evidência:** gate verde (typecheck, lint, 3 arquivos, 157 testes). useProjectsResults.test.tsx (10 it, `pages` simulado): texto vazio com erro e sem dados, "Carregando projetos…", "0 projetos"/"9 de 10 projetos"/"1 de 1 projeto" e inglês "9 of 10 projects", texts[0] toBe("") e depois "9 de 10 projetos" (useDeferredValue), isEmptyContent e isNoResults nas combinações, canClearFilters nas quatro condições, mainItems/experimentItems A,C / B,D, retry foca o título antes do refetch (order toEqual(["focused"])) e devolve Promise. `canClearFilters` deixou de ser calculado em Projects.page.tsx. Desvio: o tipo de entrada `pages` é `Pick` dos campos lidos com `retry: () => Promise<unknown>` (o retry real do RTK não é simulável sem cast); `useProjects` ainda devolve o formato plano (muda na T9).

- [ ] T9 — Formato final do retorno de `useProjects` e da página
    - **Arquivo(s):** `src/pages/hooks/useProjects.ts`, `src/pages/Projects.page.tsx`, `src/pages/hooks/test/useProjects.test.tsx` (`Probe` e acessores, mais os `it` 860 e 945 olhando todos os subobjetos)
    - **Depende de:** T8
    - **Testes (escritos antes, RED):** não se aplica (só reorganiza o retorno); a rede é `useProjects.test.tsx` e `Projects.page.test.tsx` (inalterado)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/hooks/test/useProjects.test.tsx src/pages/hooks/test/useProjectsFilters.test.tsx src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o retorno tem exatamente `{ t, shareImage, ids, seo, filters, search, filterBar, modal, results, list, more }`; `Projects.page.tsx` desestrutura no máximo 12 nomes; `git diff origin/staging -- src/pages/test` vazio; `useProjects.ts` abaixo de 100 linhas (VAL-165-02, 04, 08)
    - **Evidência:** ...

- [ ] T10 — Componente `ProjectsEmptyState`
    - **Arquivo(s):** `src/components/ProjectsEmptyState.tsx`, `src/components/test/ProjectsEmptyState.test.tsx`, `src/styles/components/projectsEmptyState.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T9
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - mostra `h2` com o título e o parágrafo com a descrição (VAL-165-12; herda 118)
        - sem `action` não renderiza botão e com `action` renderiza o nó depois da descrição (VAL-165-12; herda 491 e 516)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsEmptyState.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsEmptyState` para o conteúdo vazio e `projects.module.css` perdeu `emptyBox`, `emptyHeading` e `emptyText` (o uso no sem resultados passa na T13); `ProjectsEmptyStateProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T11 — Componente `ProjectsGrid`
    - **Arquivo(s):** `src/components/ProjectsGrid.tsx`, `src/components/test/ProjectsGrid.test.tsx`, `src/styles/components/projectsGrid.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T10
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - `projects=[]` com `skeletonCount` N renderiza só N itens `aria-hidden` (VAL-165-12; herda 423)
        - um `li` por projeto na ordem recebida, com `ProjectCard` e `headingLevel` repassado (VAL-165-12; herda 404)
        - `revealIndex` recomeça a cada nove e `firstIndex` desloca o `index` dos cards (VAL-165-12; herda 445 e 1465)
        - esqueletos ao fim da lista com `skeletonCount` e nenhum com 0 (VAL-165-12; herda 1489)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsGrid.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsGrid` nas duas grades e no esqueleto de carga; `ProjectListItem` e `SkeletonItems` saem da página e viram auxiliares locais de `ProjectsGrid.tsx`; `projects.module.css` perdeu `grid` e `item`; `ProjectsGridProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T12 — Componente `ProjectsExperiments`
    - **Arquivo(s):** `src/components/ProjectsExperiments.tsx`, `src/components/test/ProjectsExperiments.test.tsx`, `src/styles/components/projectsExperiments.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T11
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - `section` com `h2` e descrição, e os cards em `h3` (VAL-165-12; herda 1374-1457)
        - `firstIndex` repassado à grade e esqueletos do lote novo ao fim (VAL-165-12; herda 1489)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsExperiments.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsExperiments`; `projects.module.css` perdeu `experiments`, `experimentsHeading` e `experimentsDescription`; `ProjectsExperimentsProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T13 — Componente `ProjectsResults`
    - **Arquivo(s):** `src/components/ProjectsResults.tsx`, `src/components/test/ProjectsResults.test.tsx`, `src/pages/Projects.page.tsx`
    - **Depende de:** T12
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - carregando mostra nove esqueletos `aria-hidden` e nenhuma grade (VAL-165-12; herda 423)
        - erro mostra o `LoadError` com "Tentar novamente" que chama `list.retry` e esconde grade e vazio (VAL-165-12; herda 526)
        - `isNoResults` mostra o estado vazio com o termo (com e sem busca) e o botão que chama `onClearFilters` (VAL-165-12; herda 491 e 516)
        - só principais: grade sem seção; só experimentos: seção sem grade principal; os dois: grade e depois a seção (VAL-165-12; herda 1413 e 1437)
        - o `div` recebe `list.gridRef` (VAL-165-12; herda 404)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsResults.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsResults` no lugar de `AsyncSection` com a grade e o sem resultados, e o `ProjectsEmptyState` do sem resultados passa a viver nele; sem módulo CSS próprio (a tarefa não move classe); `ProjectsResultsProps` local, `export default`, sem comentário; o componente não importa CSS Module; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T14 — Componente `ProjectsToolbar`
    - **Arquivo(s):** `src/components/ProjectsToolbar.tsx`, `src/components/test/ProjectsToolbar.test.tsx`, `src/styles/components/projectsToolbar.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T13
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - o campo de busca tem rótulo, placeholder e `maxLength` 100 (VAL-165-12; herda 215)
        - digitar chama `search.setDraft` e limpar chama `search.clearSearch` (VAL-165-12; herda 229 e 244)
        - o botão tem `aria-haspopup="dialog"` e `aria-expanded` conforme `isFiltersOpen`, sem `aria-disabled` (VAL-165-12; herda 920 e 946)
        - o texto é "Filtros" sem contador e "Filtros (N)" com `filtersCount` maior que 0; o clique chama `onOpenFilters` (VAL-165-12; herda 920)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsToolbar.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsToolbar`; `projects.module.css` perdeu `controls` e `search`; `ProjectsToolbarProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T15 — Componente `ProjectsFilterBar`
    - **Arquivo(s):** `src/components/ProjectsFilterBar.tsx`, `src/components/test/ProjectsFilterBar.test.tsx`, `src/styles/components/projectsFilterBar.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T14
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - renderiza os grupos Tipo e Categoria com `aria-pressed` pelo valor recebido e o separador `aria-hidden` (VAL-165-12; herda 258)
        - clicar numa opção chama `setType` ou `setCategory` com o valor (VAL-165-12; herda 258)
        - `ref` e `dragProps` ficam no contêiner (VAL-165-12; herda 298)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsFilterBar.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsFilterBar`; `projects.module.css` perdeu `filters` (com o `@media`, o `data-dragging` e o `mask-image`) e `separator`; `ProjectsFilterBarProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T16 — Componente `ProjectsSummary`
    - **Arquivo(s):** `src/components/ProjectsSummary.tsx`, `src/components/test/ProjectsSummary.test.tsx`, `src/styles/components/projectsSummary.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T15
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - o `p` com `role="status"` mostra `text` e é o mesmo nó entre renderizações (VAL-165-12; herda 351)
        - o botão "Limpar filtros" só existe com `canClear` e o clique chama `onClear` (VAL-165-12; herda 378)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsSummary.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsSummary` com `results.canClearFilters`; `projects.module.css` perdeu `summary` e `count`; `ProjectsSummaryProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T17 — Componente `ProjectsLoadMore`
    - **Arquivo(s):** `src/components/ProjectsLoadMore.tsx`, `src/components/test/ProjectsLoadMore.test.tsx`, `src/styles/components/projectsLoadMore.module.css`, `src/styles/pages/projects.module.css` (remove as classes movidas), `src/pages/Projects.page.tsx`
    - **Depende de:** T16
    - **Testes (escritos antes, RED):** (`render` com props simuladas, sem store; texto em português)
        - com `loadMoreError` mostra o `LoadError` com o `id` recebido e "Tentar novamente" chama `retryLoadMore` (VAL-165-12; herda 469)
        - o botão só existe com `hasMore` e sem `isListError` (VAL-165-12; herda 404)
        - com `isFetchingMore` o botão fica `loading` sem desabilitar e o segundo clique é ignorado (VAL-165-12; herda 445)
        - sem violação de axe (`expectNoAxeViolations(container)`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/components/test/ProjectsLoadMore.test.tsx src/pages/test/Projects.page.test.tsx src/pages/hooks/test/useProjects.test.tsx`
    - **Feito quando:** a página usa `ProjectsLoadMore`; `projects.module.css` fica só com `container`, `heading` e `intro`; `Projects.page.tsx` tem no máximo cerca de 90 linhas, desestrutura no máximo 12 nomes e não importa mais `Button`, `AsyncSection`, `FilterGroup`, `SearchInput`, `LoadError`, `ProjectCard` nem `ProjectCardSkeleton` (VAL-165-08, 12 e 13); `ProjectsLoadMoreProps` local, `export default`, sem comentário; toda classe `css.x` existe no módulo novo com declaração idêntica à da `staging`; `Projects.page.test.tsx` sem edição e verde
    - **Evidência:** ...

- [ ] T18 — Documentação
    - **Arquivo(s):** `docs/screens/about.md` (parágrafo de `useAbout`, linha cerca de 454), `docs/screens/projects.md` (Implementação de `useProjects` e dos componentes novos), `docs/architecture/components.md` (catálogo: acrescentar os oito componentes e trocar a menção ao `ProjectListItem` local da página), `docs/architecture/frontend.md` se citar hooks ou o formato antigo, e qualquer outro `docs/` achado por `grep -rn "useProjects\|useAbout\|ProjectListItem" docs/` que cite o formato antigo
    - **Depende de:** T17
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint` e `grep -rn "useAboutRetryFocus\|useTrajectorySelection\|useProjectsResults\|ProjectsToolbar\|ProjectsLoadMore" docs/` com ao menos uma ocorrência por hook e por componente novo
    - **Feito quando:** a documentação cita os cinco hooks novos, o util `aboutElementIds`, o formato por subobjetos e os oito componentes de Projetos no catálogo, sem texto de UI nem comentário em código (VAL-165-11)
    - **Evidência:** ...

- [ ] T19 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` até 14; `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada); depois comparar os seis `sha256sum` do HTML normalizado com os da T0 (mesmo script); depois `npm run build:fatec` e `npx playwright test e2e/about.spec.ts e2e/projects.spec.ts e2e/projects-filters.spec.ts e2e/no-javascript.spec.ts e2e/accessibility.spec.ts e2e/keyboard.spec.ts` (um de cada vez); conferir `git diff origin/staging -- src/components/About*.tsx src/components/AsyncSection.tsx src/types/about src/pages/test e2e` vazio (exceto a adição eventual da T1 em `Projects.page.test.tsx`), que `src/styles/pages/projects.module.css` ficou só com `container`, `heading` e `intro` (VAL-165-13), o grep de memoização do VAL-165-09 e a verificação visual do VAL-165-14 (Projetos em claro e escuro, 375, 768 e 1280 px, comparada com a `staging`); por fim `npm run changeset` com `patch` (não vazio)
    - **Feito quando:** tudo passa, os seis hashes são iguais aos da T0, o changeset `patch` existe e os critérios VAL-165-01 a 14 estão marcados
    - **Evidência:** ...
