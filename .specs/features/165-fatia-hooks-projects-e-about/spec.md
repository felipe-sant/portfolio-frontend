# Spec: Fatia os hooks useProjects e useAbout por responsabilidade

> **Tipo:** `feature` (refatoração pura) <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#165` <br />
> **Criado em:** `12-11-2026`

A feature **não tem tela nova nem muda tela**: Informações e Projetos continuam idênticas. O `qa` só precisa confirmar a ausência de regressão visual e de a11y nelas (checagem manual e E2E existentes); não há critério novo de interface.

## Problema

`src/pages/Projects.page.tsx` desestrutura 38 campos de `useProjects()` (141 linhas), que mistura sete responsabilidades: filtros da URL, páginas, opções de filtro, texto de resultados, estados de tela vazia, JSON-LD e abertura do modal. `src/pages/hooks/useAbout.ts` (166 linhas) devolve cerca de 20 campos e mistura leitura dos dados, foco depois do retry, seleção do item da trajetória (com foco devolvido ao gatilho) e JSON-LD. A separação página/hook é consistente e testada, mas o acoplamento dificulta evoluir (achado C-04 da revisão de 08/11/2026).

`useProjects` já delega a `useProjectsFilters` (URL, busca, tipo e categoria) e a `useProjectsPages` (paginação e foco no novo lote). O que sobra nele é o que esta issue fatia.

## Objetivo

