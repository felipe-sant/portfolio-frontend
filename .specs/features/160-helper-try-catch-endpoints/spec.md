# Spec: Helper do try/catch dos endpoints de conteúdo

> **Tipo:** `feature` (refactor, sem mudança de comportamento) <br />
> **Status:** `implementada` <br />
> **Issue:** `#160` <br />
> **Criado em:** `12-11-2026`

Sem tela: a mudança é interna a `src/store/api/` e `src/utils/`, então o `qa` não se aplica (só testes de unidade; os E2E existentes
seguem como regressão).

## Problema

Os `queryFn` dos endpoints de conteúdo repetem o mesmo bloco, `try { ...; return { data } } catch (error) { return {
error: toQueryError(error) } }`: 6 vezes em `src/store/api/projects.api.ts`, 1 em `profile.api.ts`, 2 em
`timeline.api.ts` e 1 em `contact.api.ts` (mutation), 10 ao todo. A repetição esconde o corpo útil de cada endpoint e
cada endpoint novo (e a troca por `query` na #43) copia o bloco de novo.

## Objetivo

Um helper com `export default` que recebe a função assíncrona do corpo do endpoint, devolve `{ data }` quando ela
resolve e `{ error: toQueryError(error) }` quando ela lança, e é usado pelos 10 `queryFn`, sem alterar o formato de erro
do contrato nem o resultado de nenhum endpoint.

## Fora de escopo

- Mudar `toQueryError`, `ContentException` ou o formato de erro (`ContentError`).
- Mudar a validação dos argumentos, a camada `src/services/content/` ou os hooks/páginas que consomem os endpoints.
- A troca de `queryFn` por `query` (#43) e a validação com Zod (#162, PR #260).

## Dependência e conflitos (PR #260, issue #162)

- O PR #260 está aberto. `gh pr view 260 --json files` confirma que ele **não altera** `src/store/api/*.api.ts`, mas
  altera `src/store/api/test/{profile,projects,timeline}.api.test.tsx`, `src/services/content/{readJson,loadProfile,
loadProjectRecords,loadTimelineRecords}.ts` e `docs/architecture/{frontend,api-contract,code-structure,data-model}.md`.
- Conflito potencial: os testes de `src/store/api/test/` (se esta tarefa os tocar) e os três docs de arquitetura
  (parágrafo dos endpoints em `frontend.md`). Mexe também no tratamento de erro a montante, o que pode mudar o que
  `toQueryError` recebe nos testes.
- Regra: **a implementação só começa com o #260 mergeado** e a branch rebaseada em `origin/staging`. A primeira tarefa
  confere isso; enquanto estiver aberto, nada em `src/` é editado.

## Critérios de aceite

- [ ] Existe `src/utils/runQueryFn.ts`, com um único `export default`, genérico no tipo do resultado, sem `any` nem
      cast (testes: T1).
- [ ] QUANDO a função resolve ENTÃO o helper devolve `{ data: <resultado> }`, inclusive `undefined` (mutation de contato)
      (testes: T1).
- [ ] QUANDO a função lança `ContentException` ENTÃO devolve `{ error }` com o `contentError` original, e QUANDO lança
      outro `Error` ou valor ENTÃO `{ error: { status: "FETCH_ERROR", error: <mensagem> } }`, igual a `toQueryError`
      (testes: T1).
- [ ] Os 10 `queryFn` (projects 6, profile 1, timeline 2, contact 1) usam o helper e `projects.api.ts`, `profile.api.ts`,
      `timeline.api.ts` e `contact.api.ts` não têm mais `try`/`catch` nem importam `toQueryError` (testes: T2, T3, grep
      em T3).
- [ ] `getProjectsPages` (infiniteQuery, `{ queryArg, pageParam }`) usa o helper e continua paginando (testes: T2,
      `projects.api.test.tsx` existente).
- [ ] Os testes existentes de `src/store/api/test/` passam sem edição de asserção (testes: T2, T3).
- [ ] Docs que descrevem o padrão (`docs/architecture/frontend.md`, ver "Notas") e o `.claude/CLAUDE.md` estão coerentes
      com o helper (verificação: T4).

## Notas / decisões

- **Onde mora:** `src/utils/runQueryFn.ts`, com teste em `src/utils/test/runQueryFn.test.ts`. Decidido pelo PO: o
  `CLAUDE.md` reserva `src/store/api/<dominio>.api.ts` aos endpoints injetados e define `src/utils/` para funções
  reutilizáveis sem React. O helper importa só tipos do RTK Query e `toQueryError`, sem tocar no `api`. Alternativas
  descartadas: `src/store/api/` (não é endpoint) e `src/services/content/` (acoplaria a camada local ao RTK Query).
  Na #43 o `queryFn` vira `query`; se o helper deixar de ter uso, sai junto com seu teste (registrar em `frontend.md`).
- **Nome:** `runQueryFn` (executa o corpo de um `queryFn` e normaliza o retorno).
- **Assinatura:**
  `function runQueryFn<Result>(run: () => Promise<Result>): Promise<QueryReturnValue<Result, FetchBaseQueryError, FetchBaseQueryMeta | undefined>>`,
  com `QueryReturnValue` e `FetchBaseQueryError` importados de `@reduxjs/toolkit/query`. Uso:
  `queryFn: ({ lang }) => runQueryFn(async () => { validateLang(lang); return await loadProfile(lang) })`.
  O helper não conhece o argumento: o endpoint o desestrutura e o fecha na função, então o mesmo helper serve ao
  `queryFn` de query, de mutation e de infiniteQuery (`({ queryArg, pageParam }) => runQueryFn(...)`) sem genérico extra.
  Se o inferidor do RTK Query não aceitar o retorno sem anotação, o executor ajusta o genérico, nunca com cast.
- **Contact:** a mutation devolvia `{ data: undefined }`; com `Result = void` o helper devolve o mesmo.
- Refactor puro: sem texto de UI (R2 não se aplica), sem dado novo (R1 mantido), sem dependência nova, sem Dnn/PIn
  aplicável.

## Questões em aberto

- Nenhuma. O local do helper (`src/utils/`) foi decidido pelo PO.
