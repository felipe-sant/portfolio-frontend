# Tasks: 162-valida-contrato-dos-json-com-zod

> Spec: `./spec.md`

## Plano de execução

Sequencial: os schemas (T2) precisam do pacote (T1), o `readJson` (T3) precisa dos schemas, e as fixtures (T4) só aparecem quando a validação liga. Cada tarefa vira um commit (`Feat :sparkles: [#162] ...`, `Test :test_tube: [#162] ...`, `Docs :bulb: [#162] ...`).

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

Regras para o `executor`: nenhum comentário em código (nem `//`, `/* */`, JSDoc ou `{/* */}`); identificadores em inglês; nenhum texto de UI novo; `import` nomeado do pacote, nunca `import * as`; nenhum `any` nem cast para calar erro de tipo; nenhum estado vermelho commitado; `src/store/api/` não muda; Vitest sempre com `--maxWorkers=2` e só depois de conferir `uptime` (load acima de 14: esperar ou avisar).

## Tarefas

- [ ] T1 — Adicionar `zod` e conferir peso e compatibilidade
    - **Arquivo(s):** `package.json`, `package-lock.json`
    - **Depende de:** aprovação da spec e resposta à pergunta 1 e 6 da spec
    - **Testes (escritos antes, RED):** não se aplica (dependência)
    - **Gate:** `npm ci && npm run typecheck && npm run lint`
    - **Feito quando:** `zod` está em `dependencies` com a versão decidida; `package-lock.json` tem uma versão só de `zod` (`npm ls zod`); o tempo de `npm run typecheck` antes e depois fica anotado na evidência; o checklist da spec foi reconferido com `npm view` e `npm audit` (se algo mudou desde 11/11/2026, voltar ao `sdd`).
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T2 — Schemas em `src/services/content/schemas/` e tipo `ContentSchema`
    - **Arquivo(s):** `src/types/content/ContentSchema.types.ts`, `src/services/content/schemas/{imageAsset,responsiveImage,stackGroup,profile,projectRecord,timelineItemRecord,listResponse}.schema.ts`, testes em `src/services/content/schemas/test/<nome>.schema.test.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED, borda primeiro):**
        - VAL-162-05 (borda): `profile` rejeita `countryCode` fora de `^[A-Z]{2}$`, e-mail inválido, `availability.isAvailable` string, `stack[].category` fora de `STACK_CATEGORIES`. `src/services/content/schemas/test/profile.schema.test.ts`
        - VAL-162-05 (borda): `projectRecord` rejeita `types` vazio, `types` fora de `PROJECT_TYPES`, `category` e `status` fora do enum, `documents[].format` fora de `DOCUMENT_FORMATS`, `featured` não booleano, campo obrigatório ausente. `projectRecord.schema.test.ts`
        - VAL-162-05 (borda): `timelineItemRecord` rejeita `kind` fora de `TIMELINE_KINDS`, `start` fora de `AAAA-MM`, `projectIds` não lista. `timelineItemRecord.schema.test.ts`
        - VAL-162-05: `listResponse(projectRecord)` rejeita `items` ausente e aceita `items: []`. `listResponse.schema.test.ts`
        - VAL-162-05: cada schema aceita a fixture válida (`buildProfile`, `buildProjectRecord`, `buildTimelineItemRecord`) e devolve dado igual a ela. Nos três arquivos acima
        - VAL-162-05: chave desconhecida é aceita e removida do resultado (`profile` e `projectRecord`)
        - Compilação (guarda de tipo): cada schema anotado contra o tipo de `src/types/` (`Profile`, `ProjectRecord`, `TimelineItemRecord`, `StackGroup`, `ResponsiveImage`); `npm run typecheck` prova
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/services/content/schemas`
    - **Feito quando:** o gate passa; um schema por arquivo com `export default`; os valores de enum vêm de `src/enum/*.enum.ts`; o tipo `ContentSchema<T>` aceita a atribuição de cada schema sem cast (se o `tsc` rejeitar, ajustar o tipo estrutural e registrar).
    - **Evidência:** (tabela de adequação com `arquivo:linha` e veredito)

- [ ] T3 — `readJson` valida com carregamento dinâmico e paralelo; carregadores passam o schema
    - **Arquivo(s):** `src/services/content/readJson.ts`, `loadProfile.ts`, `loadProjectRecords.ts`, `loadTimelineRecords.ts`, testes em `src/services/content/test/{readJson,loadProfile,loadProjectRecords,loadTimelineRecords}.test.ts`
    - **Depende de:** T2
    - **Testes (escritos antes, RED, borda primeiro):**
        - VAL-162-03 (borda): JSON ilegível lança `ContentException` com `code` `INVALID_CONTENT` e "não é um JSON válido". `readJson.test.ts`
        - VAL-162-03 (borda): resposta 404 continua `Error` comum com "status 404" (não `ContentException`). `readJson.test.ts`
        - VAL-162-02: conteúdo fora do contrato lança `ContentException` de `status 500`, `code` `INVALID_CONTENT`, mensagem em português com o arquivo e o primeiro campo, `fields` com o caminho; um teste por carregador. Arquivos dos três carregadores
        - VAL-162-01: conteúdo válido devolve o dado sem mudança. `readJson.test.ts` e os três carregadores
        - Casos de borda: o `import()` do schema começa antes de o `fetch` terminar (`loadSchema` chamado com `fetch` pendente); falha na validação não apaga o texto do `contentCache`; chave extra é descartada. `readJson.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/services/content/test`
    - **Feito quando:** o gate passa; `readJson.ts` não importa `zod`; nenhum `as T` sobra em `readJson`; só os módulos de `schemas/` importam `zod`.
    - **Evidência:** (tabela de adequação)

