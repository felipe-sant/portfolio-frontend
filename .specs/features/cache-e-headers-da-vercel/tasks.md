# Tasks: cache e headers da Vercel

> Spec: `./spec.md`

## Plano de execução

Uma tarefa por commit, nesta ordem (todas tocam `vercel.json` ou `scripts/test/vercelConfig.test.ts`, então nenhuma é
paralela). Nenhum código com comentário; `describe`/`it` em português; identificadores em inglês.

```
T1 (staging) → T2 (#194 cache) → T3 (#197 testes e ADR) → T4 (#163 dados em JSON) → T5 (#163 headers e CSP) → T6 (docs) → T7 (verificação)
```

| Tarefa | Commit sugerido                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------- |
| T1     | `Fix :bug: [#194] Acrescenta o noindex da staging sem descartar os headers do vercel.json`               |
| T2     | `Perf :zap: [#194] Define cache longo para os arquivos com hash no vercel.json` (título do PR)           |
| T3     | `Test :test_tube: [#197] Garante 404 para arquivo inexistente na Vercel e no Pages` (ver Q-4 da spec)    |
| T4     | `Refactor :recycle: [#163] Grava os dados da pré-renderização em bloco JSON em vez de script executável` |
| T5     | `Build :rocket: [#163] Adiciona headers de segurança e CSP em Report-Only ao vercel.json`                |
| T6     | `Docs :bulb: [#163] Documenta cache, headers e CSP só na Vercel`                                         |

T4 depende da resposta da Q-3 da spec. Se o PO recusar, pule T4 e, em T5, a CSP continua igual (o ensaio vai reportar
o script de dados das páginas pré-renderizadas).

## Tarefas

