# Tasks: raiz com conteúdo, canonical e links

> Spec: `./spec.md`

## Plano de execução

```
T1 (teste que reproduz o bug)  →  T2  →  T3  →  T4 [P] e T5 [P]  →  T6
```

## Tarefas

- [x] T1 — Teste que reproduz o bug e `composeRootPage`
    - **Arquivo(s):** `scripts/prerender/composeRootPage.ts`, `scripts/test/composeRootPage.test.ts`, `src/types/prerender/RootPageTexts.types.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - idempotência: aplicar duas vezes dá o mesmo HTML de uma, sem canonical, `hreflang` nem `<noscript>` duplicados (spec, caso de borda; `scripts/test/composeRootPage.test.ts`)
        - molde vindo de raiz já processada: remover os itens da raiz devolve o molde original (spec, caso de borda; mesmo arquivo)
        - o molde sem os itens deixa o script de redirecionamento e os 3 scripts inline byte a byte iguais (spec, critério do script; mesmo arquivo)
        - `base` `/ra2581392423047/` e origem da Fatec: canonical `.../ra2581392423047/en`, quatro `hreflang` (`x-default` para `en`) e `href` do `<noscript>` com o `base` (NF-IA-11, NF-IA-22; mesmo arquivo)
        - `<html lang="en">`, título e descrição do `en` no lugar dos de `pt-BR`, sem duplicar (NF-IN-05, NF-IA-22; mesmo arquivo)
        - `og:title`, `og:description`, `og:type`, `og:url` (= canonical) e `og:image` absoluto (NF-IA-10; mesmo arquivo)
        - `<noscript data-root>` com `<h1>` e `<nav>` com três `<a href hreflang lang>` e o texto de cada idioma escapado (NF-IA-22; mesmo arquivo)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/composeRootPage.test.ts`
    - **Feito quando:** o gate passa, o `index.html` do repositório e `scripts/test/indexHtmlMeta.test.ts` seguem sem alteração, e cada teste listado existe
    - **Evidência:** RED visto (módulo inexistente e, depois, uma asserção minha corrigida); GREEN: `scripts/test/composeRootPage.test.ts` 8 testes e `indexHtmlMeta.test.ts` passam; typecheck e lint limpos. Cobertura por critério: idempotência (`composeRootPage.test.ts`, `expect(twice).toBe(once)`); molde limpo (`removeRootPageItems(TEMPLATE)).toBe(TEMPLATE)`); 3 scripts inline byte a byte (`toContain(REDIRECT_SCRIPT)`, `THEME_SCRIPT`, `MOTION_SCRIPT`); canonical e 4 `hreflang` com `base` da Fatec; lang/título/descrição `en`; `og:*`; `<noscript data-root>` com h1 e 3 links escapados. Desvio: a função de remoção ficou em `scripts/prerender/removeRootPageItems.ts` (um símbolo por arquivo); ao limpar uma raiz já processada, lang/título/descrição ficam os do `en` e o noscript vira `<noscript></noscript>` (o `composePage` os substitui nas demais páginas).