- [ ] T4 — Fixtures e testes que alimentam o conteúdo pelos carregadores
    - **Arquivo(s):** `src/testUtils/build*.ts` e os testes que a suíte apontar (candidatos: os que usam `stubContentFetch` ou `parseUntyped`, ex.: `src/store/api/test/*.api.test.tsx`, `src/pages/test/*.page.test.tsx`, `src/pages/hooks/test/*.test.tsx`, `src/components/test/Footer.test.tsx`, `src/layouts/test/Main.layout.test.tsx`, `src/test/entry-server*.test.tsx`, `src/routers/test/*.test.ts*`, `src/prerender/test/prerenderRoutes.test.ts`)
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** a própria suíte vermelha por fixture parcial é o RED; para cada teste corrigido, trocar o dado parcial pelo `build*` completo. Proibido afrouxar o schema ou usar cast.
        - VAL-162-04: `profile.api.test.tsx`, `projects.api.test.tsx` e `timeline.api.test.tsx` ganham um caso de conteúdo inválido que devolve `error.status` 500 e `error.data.error.code` `INVALID_CONTENT`, sem mudar `src/store/api/`
        - VAL-162-07: `loadPrerenderData.test.ts` ganha caso de conteúdo inválido que lança com o nome do arquivo e o campo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2` (suíte inteira uma vez, nesta tarefa, para achar as fixtures; depois só os arquivos alterados)
    - **Feito quando:** a suíte inteira passa; nenhum schema foi afrouxado; `git diff --stat -- src/store/api` mostra só arquivos de `test/`.
    - **Evidência:** (lista das fixtures trocadas e tabela de adequação dos casos novos)

- [ ] T5 — `content:check` prova os schemas sobre os arquivos publicados
    - **Arquivo(s):** `src/services/content/test/content.test.ts`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):**
        - VAL-162-06: `it.each(SUPPORTED_LANGUAGES)` que roda `profile`, `projectRecord` (via `listResponse`) e `timelineItemRecord` sobre os dados lidos por `readContentSnapshot` e espera zero erros (descrever os erros por `path: message`, como `describeIssues`). Para ver o vermelho, quebrar à mão um campo num JSON copiado em `mkdtemp` (padrão que o arquivo já usa) e conferir que o `it` reprova, sem tocar `public/`
    - **Gate:** `npm run typecheck && npm run lint && npm run content:check`
    - **Feito quando:** o gate passa e `public/content/` não foi alterado.
    - **Evidência:** (asserção `arquivo:linha` e o RED visto)

- [ ] T6 — Documentação e medição de pacote
    - **Arquivo(s):** `docs/architecture/data-model.md` (seção "Validação do conteúdo"), `docs/architecture/code-structure.md` ou `docs/architecture/frontend.md` (pasta `schemas/` e carregamento dinâmico), `docs/architecture/api-contract.md` (reaproveitamento na v2), `docs/setup/entry-bundle-performance.md` (peso do Zod, método e marcador), `docs/setup/development.md` (se `content:check` passar a citar schemas)
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica (documentação); os critérios PERF-162-01 e PERF-162-02 são verificados na T7
    - **Gate:** `npm run lint` e leitura dos links relativos das páginas editadas
    - **Feito quando:** DOC-162-01 atendido: o mapa do que `content:check` garante (da spec), "roda no teste e no CI, não no navegador", a validação de borda, a regra de chave desconhecida, a duplicação aceita e a pergunta para v2 estão em `data-model.md`; a medição de pacote entra em `entry-bundle-performance.md` com o método da spec.
    - **Evidência:** (links dos trechos)

- [ ] T7 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1 a T6
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada da feature; conferir `uptime` antes), mais `npm run check:chunk`, mais o grep do marcador do Zod nos `.js` que `dist/index.html` referencia (PERF-162-01: zero ocorrências; chunk separado presente)
    - **Feito quando:** o gate passa; os números do chunk dos schemas e da entrada estão em `entry-bundle-performance.md`; VAL-162-08 (tempos de `typecheck`, versão única do `zod`) conferido; verificação manual da spec (Network e quebra à mão de um campo com `npm run build` falhando, depois desfeita) feita ou deixada ao PO.
    - **Evidência:** (saída resumida dos comandos e dos números)