- [x] T1 — Acrescentar o `noindex` da `staging` ao fim de `headers` sem descartar as regras do `vercel.json`
    - **Arquivo(s):** `.github/workflows/deploy.yml` (passo "Block indexing" do job `staging`),
      `scripts/test/vercelConfig.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - CA-01: a expressão `jq` extraída do `deploy.yml`, aplicada ao `vercel.json`, devolve `headers` igual a
          `[...config.headers, NOINDEX_RULE]` (todas as regras do arquivo, na ordem, mais a de `noindex` no fim),
          mantendo `cleanUrls` e `trailingSlash` — `scripts/test/vercelConfig.test.ts` (substitui o `toEqual(NOINDEX_HEADERS)`
          atual e ajusta a regex que extrai a expressão, hoje presa a `. + {headers:`; continua com `skipIf(!hasJq)`)
        - CA-01, borda: aplicada a um `vercel.json` sem a chave `headers`, a expressão devolve só a regra de `noindex`
          (o `jq` com `.headers += [...]` trata `null` como lista vazia) — `scripts/test/vercelConfig.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/vercelConfig.test.ts`
    - **Feito quando:** o gate passa com `jq` instalado e o `deploy.yml` usa `.headers += [...]` (ou equivalente que
      acrescente)
    - **Evidência:** RED visto (`headers` vinha só com o `noindex`); gate verde (4 testes). CA-01:
      `scripts/test/vercelConfig.test.ts:55` `expect(staging.headers).toEqual([...(config.headers ?? []), NOINDEX_RULE])`
      e `:53-54` `cleanUrls`/`trailingSlash`; borda sem `headers`: `:62` `expect(staging.headers).toEqual([NOINDEX_RULE])`.

- [x] T2 — Regras de `Cache-Control` para `/assets`, `/fonts` e `/images` no `vercel.json`
    - **Arquivo(s):** `vercel.json`, `scripts/test/vercelConfig.test.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - CA-05, borda: só as regras de `source` `/assets/(.*)`, `/fonts/(.*)` e `/images/(.*)` definem
          `Cache-Control` (nenhuma outra regra, nem a de `/cv/(.*)\\.md`) — `scripts/test/vercelConfig.test.ts`
        - CA-02: `/assets/(.*)` define `Cache-Control: public, max-age=31536000, immutable` —
          `scripts/test/vercelConfig.test.ts`
        - CA-03: `/fonts/(.*)` define `Cache-Control: public, max-age=31536000, immutable` (ou o valor que o PO escolher
          na Q-1) — `scripts/test/vercelConfig.test.ts`
        - CA-04: `/images/(.*)` define `Cache-Control: public, max-age=2592000` e o valor não contém `immutable` (ou o
          valor da Q-2) — `scripts/test/vercelConfig.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/vercelConfig.test.ts`
    - **Feito quando:** o gate passa; a regra de `/cv/(.*)\\.md` continua igual
    - **Evidência:** RED visto (4 falhas, sem regra de cache); gate verde (8 testes). CA-05:
      `scripts/test/vercelConfig.test.ts:82` `expect(sourcesWithCache).toEqual(["/assets/(.*)", "/fonts/(.*)", "/images/(.*)"])`;
      CA-02: `:86` `expect(headerValue("/assets/(.*)", "Cache-Control")).toBe(LONG_IMMUTABLE_CACHE)`; CA-03: `:90` idem
      para `/fonts/(.*)`; CA-04: `:96` `expect(value).toBe("public, max-age=2592000")` e `:97`
      `expect(value).not.toContain("immutable")`.

- [x] T3 — Travar o 404 de caminho inexistente e corrigir o ADR 0003
    - **Arquivo(s):** `scripts/test/vercelConfig.test.ts`, `scripts/test/resolvePagesFile.test.ts`,
      `docs/adr/0003-hosting-vercel.md`
    - **Depende de:** T2
    - **Testes (escritos antes, RED):**
        - CA-06: o `vercel.json` não tem a chave `rewrites` nem a chave `routes` (substitui o teste atual "não tem
          reescrita genérica", que só olhava três `source`) — `scripts/test/vercelConfig.test.ts`
        - CA-07: `resolvePagesFile(directory, ".well-known/rsl.xml")` responde 404 com o `404.html` —
          `scripts/test/resolvePagesFile.test.ts`
        - CA-07: `resolvePagesFile(directory, "xyz.xml")` responde 404 com o `404.html` —
          `scripts/test/resolvePagesFile.test.ts`
        - Observação para o executor: os três testes acima já podem passar na primeira execução (o comportamento existe
          desde #49); são testes de regressão. Para provar que não são vazios, confira o vermelho de CA-06 pondo
          temporariamente um `rewrites` qualquer no `vercel.json` e desfaça antes do commit.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/vercelConfig.test.ts scripts/test/resolvePagesFile.test.ts`
    - **Feito quando:** o gate passa e a linha de "Consequências" do ADR 0003 que diz "`vercel.json` devolve
      `index.html` para qualquer caminho que não seja arquivo estático" passa a dizer que, sem reescrita, a Vercel serve
      o arquivo exato, o `<caminho>.html` (`cleanUrls`) ou o `404.html` com status 404 desde #49 (CA-08)
    - **Evidência:** testes de regressão, verdes na primeira execução; RED de CA-06 conferido pondo `rewrites` e depois
      `routes` temporários no `vercel.json` (1 falha cada), desfeito antes do commit; gate verde (29 testes). CA-06:
      `scripts/test/vercelConfig.test.ts:49` `expect(config).not.toHaveProperty("rewrites")` e `:50`
      `expect(config).not.toHaveProperty("routes")`; CA-07: `scripts/test/resolvePagesFile.test.ts:98`
      `expect(resolvePagesFile(directory, ".well-known/rsl.xml")).toEqual({ status: 404, file: join(directory, "404.html") })`
      e `:105` o mesmo para `"xyz.xml"`; CA-08: `docs/adr/0003-hosting-vercel.md`, item de "Consequências" reescrito.

- [x] T4 — Dados da pré-renderização num bloco `application/json` lido pelo cliente
    - **Arquivo(s):** `scripts/prerender/composePage.ts`, `scripts/test/composePage.test.ts`,
      `src/utils/readPrerenderData.ts` (novo), `src/utils/test/readPrerenderData.test.ts` (novo),
      `src/types/prerender/PrerenderData.types.ts` (novo, `{ path: string; state: Partial<RootState>; routerData:
HydrationState }`), `src/prerender/mountClient.tsx`, `src/prerender/test/mountClient.test.tsx`,
      `src/types/prerender.d.ts` (remove os três globais; apague o arquivo se ficar vazio)
    - **Depende de:** T3 e resposta "sim" à Q-3
    - **Testes (escritos antes, RED):**
        - CA-10, borda: a página composta não tem `<script>` sem `src` cujo `type` esteja ausente ou seja de JavaScript
          além dos que o molde já tem (use um molde de teste com um script inline próprio e confira que só ele
          aparece) — `scripts/test/composePage.test.ts`
        - CA-10: a página tem exatamente um `<script type="application/json" id="prerender-data">` logo depois de
          `#root`, cujo conteúdo, com `JSON.parse`, é `{ path: "<base><target.path>", state, routerData }` —
          `scripts/test/composePage.test.ts`
        - CA-10: um `</script>` dentro do estado sai como `</script>` no bloco (atualiza o teste de escape atual,
          que procura `window.preloadedState`) — `scripts/test/composePage.test.ts`
        - CA-11, borda: sem o elemento `#prerender-data` no documento, `readPrerenderData(document)` devolve `undefined`
          — `src/utils/test/readPrerenderData.test.ts`
        - CA-11, borda: com o elemento vazio, devolve `undefined` — `src/utils/test/readPrerenderData.test.ts`
        - CA-11: com o bloco preenchido, devolve `path`, `state` e `routerData` iguais aos gravados —
          `src/utils/test/readPrerenderData.test.ts`
        - CA-12: os testes de hidratação existentes de `mountClient` passam injetando o bloco `prerender-data` (vindo de
          `composePage`) no documento em vez de atribuir `window.prerenderedPath`, `window.preloadedState` e
          `window.routerData`; o caso do `404.html` aberto em outra URL continua indo para `createRoot` —
          `src/prerender/test/mountClient.test.tsx`
        - CA-12, borda: sem bloco (raiz `/`), o cliente usa `createRoot` sem estado — `src/prerender/test/mountClient.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/composePage.test.ts src/utils/test/readPrerenderData.test.ts src/prerender/test/mountClient.test.tsx src/prerender/test/shouldHydrate.test.ts`
    - **Feito quando:** o gate passa; `grep -rn "window.preloadedState\|window.prerenderedPath\|window.routerData" src scripts`
      não encontra nada; sem `any` explícito nem cast: o texto passa por `JSON.parse` para `unknown` e por um type
      predicate `isPrerenderData(value: unknown): value is PrerenderData` (objeto não nulo com `path` `string`, `state` e
      `routerData` objetos), o mesmo nível de confiança dos globais tipados de hoje; com JSON inválido ou forma errada,
      `readPrerenderData` devolve `undefined` (acrescente esse caso de borda ao teste de CA-11)
    - **Evidência:** RED visto em cada arquivo (composePage: 3 falhas; readPrerenderData: módulo inexistente;
      mountClient: 8 hidratações caindo em `createRoot`); gate verde (49 testes); o `grep` dos globais não acha nada e
      `src/types/prerender.d.ts` foi apagado. O id `prerender-data` virou a constante `src/utils/prerenderDataId.ts`,
      usada por `composePage`, `readPrerenderData` e o teste de `mountClient`. Os testes de `composePage` leem o HTML por
      regex porque o projeto `scripts` do Vitest roda em `node`, sem `DOMParser`. CA-10:
      `scripts/test/composePage.test.ts:139` `expect(executableInlineScripts(page)).toEqual(["window.fromTemplate=1"])`,
      `:145` `expect(page.match(/id="prerender-data"/g)).toHaveLength(1)`, `:146` bloco logo depois de `#root`, `:149`
      `expect(JSON.parse(readDataBlock(page) ?? "")).toEqual({ path: "/ra2581392423047/en", state, routerData })`,
      `:161` `expect(block).not.toContain("<")`; CA-11: `src/utils/test/readPrerenderData.test.ts:18` (sem bloco),
      `:24` (vazio), `:35` `expect(readPrerenderData(document)).toEqual(data)`, `:41` (JSON inválido), `:54` e `:60`
      (forma errada) `toBeUndefined()`; CA-12: `src/prerender/test/mountClient.test.tsx:186`
      `expect(screen.getByRole("heading", ...)).toBe(heading)` com o bloco injetado (e os demais casos de hidratação),
      `:230` 404.html em outra URL, `:167` `expect(...).not.toBe(serverHeading)` sem bloco.

- [x] T5 — Headers de segurança e CSP em `Report-Only` com hash dos scripts inline
    - **Arquivo(s):** `vercel.json`, `scripts/test/vercelConfig.test.ts`
    - **Depende de:** T4 (ou T3, se a Q-3 for recusada)
    - **Testes (escritos antes, RED):**
        - CA-15, borda: o conjunto de `sha256-...` em `script-src` da `Content-Security-Policy-Report-Only` é igual ao
          conjunto calculado do `index.html` (cada `<script>` sem atributo, com `%BASE_URL%` trocado por `/`,
          `createHash("sha256").update(conteúdo).digest("base64")`), nem a mais nem a menos —
          `scripts/test/vercelConfig.test.ts`
        - CA-15, borda: o cálculo encontra exatamente 3 scripts inline no `index.html` hoje (para o teste não passar
          vazio se a regex deixar de casar) — `scripts/test/vercelConfig.test.ts`
        - CA-14: a regra de `source` `/(.*)` define `Content-Security-Policy-Report-Only` com as diretivas
          `default-src 'self'`, `script-src 'self' <hashes>`, `style-src 'self' 'unsafe-inline'`,
          `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'`, `worker-src 'self'`,
          `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, sem `'unsafe-inline'` nem `'unsafe-eval'` em
          `script-src` — `scripts/test/vercelConfig.test.ts`
        - CA-13: a mesma regra define `X-Content-Type-Options: nosniff`,
          `Referrer-Policy: strict-origin-when-cross-origin`,
          `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`,
          `X-Frame-Options: SAMEORIGIN` e `Content-Security-Policy: frame-ancestors 'self'` (não `DENY`/`'none'`: o
          modal do CV enquadra o PDF da própria origem) —
          `scripts/test/vercelConfig.test.ts`
        - CA-05 continua verde: a regra `/(.*)` não define `Cache-Control` — `scripts/test/vercelConfig.test.ts`
        - CA-01 continua verde: a mescla da `staging` mantém a regra nova e põe o `noindex` depois dela —
          `scripts/test/vercelConfig.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/vercelConfig.test.ts`
    - **Feito quando:** o gate passa; os hashes no `vercel.json` batem com os de "Notas / decisões" da spec (se não
      baterem, o `index.html` mudou e vale o teste)
    - **Evidência:** RED visto (3 falhas sem a regra `/(.*)`); gate verde (12 testes); os 3 hashes batem com os de "Notas
      / decisões"; um espaço acrescentado temporariamente ao primeiro script inline do `index.html` derruba os 2 testes
      de CSP (desfeito antes do commit). Linhas de `scripts/test/vercelConfig.test.ts` neste commit (as das tarefas
      anteriores mudaram de posição): CA-13 `:117-123` `expect(headerValue("/(.*)", "X-Frame-Options")).toBe("SAMEORIGIN")`
      e `expect(headerValue("/(.*)", "Content-Security-Policy")).toBe("frame-ancestors 'self'")`, mais `nosniff`,
      `Referrer-Policy` e `Permissions-Policy`; CA-14 `:129` `expect(Object.fromEntries(directives)).toEqual({...})` com
      as 10 diretivas, `:141-142` `not.toContain("'unsafe-inline'")`/`not.toContain("'unsafe-eval'")`; CA-15 `:150`
      `expect(new Set(hashes)).toEqual(new Set(inlineScriptHashes))` e `:155` `expect(inlineScriptHashes).toHaveLength(3)`;
      CA-05 continua em `:98` e CA-01 em `:81`.

- [x] T6 — Documentar cache, headers, CSP e o bloco `prerender-data`
    - **Arquivo(s):** `docs/setup/environments.md`, `docs/adr/0003-hosting-vercel.md`, `docs/architecture/frontend.md`,
      `docs/adr/0004-prerendering.md`, `docs/product/non-functional-requirements.md`
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:** (CA-17)
        - `environments.md`, no parágrafo do `vercel.json` da seção da Vercel: as regras de cache (valores e por que
          `/images` não tem `immutable`), os headers, a CSP em `Report-Only` sem endpoint, como atualizar o hash ao mudar
          um script inline do `index.html` (o teste aponta), a mescla do `noindex` que agora acrescenta, o roteiro de
          `curl -sI` com bypass do ensaio e a frase de que o build da Fatec (GitHub Pages) não recebe nada disso;
        - ADR 0003: consequência nova dizendo que cache e headers vivem no `vercel.json` e só valem na Vercel;
        - `frontend.md` ("Composição", "Cliente" e "Pré-renderização: detalhe") e ADR 0004 (seção "Decisão" e item 8 de
          lint, que cita os globais): bloco `<script type="application/json" id="prerender-data">` no lugar de
          `window.prerenderedPath`, `window.preloadedState` e `window.routerData`, e por quê (CSP);
        - `non-functional-requirements.md`: linhas NF-HO-07 (cache na Vercel, "Como é verificado": teste do
          `vercel.json` e `curl -sI`, "Quando": #194) e NF-HO-08 (headers e CSP `Report-Only` na Vercel, teste dos hashes
          e ensaio na `staging`, #163), cada uma dizendo que o Pages não recebe (NF-HO-04);
        - nenhuma menção restante a `window.preloadedState` como global em `docs/` (as de `renderWithStore` e
          `createStore(preloadedState)` ficam)
    - **Evidência:** `npm run lint` verde. `environments.md` ("Fluxo de publicação": mescla que acrescenta, cache, headers,
      CSP sem endpoint, como atualizar o hash, roteiro de `curl -sI` e console, Fatec fora); ADR 0003 (consequência de
      cache e headers só na Vercel); `frontend.md` ("Composição", "Cliente", bullet "Cache e headers na Vercel" e
      "Pré-renderização: detalhe"); ADR 0004 ("Decisão", item 5, item 8 e plano); `non-functional-requirements.md`
      (NF-HO-07 e NF-HO-08). `grep -rn "window.preloadedState\|prerenderedPath" docs` sem resultado.

- [ ] T7 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada da feature). Os E2E de hidratação, sem
      JavaScript e não encontrada (`e2e/no-javascript.spec.ts`, `e2e/home.spec.ts`, `e2e/project-documents.spec.ts`,
      `e2e/not-found.spec.ts`) rodam no CI do PR sobre o `build:fatec`
    - **Feito quando:** os gates passam e `dist/en.html` tem um `<script type="application/json" id="prerender-data">` e
      nenhum script inline sem `type` além dos 3 do `index.html`
    - **Evidência:**

## Depois do merge na `staging` (ensaio do `qa`, não é tarefa do `executor`)

- [ ] CA-09: `curl` com bypass em `/.well-known/rsl.xml`, `/xyz.xml`, `/projects` (404) e `/pt-BR`, `/en/projects`,
      um documento `.md` de projeto (200).
- [ ] CA-02 a CA-05, CA-13, CA-14: `curl -sI` com bypass nos caminhos de "Estratégia de validação" da spec.
- [ ] CA-16: o modal do CV mostra o PDF; console do DevTools nas telas listadas na spec, separando as violações da barra da Vercel e do pdf.js
      (esperadas, em "Riscos") das do site; o resultado vai para a issue de tornar a CSP obrigatória.
