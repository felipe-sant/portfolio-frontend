# Spec: 162-valida-contrato-dos-json-com-zod

> **Tipo:** `feature` (Feat na branch e no commit) <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#162` <br />
> **Criado em:** `11-11-2026`

Sem tela nova e sem texto de UI novo (a mensagem de erro é de diagnóstico, em português literal, como manda o `CLAUDE.md` para `Error` lançado no cliente; R2 não se aplica). Mexe na camada de dados de todas as telas, então o `qa` se aplica só como regressão: as cinco telas continuam carregando conteúdo nos três idiomas. R1 vale: tudo continua frontend-only com os JSONs de `public/content/`. Base: `origin/staging` em `0a39d2a` (com a divisão de pacotes da #140 já mergeada). Decisão de origem: **D-03** (`decisoes.md`, Felipe, 11/11/2026): adicionar Zod para validar o contrato dos JSONs na borda e reaproveitar na troca para o backend (v2), mantendo o teste `content:check`. A issue foi aberta (achado C-06 da revisão de 08/11/2026) como "documenta ou reforça"; a D-03 a transformou em código com dependência nova.

## Problema

`readJson` (`src/services/content/readJson.ts`) faz `JSON.parse(text) as T`: o tipo dos arquivos de `public/content/` é prometido e não verificado em tempo de execução. Hoje a única garantia do contrato é o teste `content:check` (`src/services/content/validation/`), que roda no Vitest e no CI sobre os arquivos publicados, nunca no navegador nem no `npm run build`. Consequências:

- um JSON malformado que escape do teste (ou, na v2, uma resposta da API fora do contrato) entra na store como se fosse válido e quebra longe da causa, por exemplo `undefined.map` num componente;
- a troca do mock pela API (#43, v2) perde a única verificação que existe, porque `content:check` valida arquivos em disco, não respostas HTTP.

### O que `content:check` já garante (critério 1 da issue)

`validateContent` (`validation/validateContent.ts`) junta 13 grupos de regra sobre um `ContentSnapshot` lido de `public/` (`readContentSnapshot`), nos três idiomas:

| Grupo (arquivo `validation/`)                                              | O que garante                                                                                                                                                                                                                                                                | Natureza             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `snapshot.issues` (leitura)                                                | arquivo ausente ou JSON ilegível                                                                                                                                                                                                                                             | estrutural           |
| `validateProfile`, `validateProjects`, `validateTimeline`, `validateStack` | chaves obrigatórias e opcionais (`checkObjectKeys` também **rejeita chave desconhecida**), tipo de cada campo, e-mail, `countryCode` ISO, URLs `https`, listas de texto, limites (`homeIntro` ≤ 300, `summary` ≤ 160, `featured` ≤ 4, `related` ≤ 3, `cardTechnologies` ≤ 3) | estrutural + domínio |
| `validateEnums`                                                            | `types`, `category`, `status`, `format` de documento, `category` de stack e `kind` da trajetória dentro de `src/enum/*.enum.ts`; sem tipo repetido                                                                                                                           | estrutural           |
| `validateEmptyValues`                                                      | nenhum texto vazio                                                                                                                                                                                                                                                           | estrutural           |
| `validateIds`, `validateReferences`                                        | UUID v7, unicidade, `related` e `projectIds` apontando para registros existentes                                                                                                                                                                                             | domínio              |
| `validateDates`                                                            | datas e meses válidos, ordem                                                                                                                                                                                                                                                 | domínio              |
| `validateImages`                                                           | arquivo existe, tamanho, formato, largura e altura declaradas conferem com o arquivo, sem EXIF                                                                                                                                                                               | domínio (disco)      |
| `validateDocuments` e validadores de Markdown                              | documento existe, nome, formato, seções do README, versões do changelog                                                                                                                                                                                                      | domínio (disco)      |
| `validateLanguageParity`, `validateTranslation`                            | mesma estrutura e mesmos ids nos três idiomas; texto que não pode ficar igual ao `pt-BR` (com `translationExceptions`)                                                                                                                                                       | domínio (tradução)   |

(Leitura por nome e pelas constantes dos arquivos; o `executor` confirma o grupo exato ao ler cada um, sem mudar nenhum.) Duas conclusões para a decisão:

1. **A validação roda só no teste e no CI.** Nada disso existe no navegador, no `npm run build` ou na pré-renderização: `loadPrerenderData` só falha quando a `queryFn` falha, e a `queryFn` não valida nada.
2. **Parte do contrato é estrutural (forma, tipo, enum) e parte é de domínio** (parity, referências, arquivos em disco, EXIF). Só a parte estrutural cabe num schema de borda; a de domínio exige os três idiomas ou o disco e fica no `content:check`.

## Objetivo

1. Documentar o mapa acima em `docs/architecture/data-model.md` (seção "Validação do conteúdo"), dizendo onde cada garantia roda.
2. Adicionar `zod` e validar na borda, em tempo de execução, os três tipos de arquivo que `readJson` lê (`profile.json`, `projects.json`, `timeline.json`), com a forma de `Profile`, `ListResponse<ProjectRecord>` e `ListResponse<TimelineItemRecord>`.
3. Falha de validação vira erro de diagnóstico que nomeia o arquivo e o campo, nos mesmos canais de erro que já existem (`ContentException` e `toQueryError`), sem mudar `src/store/api/` (a #160 vem depois e só reorganiza o `try/catch`).
4. **Custo de pacote fora da entrada:** o Zod é carregado por `import()` dinâmico e não entra em nenhum chunk de entrada (NF-DE-07).
5. `content:check` passa a provar também que os nove arquivos publicados (3 arquivos × 3 idiomas) atendem aos schemas, então schema e conteúdo não divergem.

## Fora de escopo

- **A #160** (helper do `try/catch` em `src/store/api/`): fica como está; esta spec só garante que a mensagem nova chega pelo mesmo caminho.
- Remover regras duplicadas de `validation/` (ver "Duplicação aceita"): fica para depois do corte e para a #43.
- Validar `readText` de Markdown, WebP, PDF e `prerender-data` (não são JSON de contrato).
- Validar `import.meta.env`, parâmetros de rota ou formulário com Zod.
- `valibot` (ver "Dependência nova"): só entra se o Felipe reabrir a D-03.
- Mensagem de erro visível ao usuário (nenhuma tela renderiza `data.error.message` hoje, conferido por busca em `src/`), chave de tradução e `locale` do Zod.
- Orçamento novo em `npm run check:chunk` (ver CA-PERF-162-01).

## Dependência nova: checklist do `CLAUDE.md`

Dados de 11/11/2026 (`npm view`, `gh api`). Projeto: React `^19.3.1`, TypeScript `^7.0.2`, Vite `^8.3.5`, `"type": "module"`.

| Item                          | `zod` (4.6.7) e `zod/mini` (decisão: pin exato em 4.6.5)                                                                                                                                                                                                                                                                                  | `valibot` (1.5.0)                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Última versão                 | 4.6.7, publicada em 12/10/2026                                                                                                                                                                                                                                                                                                            | 1.5.0, publicada em 09/09/2026                                                                                                              |
| Repositório                   | `colinhacks/zod`, não arquivado, último push em 06/11/2026, ~44 mil estrelas, 122 issues abertas                                                                                                                                                                                                                                          | `open-circle/valibot`, não arquivado, último push em 07/11/2026, ~9 mil estrelas, 241 issues abertas                                        |
| `deprecated` no npm           | campo vazio (não depreciado)                                                                                                                                                                                                                                                                                                              | campo vazio (não depreciado)                                                                                                                |
| Licença                       | MIT                                                                                                                                                                                                                                                                                                                                       | MIT                                                                                                                                         |
| Avisos de segurança           | `security-advisories` do repositório: 0                                                                                                                                                                                                                                                                                                   | 2 publicados no repositório; o `executor` roda `npm audit` e lê os dois antes de qualquer escolha dele (só vale se o Felipe reabrir a D-03) |
| Dependências                  | nenhuma (`dependencies` vazio)                                                                                                                                                                                                                                                                                                            | nenhuma                                                                                                                                     |
| `peerDependencies`            | nenhuma                                                                                                                                                                                                                                                                                                                                   | `typescript >=5` (satisfeita)                                                                                                               |
| Tipos embutidos e ESM         | sim; `zod/mini` é um subpath exportado; só `compile.js` tem efeito colateral (`sideEffects`), fora do uso previsto; `import { z } from "zod/mini"` por import nomeado, o que o lint aceita                                                                                                                                                | sim (`index.d.mts`), ESM com tree-shaking, import nomeado                                                                                   |
| Issue aberta que atinja o uso | **#6732 (tsc estoura memória em 4.6.6 e 4.6.7, aberta):** o autor depois atribuiu o caso a duas versões do Zod no mesmo projeto, e o mantenedor não reproduziu. Mitigação em T1: uma versão só no `package-lock.json` e `npm run typecheck` medido antes e depois. Não há outra issue aberta que atinja objeto/array/enum/string/opcional | nenhuma identificada                                                                                                                        |
| Compatibilidade com TS 7      | **Conferida:** num experimento descartável, schemas anotados com `ZodType`, `ZodMiniType` e `GenericSchema` passaram em `npm run typecheck` (TS 7.0.2) e o erro que apareceu foi um enum de teste divergente do tipo real, ou seja, a anotação pega desvio                                                                                | idem (passou)                                                                                                                               |

### Peso medido, nesta base

Método: `npm ci`, depois `npm i --no-save zod@4.6.7 valibot@1.5.0` (sem tocar `package.json`), `vite build` simples com `VITE_SITE_URL` (não `build:fatec`) sobre `origin/staging` `0a39d2a`, saída em `/tmp`, nada commitado. Schemas reais de `Profile`, `ListResponse<ProjectRecord>` e `ListResponse<TimelineItemRecord>` (objeto, array, enum, opcional, `url`, `email`, `regex`, `length`), com literais de enum no lugar dos de `src/enum/` (efeito desprezível). Cada schema foi ligado a `loadProfile`, `loadProjectRecords` e `loadTimelineRecords`. gzip do `zlib` do Node (nível padrão), brotli qualidade 11, KB = 1.000 bytes, mesma medida de `entry-bundle-performance.md`. Sem `Zod` a entrada (`index`) tem 66,7 KB brotli (77,2 KB gzip) e o total dos chunks de entrada 137,0 KB brotli.

| Opção          | Import estático: cai no `index` (entrada) | Import dinâmico: chunk próprio, entrada fica igual | Chunk bruto |
| -------------- | ----------------------------------------- | -------------------------------------------------- | ----------: |
| `zod` completo | +24,5 KB gzip / +21,1 KB brotli           | 24,4 KB gzip / 21,7 KB brotli                      |     85,7 KB |
| `zod/mini`     | +7,6 KB gzip / +6,5 KB brotli             | 7,7 KB gzip / 7,0 KB brotli                        |     23,3 KB |
| `valibot`      | +2,3 KB gzip / +2,0 KB brotli             | 2,5 KB gzip / 2,2 KB brotli                        |      7,0 KB |

- **Por que dinâmico:** `profile.json` é lido pelo rodapé (`Footer` usa `profile.api`), então o código que lê conteúdo mora no `index`; com import estático o Zod entra na entrada de toda página. Com `import()` dinâmico, o `index` cresce ~0,06 KB (a chamada) e o Zod vai para um chunk próprio.
- **Caminho crítico:** na primeira carga o perfil vem do bloco `prerender-data` (`readPrerenderData` em `mountClient`), sem `fetch`, então o chunk do schema nem é baixado ali; ele é baixado na primeira leitura de JSON (troca de idioma, navegação para Projetos ou Informações). O `import()` do schema começa **em paralelo** com `readText` (`Promise.all`), não depois do `fetch`.
- **Orçamentos:** `npm run check:chunk` só tem teto para o markdown (100 KB gzip) e o `pdfjs` (170 KB módulo, 420 KB worker); o Zod não toca nenhum dos dois, então não há como ele estourar esses tetos, e não existe teto de entrada no script. Os requisitos que se aplicam são NF-DE-07 (JS da primeira carga ≤ 180 KB gzip: não muda, o Zod fica fora dela) e NF-DE-08 (JS adicional de cada outra rota ≤ 40 KB gzip: `zod/mini` soma 7,7 KB, `zod` completo 24,4 KB, ambos cabem, mas o completo consome 60% da folga da rota que o carregar).
- **Recomendação:** **`zod/mini`, por `import()` dinâmico.** Atende a D-03 (é o Zod, mesmos schemas e mesma API de `parse` e `safeParse`, reaproveitáveis no backend de v2) a 7,7 KB gzip fora da entrada. O `zod` completo (24,4 KB gzip) só se justifica se a ergonomia do encadeamento valer o peso; as duas opções cabem nos orçamentos. `valibot` é ~5 KB gzip mais leve, mas trocar de biblioteca reabre a D-03: fica como pergunta ao Felipe, não como recomendação.

## Decisão de desenho

### Onde ficam os schemas

`src/services/content/schemas/<nome>.schema.ts`, **um schema por arquivo, `export default`** (regra do `CLAUDE.md`): `imageAsset`, `responsiveImage`, `stackGroup`, `profile`, `projectRecord`, `timelineItemRecord`, e `listResponse` (função que recebe o schema do item e devolve o do envelope `{ items }`). Os valores de enum vêm de `src/enum/*.enum.ts` (`z.enum(PROJECT_TYPES)` aceita a tupla `as const`), nunca literais copiados. Importes nomeados do pacote (o lint proíbe `import * as`).

### Tipos: `z.infer` não entra

A regra é "um símbolo exportado por arquivo, tipos em `src/types/<dominio>/<Nome>.types.ts`". Os tipos já existem (`Profile`, `ProjectRecord`, `TimelineItemRecord`, `StackGroup`, `ResponsiveImage` e os enums) e servem a ~40 arquivos de código e de teste. Em vez de derivá-los:

- **Os tipos de `src/types/` continuam a fonte de verdade.** Cada schema é anotado contra o tipo existente (`const schema: ZodMiniType<Profile> = object({...})`), e o `tsc` acusa qualquer desvio entre schema e tipo nos dois sentidos. Esse é o guarda de compilação (confirmado no experimento acima).
- `z.infer` foi descartado porque: (a) trocaria ~40 arquivos de tipo para derivar de código de execução, fazendo `src/types/` depender de runtime e de uma biblioteca; (b) um `type X = z.infer<typeof y>` seria um segundo símbolo por arquivo ou obrigaria o schema a morar no arquivo de tipo, quebrando "um símbolo por arquivo"; (c) tipos como `ProjectRecord = Omit<ProjectDetail, ...>` são compostos à mão e não têm origem num schema.
- O tipo estrutural `ContentSchema<T>` (`src/types/content/ContentSchema.types.ts`) descreve só o que `readJson` usa, `safeParse(data: unknown)` devolvendo `{ success: true, data: T }` ou `{ success: false, error: { issues: { path, code, message }[] } }`. Assim `readJson` não importa o Zod (que precisa continuar fora da entrada) e a troca de biblioteca não o toca. Se o `tsc` rejeitar a atribuição de um schema de `zod/mini` a esse tipo, o `executor` ajusta o tipo estrutural (não faz cast) e registra.

### `readJson` e os carregadores

`readJson<T>(path, loadSchema)`, em que `loadSchema: () => Promise<ContentSchema<T>>` (o carregador chama `() => import("@/services/content/schemas/profile.schema").then((module) => module.default)`). `readJson` roda `readText(path)` e `loadSchema()` em paralelo (`Promise.all`), faz `JSON.parse`, depois `schema.safeParse`. `loadProfile`, `loadProjectRecords` e `loadTimelineRecords` passam o carregador do seu schema. O cache de `readText` (`contentCache`) guarda o texto, não o resultado: a validação roda a cada `readJson`, o que é barato e mantém o cache como está.

### O que acontece quando a validação falha

- `readJson` lança `ContentException` com `createContentError(500, "INVALID_CONTENT", mensagem, fields)`. `mensagem` é literal em português, de diagnóstico, no formato `O arquivo content/pt-BR/profile.json não segue o contrato: location.countryCode: <mensagem do schema>`, nomeando o primeiro campo inválido; `fields` leva até 10 `{ field, code, message }` (o `field` é o caminho com pontos). O texto do Zod nas `fields` fica no idioma padrão dele (inglês): é diagnóstico e não há `locale` do Zod carregado (peso).
- JSON ilegível (`JSON.parse` falha) vira o mesmo `INVALID_CONTENT`, com a mensagem `O arquivo <caminho> não é um JSON válido`.
- Falha de rede ou `status` não-`ok` de `readText` **não muda** (continua `Error` comum, que `toQueryError` transforma em `FETCH_ERROR`).
- **#160:** `toQueryError` já devolve o `contentError` de uma `ContentException` (`status 500` com `data.error`), e todos os `queryFn` já chamam `toQueryError`. Nenhum arquivo de `src/store/api/` muda nesta spec. A #160 depois só troca o `try/catch` repetido por um helper, sem conflito, porque o formato de erro é o mesmo. Nenhuma tela renderiza `data.error.message`, então não há chave de tradução.
- **Pré-renderização:** `loadPrerenderData` já lança quando a consulta falha (`isError`) e inclui `describeError(failed.error)`. Um JSON fora do contrato passa a **quebrar `npm run build`** com o arquivo e o campo na mensagem, em vez de gerar HTML com dado quebrado. Esse é o benefício concreto na v1.

### Chaves desconhecidas

O schema de execução **ignora chave desconhecida** (objeto padrão do Zod remove as extras), para a API de v2 poder acrescentar campo sem derrubar o cliente. O `content:check` continua estrito (`checkObjectKeys`), então chave sobrando num arquivo publicado segue reprovando no CI.

### Fonte única e duplicação aceita

Não dá para ter fonte única total agora: o `content:check` produz `ContentIssue` com caminho e regra de domínio sobre os três idiomas e o disco, e os schemas são só forma. O que esta spec faz:

- O `content.test.ts` ganha um `it` que roda os schemas sobre os nove arquivos publicados (`readContentSnapshot`), de modo que um schema desatualizado ou um JSON publicado fora dele reprova no CI (VAL-162-06).
- **Duplicação aceita:** chaves obrigatórias, tipos de campo e enums existem nos validadores à mão e nos schemas. A anotação contra `src/types/` mantém o schema alinhado ao tipo; o enum é compartilhado por `src/enum/`.
- **Pergunta para v2 / #43:** depois do corte, os schemas podem substituir a parte estrutural de `validateProfile`, `validateProjects`, `validateTimeline`, `validateStack` e `validateEnums` (chamando `safeParse` e mapeando `issues` para `ContentIssue`), deixando em `validation/` só parity, tradução, referências, datas, imagens e documentos. Não entra agora: refatorar 1.675 linhas de validador não cabe numa spec pequena.

### Prazo (v1 em 22/11/2026, corte de refatoração em 17/11)

A spec é pequena: dependência, 7 arquivos de schema, `readJson` e três carregadores, um tipo, um `it` no `content.test.ts`, ajuste de fixtures e documentação; **nenhum arquivo de `src/store/api/`, de página ou de componente muda**. Ela cumpre a exceção "spec pequena" de `decisoes.md`, desde que as fixtures de teste não se espalhem (risco abaixo). Se o Felipe preferir esperar o corte, ela vira a primeira da Onda 3 depois dele; se não houver tempo até 22/11, a #162 escorrega para depois da entrega e nada mais depende dela (só a #160, que não precisa dela).

## Critérios de aceite

- [ ] **VAL-162-01** — `readJson` com schema devolve o dado já validado e tipado, sem `as` (`src/services/content/test/readJson.test.ts`).
- [ ] **VAL-162-02** — Campo ausente, de tipo errado ou fora de enum em `profile.json`, `projects.json` ou `timeline.json` faz `loadProfile`, `loadProjectRecords` e `loadTimelineRecords` rejeitarem com `ContentException` de `status 500`, `code` `INVALID_CONTENT`, mensagem em português com o arquivo e o primeiro campo inválido, e `fields` com o caminho (testes dos três carregadores).
- [ ] **VAL-162-03** — JSON ilegível vira `INVALID_CONTENT` (mensagem "não é um JSON válido"); falha de rede ou `status` não-`ok` continua `Error` comum (`readJson.test.ts`).
- [ ] **VAL-162-04** — Os endpoints `getProfile`, `getProjects` e `getTimeline`, ao receber conteúdo inválido, devolvem `error` com `status: 500` e `data.error.code: "INVALID_CONTENT"`, sem mudança em `src/store/api/` (`profile.api.test.tsx`, `projects.api.test.tsx`, `timeline.api.test.tsx`).
- [ ] **VAL-162-05** — Cada schema aceita o objeto da fixture válida (`buildProfile`, `buildProjectRecord`, `buildTimelineItemRecord`) e rejeita, um teste por caso: campo obrigatório ausente, tipo errado, valor fora de enum, `types` vazio, `countryCode` fora de `^[A-Z]{2}$`, e-mail inválido, data fora de `AAAA-MM`; e **aceita** chave extra, que descarta (`src/services/content/schemas/test/*.test.ts`).
- [ ] **VAL-162-06** — `content.test.ts` prova que os nove arquivos publicados (`profile.json`, `projects.json`, `timeline.json` × `pt-BR`, `en`, `es`) passam nos schemas (`npm run content:check`).
- [ ] **VAL-162-07** — Um conteúdo inválido na pré-renderização faz `loadPrerenderData` lançar com o nome do arquivo e o campo na mensagem (`src/prerender/test/loadPrerenderData.test.ts`, caso novo se o arquivo não existir).
- [ ] **PERF-162-01** — Depois de `npm run build`, nenhum chunk de entrada (os `.js` que `dist/index.html` referencia por `<script type="module">` e `<link rel="modulepreload">`) contém o marcador do Zod que o `executor` escolher e conferir no chunk dos schemas, e o chunk dos schemas existe separado. Método e números (chunk dos schemas em gzip e brotli, entrada antes e depois) registrados em `docs/setup/entry-bundle-performance.md`. Verificado à mão com o comando da evidência (sem script novo em `check:chunk`).
- [ ] **PERF-162-02** — `npm run check:chunk` continua passando sem mudar nenhum teto.
- [ ] **VAL-162-08** — `npm run typecheck` e `npm run lint` passam, o tempo de `typecheck` antes e depois fica registrado (cobre a issue #6732 do Zod) e `package-lock.json` tem uma versão só de `zod`.
- [ ] **DOC-162-01** — `docs/architecture/data-model.md` ("Validação do conteúdo") traz o mapa do que `content:check` garante, diz que roda no teste e no CI, e descreve a validação de borda e a duplicação aceita; `docs/architecture/code-structure.md` ou `frontend.md` registra a pasta `schemas/` e o carregamento dinâmico; `docs/architecture/api-contract.md` registra que a v2 reaproveita os schemas na resposta da API.
- [ ] **QA-162-01** — Regressão: as cinco telas continuam carregando conteúdo em `pt-BR`, `en` e `es` (E2E existentes); sem tela nova, sem mudança visual.

## Casos de borda

- QUANDO o conteúdo traz chave extra ENTÃO o dado é aceito e a chave é descartada; no `content:check` a mesma chave reprova.
- QUANDO `projects.json` tem `items: []` ENTÃO é válido (a regra "ao menos uma imagem por projeto" continua do `content:check`).
- QUANDO o mesmo arquivo é lido duas vezes ENTÃO `readText` serve o texto do cache e a validação roda de novo, com o mesmo resultado.
- QUANDO o `import()` do schema falha (rede) ENTÃO o erro chega como `Error` comum e `toQueryError` o converte em `FETCH_ERROR`.
- QUANDO a validação falha numa carga de `readJson` com cache ENTÃO `readText` não é apagado do cache (o texto estava bom para a rede; quem estava errado é o conteúdo).

## Estratégia de validação

- **Checagens automatizadas:** testes dos schemas, de `readJson`, dos três carregadores, dos três endpoints e de `loadPrerenderData`; `npm run content:check`; `npm run check:chunk`; grep do marcador do Zod nos chunks de entrada.
- **Checagens manuais:** abrir `npm run dev` em `/pt-BR`, `/pt-BR/projects`, `/pt-BR/about` e trocar de idioma, conferindo a aba Network (o chunk dos schemas aparece depois da hidratação, não no HTML inicial) e a ausência de erro no console; quebrar à mão um campo num JSON de `public/content/` e ver a mensagem em português no console e o `npm run build` falhando com o arquivo e o campo (desfazer em seguida).
- **Rollback / mitigação:** a mudança está concentrada em `readJson`, nos três carregadores e em `schemas/`. Reverter o commit de `readJson` volta ao `JSON.parse ... as T` sem tocar mais nada. Se o `tsc` ficar lento ou estourar memória com o Zod (issue #6732), fixar `zod@4.6.5`, que a issue aponta como sem o problema.

## Riscos

| Risco                                                                                                           | Mitigação                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fixtures de teste parciais (30 arquivos usam `stubContentFetch` ou `parseUntyped`) passam a falhar na validação | T3 isola isso: rodar a suíte, trocar as fixtures parciais pelos `build*` de `src/testUtils/` (que devem seguir o tipo completo), sem afrouxar schema para o teste passar |
| Zod entra na entrada por engano (import estático em módulo compartilhado)                                       | PERF-162-01 (grep) e `readJson` sem import do Zod; só o carregador dinâmico importa `schemas/`                                                                           |
| Schema e tipo divergem                                                                                          | Anotação contra o tipo em `src/types/` (erro de compilação nos dois sentidos) e `content.test.ts` sobre os arquivos reais                                                |
| Regressão de caminho crítico: um `import()` a mais antes de renderizar                                          | Carregamento em paralelo com `readText`; primeira carga usa `prerender-data`, sem `fetch`, e não baixa o chunk                                                           |
| Mensagem do Zod em inglês nas `fields`                                                                          | Aceita (diagnóstico); a mensagem principal é em português                                                                                                                |
| Prazo: toca a camada de dados de todas as telas perto do corte                                                  | Escopo mínimo acima; sem mudança em `store/api`; se as fixtures se espalharem, adiar para depois do corte                                                                |

## Decisões do Felipe

Aprovadas em 11/11/2026, registradas pelo Orc em nome do Felipe.

1. **Biblioteca:** `zod/mini` carregado por `import()` dinâmico.
2. **Versão:** pin exato, sem `^`, em `zod@4.6.5` no `package.json` (a versão que evita a issue #6732 do `tsc`).
3. **Chaves desconhecidas em runtime:** ignoradas no cliente; a rejeição fica só no `content:check`.
4. **Erro de conteúdo:** `INVALID_CONTENT` com `status 500`.
5. **Duplicação:** a parte estrutural de `content:check` fica duplicada até a #43 (v2).
6. **Prazo:** a ordem de execução é decidida pelo Orc; a T4 (fixtures de teste) vai por último.
7. **Saída do Zod:** quando o backend real existir (v2, #43), a validação passa para a API e o Zod sai do cliente, junto com os schemas de `src/services/content/schemas/` e o carregamento dinâmico em `readJson`.