1. `useProjects` vira um compositor de cerca de 60 linhas que chama `useProjectsFilters`, `useProjectsPages` e três hooks novos e devolve **subobjetos** por responsabilidade; `Projects.page.tsx` desestrutura cerca de 11 nomes (hoje 38).
2. `useAbout` perde o foco depois do retry e a seleção da trajetória para dois hooks novos e devolve subobjetos; `About.page.tsx` continua passando às cinco partes de `src/components/About*.tsx` os mesmos subobjetos `AboutProfileState` e `AboutTimelineState` (o contrato fixado pela #164).
3. **Nenhum comportamento muda** (ver "O que NÃO pode mudar"). Nenhum texto de UI, chave de tradução, rota, CSS, dado, pré-renderização ou E2E é alterado.
4. Sem memoização nova (`useMemo`/`useCallback`/`React.memo`) sem medição: o `useCallback` de `registerTrigger` que já existe e o `useMemo` de `useProjectsFilters` são movidos ou mantidos como estão, nunca ampliados.

## Fora de escopo

- Extrair JSX de `Projects.page.tsx` para componentes novos (ver pergunta Q2).
- Mudar `useProjectsFilters` e `useProjectsPages` (já são fatias coesas; ficam como estão).
- Mudar props, estilo ou testes de `AboutHero`, `AboutMeSection`, `AboutTrajectory`, `AboutStack`, `AboutComplements` e `AsyncSection`.
- Mudar `useHome`, `useProject`, `useProjectDocument`, `useContact`.
- Texto de UI, traduções (R2 não é tocada: nenhum texto é criado, alterado ou removido), rotas, dados mock, contrato de API.
- Memoização, `React.lazy`, otimização de desempenho.

## O que NÃO pode mudar

Regra única: dado o mesmo estado da store, da URL e do idioma, o DOM, o foco e o JSON-LD resultantes são idênticos aos da `staging`.

1. **HTML pré-renderizado** (`src/prerender/`, `entry-server`): o HTML de `/pt-BR/about`, `/en/about`, `/es/about`, `/pt-BR/projects`, `/en/projects` e `/es/projects` gerado por `npm run build` é byte a byte igual ao da `staging` (comparação por hash na tarefa T0 e na T11). A primeira renderização do cliente continua igual à do servidor: `useProjectsFilters` mantém `filters = hasHydrated ? urlFilters : DEFAULT_FILTERS` e o `useDeferredValue` do texto de resultados mantém o valor inicial `pages.hasData ? currentResultsText : ""`. As chaves `suppressHydrationWarning` em elementos com `useReveal` ficam como estão.
2. **Foco, na mesma ordem e no mesmo momento:**
    - Informações: depois do retry do perfil ou da trajetória (`retry` faz `refetch` e só depois registra o pedido), o foco vai ao título (`about-hero-heading` / `about-trajectory-heading`) se deu certo e ao alerta (`about-profile-alert` / `about-timeline-alert`) se falhou de novo; só dispara com a fonte fora de `isFetching`, só quando o elemento existe e **uma vez por pedido** (`handledRetry`).
    - Informações: ao fechar o modal da trajetória o foco volta ao botão do item guardado por `registerTrigger`, também quando o foco caiu no `body` (Safari); o item fecha sozinho quando o `pathname` muda, sem escrever no histórico; o `setSelected(null)` durante o render (derivação por `pathname`) continua sem `useEffect`.
    - Projetos: `retry` foca `#projects-heading` **antes** de chamar `refetch` e devolve a promessa; `clearFilters` foca `#projects-search`; o primeiro card novo ganha foco depois de "Carregar mais"; o alerta `#projects-load-more-alert` ganha foco quando o carregamento do próximo lote falha; o botão "Filtros" recebe o foco de volta ao fechar o modal (responsabilidade do `Modal`, que não muda).
3. **Acessibilidade:** `<p role={"status"}>` com o texto de resultados existe desde a primeira renderização e é o mesmo nó (sem remontar); `LoadError` com `role="alert"` e `announce` como hoje; `VisuallyHidden role={"status"}` de carregando em Informações; ids `about-*` e `projects-*` iguais; `aria-haspopup="dialog"` e `aria-expanded={isFiltersOpen}` do botão Filtros; nenhuma violação do axe nos testes de página.
4. **JSON-LD:** `buildAboutJsonLd(language, { name: t("common:authorName") }, profile, timeline)` com os mesmos argumentos (inclusive `undefined` enquanto carrega); `buildProjectsJsonLd` e `buildBreadcrumbJsonLd` só com `pages.firstPageItems` definido e `undefined` caso contrário; `ItemList` acompanha o primeiro lote (D65); o breadcrumb tem Início > Projetos com `ROUTES.home` e `ROUTES.projects` e `t("common:navigation.*")`.
5. **`useDeferredValue` do texto de resultados:** o texto continua passando por `useDeferredValue(currentResultsText, pages.hasData ? currentResultsText : "")` dentro de um hook (nunca fora de um componente/hook nem condicional), de modo que a região de status mantém o texto anterior até o novo chegar e o primeiro valor é `""` sem dados.
6. **Ordem das chamadas de hooks e dos efeitos:** a ordem relativa de `useShareImage`, `useTranslation`, `useLanguage`, filtros, busca de páginas e opções fica a mesma; nenhuma query nova é aberta nem repetida (testes de contagem de requisição seguem verdes).
7. **Regras de negócio preservadas ao mover:** `isEmptyContent`, `isNoResults`, `canClearFilters` (hoje na página: `hasFilters && !isLoading && !isError && !isNoResults`), `filtersCount` (só tecnologia e ano), `appliedFilters`, opções de tipo (só os disponíveis, na ordem do enum), `splitExperiments` sem reordenar, `show.*` de Informações.

## Rede de segurança (testes que já existem)

Todos rodam com `npm test -- --run --maxWorkers=2 <arquivo>` e **não podem ter asserção de comportamento editada**; só mudam acessores quando o formato do retorno muda (T5 e T9) e Probe/`renderUseAbout`.

| Arquivo                                                                                                                                                                                                                                                 | O que prova                                                                                                                                                                                                                                                                                                                               | Efeito da fatia                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/hooks/test/useAbout.test.tsx` (294 linhas, 15 `it`)                                                                                                                                                                                          | consulta só perfil e trajetória por idioma, não repete com store hidratada, carregando, ordenação da stack e grupos, erro por fonte, `show.*`, retry por fonte com foco no título/alerta (186, 209), abrir/fechar item com foco devolvido e fechamento por mudança de caminho (233, 255), JSON-LD, caminho de contato                     | Fica como teste de integração do compositor; só os acessores mudam (`about.profile`, `about.content.*`, `about.trajectory.*`). Os `it` 186, 209, 233 e 255 são a referência do comportamento que os hooks novos herdam                                                                                                                        |
| `src/pages/hooks/test/useProjects.test.tsx` (954 linhas, 63 `it`)                                                                                                                                                                                       | URL, debounce 300 ms, `clearSearch`/`clearFilters`, tipo e categoria, ordem da URL, paginação (lotes de 9, esqueletos, foco do novo card, falha e retry de lote), restauração de `state.pages`, retry com foco no título (565), JSON-LD do primeiro lote (describe 669), opções, contador e modal (describe 786), contagem de requisições | Mesmos casos, com o `Probe` (linhas 39-70) adaptado ao novo formato: `items`/`shown` viram `[...list.mainItems, ...list.experimentItems]` e seu tamanho; `latest.retryLoadMore` vira `latest.more.retryLoadMore`; o `it` 945 ("não expõe setSort nem setTechAndYear") e o 860 ("sem expor canOpenFilters") passam a olhar todos os subobjetos |
| `src/pages/hooks/test/useProjectsFilters.test.tsx`                                                                                                                                                                                                      | filtros da URL                                                                                                                                                                                                                                                                                                                            | Inalterado                                                                                                                                                                                                                                                                                                                                    |
| `src/pages/test/About.page.test.tsx` (655 linhas)                                                                                                                                                                                                       | estrutura, estados carregando/erro/vazio, modal da trajetória, metadados e JSON-LD, Reveal, axe                                                                                                                                                                                                                                           | **Inalterado e verde**: é a prova de que o DOM não mudou                                                                                                                                                                                                                                                                                      |
| `src/pages/test/Projects.page.test.tsx` (1507 linhas)                                                                                                                                                                                                   | região de status desde o início (351), Limpar filtros só com busca/tipo/categoria (329, 378), modal de filtros, experimentos, breadcrumb, axe                                                                                                                                                                                             | **Inalterado e verde**                                                                                                                                                                                                                                                                                                                        |
| `src/components/test/About*.test.tsx`, `AsyncSection.test.tsx`                                                                                                                                                                                          | partes recebem `AboutProfileState`/`AboutTimelineState`                                                                                                                                                                                                                                                                                   | Inalterados                                                                                                                                                                                                                                                                                                                                   |
| `src/prerender/test/prerenderRoutes.test.ts`, `src/test/entry-server*.test.tsx`                                                                                                                                                                         | entradas e HTML do servidor                                                                                                                                                                                                                                                                                                               | Inalterados e verdes                                                                                                                                                                                                                                                                                                                          |
| `e2e/about.spec.ts` (modal 444-540, retry 641-700), `e2e/projects.spec.ts` (foco de lotes 996, busca, vazio 331), `e2e/projects-filters.spec.ts` (foco ao fechar 271), `e2e/no-javascript.spec.ts`, `e2e/accessibility.spec.ts`, `e2e/keyboard.spec.ts` | fluxos reais, foco, axe e HTML sem JavaScript                                                                                                                                                                                                                                                                                             | Não editados; rodados na T11 (precisa de `npm run build:fatec` antes)                                                                                                                                                                                                                                                                         |

### Lacunas (testes de caracterização escritos primeiro, na T1)

Confirmar na T1 lendo os testes e só escrever o que faltar:

- Informações: retry da **trajetória** que falha de novo foca `about-timeline-alert` (hoje só o retry do perfil prova o alerta, `it` 209) e retry do perfil com sucesso foca `about-hero-heading`.
- Informações: depois de o foco ter sido aplicado, uma nova renderização (mudança de `isFetching` de outra fonte) **não** refoca (prova do `handledRetry`).
- Projetos: `breadcrumbJsonLd` fica `undefined` enquanto carrega e traz Início > Projetos quando a lista chega, no nível do hook (hoje só pela página).
- Projetos: `canClearFilters` (regra que sai da página para o hook): com filtro e erro da lista, com filtro e sem resultado e com filtro e carregando o botão "Limpar filtros" do resumo **não** aparece; confirmar nos `it` 329/378 da página e acrescentar o caso de erro/carregando se faltar.
- Projetos: `isEmptyContent` com e sem filtro ativo e com `availableTypes` vazio (conteúdo vazio) versus `isNoResults`.

## Proposta de fatias

### Informações

Novo util `src/utils/aboutElementIds.ts` (`export default`), com os quatro ids hoje em `FOCUS_IDS` (`profileHeading`, `profileAlert`, `timelineHeading`, `timelineAlert`), no mesmo molde de `projectsElementIds`. Os valores **não** mudam.

| Hook novo                                   | Responsabilidade                                                                                          | Entrada                                                                                                                                                                                                                        | Saída                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `src/pages/hooks/useAboutRetryFocus.ts`     | Refazer a fonte e focar título ou alerta depois do retry (`retryRequest`, `handledRetry`, efeito de foco) | `{ profile: SourceState, timeline: SourceState }`, onde `SourceState = { isFetching: boolean; isError: boolean; refetch: () => Promise<unknown> }` (tipo local, não exportado); `isError` já vem como `isError && !isFetching` | `{ retryProfile: () => Promise<void>, retryTimeline: () => Promise<void> }` |
| `src/pages/hooks/useTrajectorySelection.ts` | Item aberto da trajetória, derivação por `pathname`, foco devolvido ao gatilho e registro dos gatilhos    | nada (lê `useLocation`)                                                                                                                                                                                                        | `{ selectedItem: TimelineItem \| null, open, close, registerTrigger }`      |

`useAbout` fica com: `useShareImage`, `useTranslation`, `useLanguage`, `useLocalizedPath`, `useResume`, as duas queries RTK, a derivação (`stackGroups`, `groups`, `certificates`, `workPrinciples`, `updatedLabel`, `show.*`) e o JSON-LD, chamando os dois hooks novos. Se passar de cerca de 90 linhas, a derivação vira função pura em `src/utils/` (decisão do executor, sem mudar a saída).

**Formato final do retorno de `useAbout`:**

```ts
{
    t, shareImage, jsonLd, isLoading, resume,
    paths: { contact },
    ids: aboutElementIds,
    profile: AboutProfileState,
    timeline: AboutTimelineState,
    content: { stackGroups, workPrinciples, updatedLabel },
    show: { stack, trajectory, certificates, workStyle, complements },
    trajectory: { selectedItem, open, close, registerTrigger }
}
```

`profile.retry` e `timeline.retry` vêm de `useAboutRetryFocus`. Os tipos `AboutProfileState` e `AboutTimelineState` **não mudam**. `About.page.tsx` passa os mesmos props de hoje às cinco partes (`profile`, `timeline`, `ids.*`, `content.stackGroups`, `trajectory.open`, `trajectory.registerTrigger`, e assim por diante) e `<TrajectoryModal item={trajectory.selectedItem} onClose={trajectory.close} />`; as partes e seus testes ficam intactos.

### Projetos

| Hook novo                                     | Responsabilidade                                                                                                                                                                          | Entrada                                                                                                               | Saída                                                                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/hooks/useProjectsSeo.ts`           | JSON-LD de lista e de breadcrumb (usa `useLanguage`, `useTranslation(["projects","common"])`)                                                                                             | `firstPageItems: ProjectSummary[] \| undefined`                                                                       | `{ jsonLd, breadcrumbJsonLd }` (cada um `undefined` sem itens)                                                           |
| `src/pages/hooks/useProjectsFilterOptions.ts` | Opções de tipo (só as disponíveis, ordem do enum), categoria, ordenação, tecnologia e ano (consulta `getProjectFilterOptions` por idioma), `typeValue`, `appliedFilters` e `filtersCount` | `filters: ProjectsFilters`, `availableTypes: ProjectType[]`                                                           | `{ typeValue, typeOptions, categoryOptions, sortOptions, technologyOptions, yearOptions, appliedFilters, filtersCount }` |
| `src/pages/hooks/useProjectsResults.ts`       | Texto de resultados com `useDeferredValue`, `isEmptyContent`, `isNoResults`, `canClearFilters`, divisão em principais e experimentos e `retry` com foco no título                         | `pages` (retorno de `useProjectsPages`, tipo por `ReturnType<typeof useProjectsPages>` local) e `hasFilters: boolean` | `{ text, isEmptyContent, isNoResults, canClearFilters, mainItems, experimentItems, retry }`                              |

Estado do modal (`isFiltersOpen`, `openFilters`, `closeFilters`) é de 3 linhas e fica no compositor. Tipos novos: nenhum exportado (as entradas e saídas são inferidas e os tipos auxiliares ficam locais); se o executor precisar compartilhar um tipo entre arquivos, ele nasce em `src/types/project/<Nome>.types.ts` com `export default`. Tipos existentes reutilizados: `ProjectsFilters`, `ProjectsAppliedFilters`, `ProjectSummary`.

**Formato final do retorno de `useProjects`:**

```ts
{
    t, shareImage, ids: projectsElementIds, seo: { jsonLd, breadcrumbJsonLd }, filters,
    search: { draft, setDraft, clearSearch },
    filterBar: { ref, dragProps, typeValue, typeOptions, categoryOptions, setType, setCategory },
    modal: { isOpen, open, close, filtersCount, applied, technologyOptions, yearOptions, sortOptions, applyModalFilters },
    results: { text, hasFilters, canClearFilters, isEmptyContent, isNoResults, clearFilters },
    list: { isLoading, isError, retry, mainItems, experimentItems, skeletonCount, gridRef },
    more: { hasMore, isFetchingMore, loadMoreError, loadMore, retryLoadMore }
}
```

`filters` fica no topo porque a página lê `filters.q` (texto de "sem resultado") e `filters.category`. Campos hoje expostos e sem leitor fora do `Probe` de teste (`items`, `shown`, `total`, `hasData`, `availableTypes`, `firstPageItems`) **saem**; o `Probe` os reconstrói. Segue sem `setSort` nem `setTechAndYear`.

## Critérios de aceite

- [ ] **VAL-165-01** O HTML pré-renderizado das seis URLs (about e projects em `pt-BR`, `en`, `es`) é idêntico ao da `staging`. Prova: hashes da T0 e da T11.
- [ ] **VAL-165-02** `About.page.test.tsx` e `Projects.page.test.tsx` passam **sem nenhuma edição** (`git diff origin/staging -- src/pages/test` vazio).
- [ ] **VAL-165-03** `src/components/test/About*.test.tsx` e `AsyncSection.test.tsx` passam sem edição, e `AboutProfileState`/`AboutTimelineState` não mudam (`git diff origin/staging -- src/types/about src/components` vazio).
- [ ] **VAL-165-04** `useAbout.test.tsx` e `useProjects.test.tsx` passam com as mesmas asserções de comportamento; o diff dessas duas suítes contém só acessores do novo retorno e o `Probe`/`renderUseAbout`.
- [ ] **VAL-165-05** Testes novos dos hooks `useAboutRetryFocus` (`src/pages/hooks/test/useAboutRetryFocus.test.tsx`): foco no título com sucesso, no alerta com nova falha, não refoca depois de tratado, não foca com a fonte em `isFetching`, não foca enquanto o elemento não existe e foca quando ele aparecer, retry de cada fonte chama só o `refetch` dela.
- [ ] **VAL-165-06** Testes de `useTrajectorySelection` (`.../useTrajectorySelection.test.tsx`): `open` define o item, `close` o limpa, foco volta ao gatilho registrado mesmo com o foco no `body`, mudar o `pathname` fecha sem alterar o histórico, `registerTrigger` remove o gatilho ao desmontar, `registerTrigger(id)` mantém a mesma identidade entre renderizações.
- [ ] **VAL-165-07** Testes de `useProjectsSeo`, `useProjectsFilterOptions` e `useProjectsResults` (um arquivo em `src/pages/hooks/test/` cada): `useProjectsSeo` (sem itens e com itens nos três idiomas, breadcrumb Início > Projetos); `useProjectsFilterOptions` (só tipos disponíveis na ordem do enum com "Todos" primeiro, categorias do enum, `filtersCount` só tecnologia e ano, `appliedFilters` com `sort`, opções vazias enquanto carrega); `useProjectsResults` (texto vazio no erro e sem dados, "carregando", contagem `none` e `count`, `isEmptyContent` x `isNoResults`, `canClearFilters` nas quatro condições, `retry` foca o título antes do `refetch`, `useDeferredValue` com valor inicial vazio sem dados).
- [ ] **VAL-165-08** `Projects.page.tsx` desestrutura no máximo 12 nomes de `useProjects()` e `About.page.tsx` no máximo 13 de `useAbout()`; `useProjects.ts` e `useAbout.ts` ficam abaixo de 100 linhas; nenhum arquivo novo passa de 100 linhas.
- [ ] **VAL-165-09** Nenhum `useMemo`, `useCallback` ou `React.memo` novo no diff (`git diff origin/staging | grep '^+.*use\(Memo\|Callback\)'` só acusa os movidos de `useAbout`/`registerTrigger`); sem comentários no código; um símbolo exportado por arquivo, `export default`; `any` e cast ausentes.
- [ ] **VAL-165-10** `npm run typecheck`, `npm run lint`, `npm run build && npm run test:cov -- --maxWorkers=2` e os E2E de `about`, `projects`, `projects-filters`, `no-javascript`, `accessibility` e `keyboard` passam sem edição de E2E.
- [ ] **VAL-165-11** `docs/screens/about.md` (seção Implementação, parágrafo de `useAbout`) e `docs/screens/projects.md` (Implementação de `useProjects`) descrevem as fatias; `docs/architecture/code-structure.md` ou `frontend.md` só se citarem o formato antigo (checar com `grep -rn "useProjects\|useAbout" docs/`).

## Estratégia de validação

- **Automatizada:** gate leve por tarefa (`npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 <arquivos>`); suíte completa só na última tarefa. Antes de rodar Vitest/build/Playwright, conferir `uptime` (load acima de 14: esperar).
- **Manual (qa):** `npm run dev -- --port <porta> --strictPort`, abrir `/pt-BR/about` e `/pt-BR/projects` em claro e escuro: forçar falha do dado e usar "Tentar novamente" (foco no título/alerta), abrir e fechar item da trajetória por teclado (foco volta ao item), buscar, filtrar, ordenar pelo modal, "Carregar mais", "Limpar filtros". Comparar com a `staging`.
- **Rollback:** `git revert` do PR; nenhum dado nem contrato muda.

## Riscos

- **Regra dos hooks do React:** `useDeferredValue` e o efeito de foco precisam continuar incondicionais dentro dos hooks novos (mitigação: VAL-165-07).
- **Identidade de funções:** `registerTrigger` precisa manter a identidade estável (`useCallback` com `[]`) para não remontar refs; `retryProfile`/`retryTimeline` podem ser funções novas a cada render como hoje (mitigação: VAL-165-06).
- **Ordem de efeitos:** extrair o efeito de foco do retry para outro hook muda a ordem de declaração dos efeitos dentro de `useAbout`; como cada efeito toca estado independente, não deve mudar, mas o teste 186/209 e o E2E `about.spec.ts` 641-700 são a prova (mitigação: manter a ordem original de chamada).
- **Hidratação:** mover `useDeferredValue` de lugar não pode mudar o primeiro render (VAL-165-01).
- **Colisão de arquivos com outras issues:** `About.page.tsx`, `Projects.page.tsx` e os dois hooks são tocados por outras frentes; rebasear em `origin/staging` antes de cada tarefa.
- **Churn de testes:** o `Probe` de 954 linhas muda de acessor; mitigar fazendo a mudança de formato numa só tarefa por tela (T5 e T9), sem tocar em asserção.

## Questões em aberto

- **Q1 — Formato do retorno: subobjetos (proposta) ou manter plano e só extrair hooks?** Recomendação: subobjetos, como pede a issue ("página passando subobjetos às seções"); o custo é só trocar acessores nos dois arquivos de teste de hook.
- **Q2 — Extrair o JSX de Projetos em componentes (`ProjectsControls`, `ProjectsResults`...)?** A issue fala em "passando subobjetos às seções"; em Informações as seções já existem (#164), em Projetos não. Recomendação: **não** nesta issue (refatoração só de hooks, sem tocar em marcação nem criar componentes com testes e docs); abrir issue própria se o PO quiser.
- **Q3 — Cobrir os hooks novos com testes diretos (VAL-165-05 a 07) ou só com a suíte existente?** Recomendação: diretos, porque cada hook novo ganha entrada estreita testável sem store (retry com fontes simuladas) e é mais barato de manter; a suíte existente fica como integração.
- **Q4 — `aboutElementIds` em `src/utils/`** (espelha `projectsElementIds`) em vez de constante dentro do hook. Recomendação: util, pois `useAbout` o devolve em `ids` e o hook de retry o lê.
- **Q5 — Comparar o HTML pré-renderizado por hash (T0 e T11)** exige dois `npm run build`. Recomendação: sim, é a única prova direta do item 1 de "O que NÃO pode mudar"; os dois builds rodam um por vez, com `uptime` conferido.
- **Q6 — Changeset:** refatoração sem mudança observável pede `npm run changeset -- --empty`. Confirmar com o PO se prefere `patch`.

## Notas / decisões

- Convenções aplicadas: hook de página em `src/pages/hooks/`, `export default` único por arquivo, tipos exportados em `src/types/<dominio>/`, sem comentários, sem memoização sem medição, teste em `test/` ao lado, `describe`/`it` em português.
- Dependência nova: nenhuma.
- Decisões do `docs/design/decisions.md` mantidas: D65 (`ItemList` do primeiro lote), D69 (experimentos por `splitExperiments`), D37 (HTML sem JavaScript de Informações).
- Alternativa descartada: um `useAboutSources` que devolvesse `AboutProfileState` pronto. Cria dependência circular com o hook de retry (o retry precisa das flags e o estado precisa do retry); compor em `useAbout` é mais simples.