- [x] T2 — Leitura dos textos da raiz nos três idiomas
    - **Arquivo(s):** `scripts/prerender/readRootTexts.ts`, `scripts/test/readRootTexts.test.ts`, `src/locales/pt-BR/common.json`, `src/locales/en/common.json`, `src/locales/es/common.json`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - devolve `root.heading`, `root.link` de cada idioma, o rótulo `languageSelector.label` de `en` e `meta.title`/`meta.description` de `en/home.json` (NF-IA-22, NF-IN-01; `scripts/test/readRootTexts.test.ts`)
        - chave ausente em qualquer idioma falha citando idioma e chave (spec, caso de borda; mesmo arquivo)
        - os três `common.json` reais trazem `root.heading` e `root.link`, com os valores da spec (R2, NF-IN-01; mesmo arquivo, lendo `src/locales`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/readRootTexts.test.ts`
    - **Feito quando:** o gate passa e os três idiomas têm as duas chaves novas (sem comentário, `pt-BR` como referência)
    - **Evidência:** RED visto (`root.heading` ausente nos `common.json` reais); GREEN: `scripts/test/readRootTexts.test.ts` 3 testes (`expect(texts).toEqual(...)`, `rejects.toThrow(/"root\.link".*"es"/)`, valores reais da spec) passam, junto com `composeRootPage.test.ts`, `src/i18n`, `src/routers` e `src/test/entry-server.test.tsx` (21 arquivos, 280 testes); typecheck e lint limpos; chaves `root.heading`/`root.link` nos três idiomas.

- [x] T3 — Gerar a raiz no fim da pré-renderização
    - **Arquivo(s):** `scripts/prerender.ts`
    - **Depende de:** T1, T2
    - **Testes (escritos antes, RED):** o script é de topo de arquivo e não tem teste de unidade; o comportamento está provado em T1 e T2 e no E2E de T5. Verificação do executor: `npm run build:fatec`, depois `grep -c 'rel="canonical"' dist/index.html dist/en.html dist/404.html` dá 1, 1 e 0 em `404.html`
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** o gate passa; a raiz é gravada depois do último alvo e do `404.html`; o molde usado pelas demais páginas passa pela remoção dos itens da raiz (uma segunda `npm run prerender` não vaza canonical); `listTargets`, `prerenderRoutes`, `routes.tsx` e `vercel.json` seguem sem alteração
    - **Evidência:** typecheck e lint limpos; a raiz é gravada depois do laço de alvos (inclui `404.html`) e o molde passa por `removeRootPageItems`; `listTargets`, `prerenderRoutes`, `routes.tsx` e `vercel.json` sem alteração. Verificação do build (`grep -c 'rel="canonical"' dist/index.html dist/en.html dist/404.html`): verificação no CI / manual do PO.

- [ ] T4 [P] — Estilo do `<noscript>` da raiz
    - **Arquivo(s):** `src/styles/global.css`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (aparência). Verificação manual: `npm run build:fatec && npm run preview:fatec`, abrir `http://localhost:4173/ra2581392423047/` com JavaScript desligado, em claro e escuro, em 390 px e 1280 px; a raiz não tem faixa vermelha, usa tokens, os links são legíveis e mostram foco visível
    - **Gate:** `npm run lint`
    - **Feito quando:** `body > noscript` exclui `[data-root]` e há regra própria só com custom properties de `global.css`; sem estilo inline nem cor literal
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T5 [P] — E2E da raiz sem JavaScript
    - **Arquivo(s):** `e2e/no-javascript.spec.ts`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** num `describe` com `javaScriptEnabled: false` e `page.goto("")`, com ID de requisito no título:
        - `NF-IA-22, NF-IA-04, NF-IN-05`: a raiz responde 200, `html` com `lang="en"`, `h1` e três links com `href` `<base><idioma>`, `hreflang` e `lang`
        - `NF-IA-22, NF-IA-11`: canonical absoluto para `/en` e `hreflang` `pt-BR`, `en`, `es`, `x-default` (este para `/en`), todos sob o `base` da Fatec
        - `NF-IA-22, NF-IA-10`: título, descrição e `og:*` do `en`
        - `NF-IA-22`: clicar em cada link (com JavaScript ligado só para a navegação seguinte, via `request`/`goto`) leva a `/<idioma>` com 200; `404.html` aberto em caminho inexistente não tem `link[hreflang]` nem `noscript[data-root]`
          A redireção com JavaScript e o sitemap sem a raiz já são cobertos por `e2e/language.spec.ts` ("raiz e caminho sem prefixo") e `e2e/machine-files.spec.ts` (NF-IA-15), sem mudança. `e2e/support/specClassification.ts` e `e2e/support/routesUnderTest.ts` não mudam (o spec já está em `independentSpecs`).
    - **Gate:** `npm run typecheck && npm run lint` (E2E roda na tarefa final, uma vez: `npm run build:fatec && npm run test:e2e -- e2e/no-javascript.spec.ts e2e/language.spec.ts e2e/machine-files.spec.ts`)
    - **Feito quando:** o gate passa e os testes acima existem; o E2E dos três specs passa depois do build
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T6 — Documentação
    - **Arquivo(s):** `docs/product/non-functional-requirements.md`, `docs/architecture/frontend.md`, `docs/setup/environments.md`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run format -- --check` ou `npx prettier --check docs/product/non-functional-requirements.md docs/architecture/frontend.md docs/setup/environments.md`
    - **Feito quando:** `NF-IA-22` existe; `NF-IA-17` (raiz em `pt-BR`) e `NF-IN-09` ("só redireciona") deixam de contradizer a spec; `frontend.md` (registro de pré-renderização, "Arquivos", "Composição" e a nota do script na raiz) e `environments.md` (a raiz serve o `index.html` gerado com `lang` `en`, canonical, `hreflang` e `<noscript>`) descrevem `composeRootPage`; o catálogo/ `CLAUDE.md` não precisa mudar
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T7 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada); depois `npm run build:fatec && npm run test:e2e -- e2e/no-javascript.spec.ts e2e/language.spec.ts e2e/machine-files.spec.ts`
    - **Feito quando:** o gate passa e o `curl -s` da raiz de `preview:fatec` mostra `canonical`, quatro `hreflang` e o `<noscript>` com os três links
    - **Evidência:** (preenchida pelo `executor`)
