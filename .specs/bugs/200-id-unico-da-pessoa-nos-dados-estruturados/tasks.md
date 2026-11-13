# Tasks: 200-id-unico-da-pessoa-nos-dados-estruturados

> Spec: `./spec.md`

Regras para todas as tarefas: nenhum comentário em código ou teste (nem `//`, `/* */`, JSDoc, `{/* */}`); `describe`/`it` em português; import por `@/`; um `export default` no final de cada arquivo; teste vermelho nunca é commitado (o vermelho vive só no working tree entre o teste e o código).

## Plano de execução

```
Fase 1          Fase 2                 Fase 3   Commit 1   Fase 4        Commit 2   Fase 5
  T1   →   T2 → T3 → T4 (sequenciais)  →  T5   →   T6    →   T7    →     T8     →   T9
```

T2, T3 e T4 são sequenciais porque mexem nos mesmos arquivos de teste (`buildContactJsonLd.test.ts`, `buildProjectJsonLd.test.ts`).

## Tarefas

- [x] T1 — Criar `buildPersonId()`, a fonte única do `@id` da `Person`
    - **Arquivo(s):** `src/utils/buildPersonId.ts` (novo), `src/utils/test/buildPersonId.test.ts` (novo)
    - **Depende de:** nenhuma
    - **Implementação:** função sem parâmetro que devolve `` `${getSiteUrl()}${publicUrl("/")}#person` ``, com `export default buildPersonId` no final.
    - **Testes (escritos antes, RED):** no formato de `src/utils/test/buildAbsoluteUrl.test.ts` (`vi.stubEnv("BASE_URL", ...)`, `vi.stubEnv("VITE_SITE_URL", ...)`, `vi.resetModules()` e `await import("@/utils/buildPersonId")`, com `vi.unstubAllEnvs()` e `vi.resetModules()` no `afterEach`), em `src/utils/test/buildPersonId.test.ts`:
        - CA1: com `VITE_SITE_URL` terminada em `/` e `base` `/ra2581392423047/`, devolve `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/#person` e não tem `//` depois de `https://`.
        - CA1: com `base` de subpasta, o `base` aparece uma vez só.
        - CA1: com `base` `/`, devolve `https://fatec-jacarei-dsm-portfolio.github.io/#person`, sem `pt-BR`, `en` nem `es`.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test/buildPersonId.test.ts`
    - **Feito quando:** o gate passa e cada teste listado está na tabela de adequação.
    - **Evidência:** RED: `buildPersonId.test.ts` falhou por módulo inexistente; GREEN com 3 testes. Gate verde (typecheck, lint, 3 testes). Adequação: CA1 origem com `/` e base de subpasta → `src/utils/test/buildPersonId.test.ts:23` `expect(id).toBe(SITE_URL + "/ra2581392423047/#person")` e `:24` `not.toContain("//")`; base uma vez → `:31` `expect(id.split("ra2581392423047")).toHaveLength(2)`; base `/` sem idioma → `:38` `toBe(SITE_URL + "/#person")` e `:39` `not.toMatch(/\/(pt-BR|en|es)(\/|#)/)`.

- [x] T2 — Usar `buildPersonId()` nos seis construtores (reproduz o bug primeiro)
    - **Arquivo(s):** `src/utils/build{About,Contact,Document,Home,Project,Projects}JsonLd.ts`; testes `src/utils/test/build{About,Contact,Document,Home,Project,Projects}JsonLd.test.ts`, `src/pages/test/Home.page.test.tsx`, `src/pages/test/Projects.page.test.tsx`, `src/test/entry-server.test.tsx`
    - **Depende de:** T1
    - **Implementação:** trocar todo `` `${buildAbsoluteUrl(ROUTES.home, language)}#person` `` (e o `personId`/`homeUrl` + `#person` de Home e About) por `buildPersonId()`. Em `buildHomeJsonLd`, `WebSite.publisher` e `Person["@id"]` usam `buildPersonId()`, e `WebSite.url` e `Person.url` continuam `buildAbsoluteUrl(ROUTES.home, language)`. Em `buildAboutJsonLd`, `mainEntity.url` continua a Início do idioma. Remover import de `ROUTES` ou `buildAbsoluteUrl` que ficar sem uso.
    - **Testes (escritos antes, RED):** primeiro trocar as afirmações do id antigo pelo id da raiz (`` `${SITE_URL}/#person` `` com `SITE_URL` `http://localhost:5173`, ou `buildPersonId()`) e ver falhar; o vermelho é a reprodução do bug:
        - CA2: `buildHomeJsonLd` em `pt-BR` devolve `publisher["@id"]` e `Person["@id"]` iguais a `` `${SITE_URL}/#person` ``, com `url` `` `${SITE_URL}/pt-BR` `` nos dois nós (`src/utils/test/buildHomeJsonLd.test.ts`, teste "monta WebSite e Person ligados pelo @id").
        - CA2: `buildHomeJsonLd` sem perfil em `es` contém `` `${SITE_URL}/#person` `` e não contém `/es#person` (`src/utils/test/buildHomeJsonLd.test.ts`).
        - CA2: `buildHomeJsonLd` devolve o mesmo `Person["@id"]` em `pt-BR`, `en` e `es` (`src/utils/test/buildHomeJsonLd.test.ts`, teste novo com `it.each` ou um laço).
        - CA2: na página, `person["@id"]` é `` `${SITE_URL}/#person` `` nos três idiomas e `website.publisher["@id"]` é igual a ele (`src/pages/test/Home.page.test.tsx`, linha 223).
        - CA3: `buildAboutJsonLd` sem perfil traz `mainEntity["@id"]` `` `${SITE_URL}/#person` `` e `url` `` `${SITE_URL}/pt-BR` `` (`src/utils/test/buildAboutJsonLd.test.ts`, primeiro teste).
        - CA3: `buildAboutJsonLd` em `en` traz `@id` `` `${SITE_URL}/#person` `` e `url` `` `${SITE_URL}/en` `` (`src/utils/test/buildAboutJsonLd.test.ts`, linha 39).
        - CA4: `buildContactJsonLd` traz `mainEntity["@id"]` `` `${SITE_URL}/#person` `` em `en` e em `pt-BR`, com e sem perfil (`src/utils/test/buildContactJsonLd.test.ts`; trocar o `buildAbsoluteUrl(ROUTES.home, "en")` do teste e tirar os imports que sobrarem). As afirmações de `email` ficam para T3.
        - CA5: `buildProjectsJsonLd` traz `author` ``{ "@id": `${SITE_URL}/#person` }`` (`src/utils/test/buildProjectsJsonLd.test.ts`, linha 35) e a página também (`src/pages/test/Projects.page.test.tsx`, linha 622).
        - CA6: `buildProjectJsonLd` em `en` traz `author` ``{ "@id": `${SITE_URL}/#person` }`` (`src/utils/test/buildProjectJsonLd.test.ts`, linha 53).
        - CA6: `buildDocumentJsonLd` em `en` traz `author` ``{ "@id": `${SITE_URL}/#person` }`` (`src/utils/test/buildDocumentJsonLd.test.ts`, linha 41).
        - CA2: o HTML pré-renderizado de `pt-BR.html`, `en.html` e `es.html` contém `http://localhost:5173/#person` e não contém `` `http://localhost:5173/${language}#person` `` (`src/test/entry-server.test.tsx`, linha 218).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test src/pages/test/Home.page.test.tsx src/pages/test/Projects.page.test.tsx src/test/entry-server.test.tsx`
    - **Feito quando:** o gate passa e `grep -rn '#person' src e2e scripts` só mostra `src/utils/buildPersonId.ts` e testes que afirmam `` `${SITE_URL}/#person` ``, `http://localhost:5173/#person`, o literal de `buildPersonId.test.ts` ou `buildPersonId()` (CA9).
    - **Evidência:** RED: 18 testes falharam com o id antigo `<origem>/<idioma>#person` (reprodução do bug); GREEN depois da troca nos seis construtores; gate verde (62 arquivos, 550 testes). Adequação: CA2 → `buildHomeJsonLd.test.ts:29` e `:33` `${SITE_URL}/#person`, `:58`/`:59` `toContain(SITE_URL + "/#person")` e `not.toContain("/es#person")`, `:68` mesmo `@id` nos três idiomas; `Home.page.test.tsx:223` `toBe(SITE_URL + "/#person")` e `:224` `publisher["@id"]` igual; `entry-server.test.tsx:218`/`:219`. CA3 → `buildAboutJsonLd.test.ts:26` e `:39`/`:40` (`url` `${SITE_URL}/en`). CA4 (id) → `buildContactJsonLd.test.ts:32`, `:52`, `:63`. CA5 → `buildProjectsJsonLd.test.ts:35`, `Projects.page.test.tsx:622`. CA6 → `buildProjectJsonLd.test.ts:123`, `buildDocumentJsonLd.test.ts:41`. CA9: `grep -rn '#person' src e2e scripts` só mostra `src/utils/buildPersonId.ts:5` e testes com `${SITE_URL}/#person`, `http://localhost:5173/#person` ou o literal de `buildPersonId.test.ts`.

- [x] T3 — `email` do JSON-LD de Contato sem `mailto:`
    - **Arquivo(s):** `src/utils/buildContactJsonLd.ts`; testes `src/utils/test/buildContactJsonLd.test.ts`, `src/pages/test/Contact.page.test.tsx`
    - **Depende de:** T2
    - **Implementação:** `email: profile?.contact.email` (sem o prefixo); sem perfil, `email` continua `undefined`.
    - **Testes (escritos antes, RED):**
        - CA4: sem perfil, `mainEntity` não tem `email` (borda; o teste "sem perfil não lança e omite email e sameAs" continua igual, mas confirmar que segue verde).
        - CA4: com perfil, `mainEntity.email` é `profile.contact.email` exatamente e não começa com `mailto:` (`src/utils/test/buildContactJsonLd.test.ts`; renomear o `it` "usa o mesmo @id da Person da Início e o e-mail em mailto" para algo como "usa o @id único da Person e o e-mail sem mailto", e corrigir o `toEqual` de "omite sameAs sem nenhuma rede").
        - CA4: na página de Contato, `readJsonLd().mainEntity.email` é `"contato@example.com"` (`src/pages/test/Contact.page.test.tsx`, linha 224).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test/buildContactJsonLd.test.ts src/pages/test/Contact.page.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado está na tabela de adequação.
    - **Evidência:** RED: 3 testes falharam (`mailto:` no `email`); GREEN com `email: profile?.contact.email`; gate verde (2 arquivos, 19 testes). Adequação: CA4 → `buildContactJsonLd.test.ts:33` `email: profile.contact.email` e `:36` `expect(JSON.stringify(jsonLd.mainEntity)).not.toContain("mailto:")`; `:54` (`toEqual` sem rede); sem perfil `:61` `toEqual` sem `email`; `Contact.page.test.tsx:224` `toBe("contato@example.com")`.

- [x] T4 — `keywords` sem repetir `programmingLanguage` nem nomes repetidos
    - **Arquivo(s):** `src/utils/buildProjectJsonLd.ts`; teste `src/utils/test/buildProjectJsonLd.test.ts`
    - **Depende de:** T3
    - **Implementação:** nomes da stack sem repetição (`Array.from(new Set(...))`); `programmingLanguage` = nomes sem repetição dos itens com `isProgrammingLanguage`, emitido só com repositório e lista não vazia; `keywords` = nomes da stack menos os de `programmingLanguage` quando ele é emitido, ou todos quando não é; `keywords` vazio vira `undefined`. Funções auxiliares pequenas no próprio arquivo, sem regra no objeto literal além da escolha do valor.
    - **Testes (escritos antes, RED):** com `buildProjectDetailFixture` (stack `React` e `TypeScript` com `isProgrammingLanguage: true`):
        - CA7: stack só de linguagens (`TypeScript` marcada) e com `repositoryUrl` omite `keywords` (`node.keywords` `undefined`) e traz `programmingLanguage` `["TypeScript"]`.
        - CA7: `TypeScript` marcada em dois grupos (`frontend` e `backend`) com `React` e com repositório traz `programmingLanguage` `["TypeScript"]` e `keywords` `["React"]`.
        - CA7: `React` em dois grupos sem repositório traz `keywords` com `React` uma vez só.
        - CA7: com `repositoryUrl`, `keywords` é `["React"]`, `programmingLanguage` é `["TypeScript"]` e a interseção das duas listas é vazia (estender o teste "vira SoftwareSourceCode com repositório e só as linguagens de programação").
        - CA7: sem repositório, `programmingLanguage` é `undefined` e `keywords` continua `["React", "TypeScript"]` (o teste "traz as imagens grandes absolutas, o gênero e as palavras-chave da stack" continua igual e segue verde).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test/buildProjectJsonLd.test.ts`
    - **Feito quando:** o gate passa e cada teste listado está na tabela de adequação.
    - **Evidência:** RED: 4 testes falharam (`keywords` com `TypeScript` e repetições); GREEN com `uniqueNames` e `orUndefined`; gate verde (8 testes). Adequação: CA7 → `buildProjectJsonLd.test.ts:40`/`:41` `programmingLanguage` `["TypeScript"]` e `keywords` `["React"]`, `:42` interseção `toEqual([])`; `:69`/`:70` só linguagens omite `keywords`; `:95`/`:96` linguagem em dois grupos; `:111` `React` em dois grupos sem repositório uma vez; `:141` sem repositório `["React", "TypeScript"]`.

- [x] T5 — Documentar o formato do id, o e-mail e a regra de `keywords`
    - **Arquivo(s):** `docs/screens/home.md`, `docs/screens/about.md`, `docs/screens/contact.md`, `docs/screens/projects.md`, `docs/screens/project.md`, `docs/architecture/frontend.md`
    - **Depende de:** T4
    - **Testes (escritos antes, RED):** não se aplica (documentação)
    - **O que muda:**
        - Nos exemplos JSON e nas frases "O `@id` da `Person` é `<URL canônica de />#person`..." de `home.md`, `about.md`, `contact.md`, `projects.md` e `project.md` (linhas 375 e 381): trocar por `<origem><base>/#person` (raiz do site com o `base` do Vite, sem prefixo de idioma, por `buildPersonId()`), mantendo a referência à decisão transversal do PO de 11-10-2026.
        - `home.md`: dizer que `WebSite.url` e `Person.url` seguem a Início do idioma e que o `publisher` aponta o id único.
        - `contact.md`: no exemplo, `"email": "<e-mail do conteúdo>"`, sem `mailto:`, e uma frase dizendo que o JSON-LD usa o endereço puro (o `href` do botão continua `mailto:`).
        - `project.md` (linha 377): `keywords` são os itens da stack sem repetição e, em `SoftwareSourceCode`, sem as linguagens de `programmingLanguage`; omitido quando vazio.
        - `docs/architecture/frontend.md` (linhas 64 e 346): citar `buildPersonId()` em `src/utils/` e o formato `<origem><base>/#person`.
    - **Gate:** `grep -rn 'URL canônica de />#person' docs` sem resultado e `grep -n 'mailto' docs/screens/contact.md` sem `"email": "mailto:`
    - **Feito quando:** o gate passa e CA10 está atendido.
    - **Evidência:** `grep -rn 'URL canônica de />#person' docs` sem resultado; `grep -n 'mailto' docs/screens/contact.md` sem `"email": "mailto:`. `prettier --check` verde nos arquivos alterados.

- [x] T6 — Commit principal
    - **Arquivo(s):** os de T1 a T5
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test src/pages/test/Home.page.test.tsx src/pages/test/Contact.page.test.tsx src/pages/test/Projects.page.test.tsx src/test/entry-server.test.tsx`
    - **Feito quando:** o gate passa e existe um commit `Fix :bug: [#200] Unifica o id da pessoa e corrige e-mail e palavras-chave dos dados estruturados` com só os arquivos de T1 a T5 (`git add` explícito por arquivo) e a linha final `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
    - **Evidência:** Gate verde (typecheck, lint, testes da área). Commit principal com `git add` explícito por arquivo.

- [x] T7 — Teste de caracterização do cargo em Início e Informações (#199)
    - **Arquivo(s):** `src/test/entry-server.content.test.tsx`
    - **Depende de:** T6
    - **Implementação:** novo `it.each(SUPPORTED_LANGUAGES)` no arquivo (ou num `describe` novo do mesmo arquivo, com o mesmo `beforeAll` de `installPublicFetch`), que renderiza `findTarget(`${language}.html`)` e `findTarget(`${language}/about.html`)`, extrai o conteúdo do `<script type="application/ld+json">` de cada HTML e faz `JSON.parse` (o `<` escapado como `<` é JSON válido). Função auxiliar de leitura no próprio arquivo, sem `any` e sem cast: o resultado de `JSON.parse` é `unknown` lido com checagem, ou com o helper de `src/testUtils/parseUntyped.ts` se ele servir. Heading do idioma por `i18n.getFixedT(language, "home")("heading")`.
    - **Testes (escritos antes):** é um teste de caracterização, que passa na primeira execução porque a #134 já alinhou o conteúdo. Em vez do RED, a prova é uma **mutação temporária**: trocar à mão o `role` de `public/content/en/profile.json`, ver o teste de `en` falhar, e desfazer a troca antes do commit (a mutação nunca é commitada; `git diff public/` vazio no fim). Em `src/test/entry-server.content.test.tsx`:
        - CA8 (RF-HOME-26, RF-ABOUT-29): em cada idioma, o `jobTitle` da `Person` da Início (`["@graph"][1]`) é igual ao `mainEntity.jobTitle` de Informações e a `home:heading` do idioma.
        - CA8 (#199): esse `jobTitle` não casa com `/estagi|internship|\bintern\b|pasante|pasant[ií]a/i`.
        - CA8 (NF-IA-08): o `@id` da `Person` é o mesmo na Início e em Informações e igual a `buildPersonId()`.
        - CA8 (#199): `mainEntity.worksFor` de Informações contém `{ "@type": "Organization", name: <organization da experiência em curso do conteúdo do idioma> }` (ler a organização de `public/content/<idioma>/timeline.json` ou deixar o literal `"InCicle"`, que é o mesmo nos três idiomas).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/test/entry-server.content.test.tsx`
    - **Feito quando:** o gate passa, a mutação temporária fez o teste falhar (registrar na evidência a saída do vermelho e que foi desfeita) e existe o commit `Test :test_tube: [#199] Confere o mesmo cargo em Início e Informações nos três idiomas`, só com `src/test/entry-server.content.test.tsx`, com a linha final `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
    - **Evidência:** Caracterização: passou na primeira execução (6 testes no arquivo). Mutação temporária `role` de `public/content/en/profile.json` para "Full stack developer intern": só o caso `en` falhou com `AssertionError: expected 'Junior full stack developer' to be 'Full stack developer intern'`; desfeita com `git checkout -- public/content/en/profile.json` e `git diff --stat public/` vazio. Gate verde. Adequação: CA8 → `src/test/entry-server.content.test.tsx:189` `toBe(aboutPerson.jobTitle)`, `:190` `toBe(heading)`, `:191` `not.toMatch(/estagi|internship|\bintern\b|pasante|pasant[ií]a/i)`, `:194` `toBe(aboutPerson["@id"])`, `:195` `toBe(buildPersonId())`, `:196` `worksFor` `toContainEqual` com a `organization` da experiência em curso lida de `public/content/<idioma>/timeline.json`.

- [x] T8 — Conferência do que ficou de fora
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T7
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `grep -rn '#person' src e2e scripts` (CA9) e `grep -rn 'mailto' src/utils/build*JsonLd.ts` sem resultado
    - **Feito quando:** os dois greps estão como descrito e `git status` não mostra mudança fora dos arquivos das tarefas (em especial nada em `public/` nem em `src/locales/`).
    - **Evidência:** `grep -rn '#person' src e2e scripts` só mostra `src/utils/buildPersonId.ts:5` e testes com `SITE_URL + "/#person"`, `http://localhost:5173/#person` ou o literal de `buildPersonId.test.ts` (os únicos com idioma são as negações `entry-server.test.tsx:219` e `buildHomeJsonLd.test.ts:59`). `grep -rn 'mailto' src/utils/build*JsonLd.ts` sem resultado. `git status` sem nada em `public/` nem `src/locales/`.

- [x] T9 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada)
    - **Feito quando:** o gate passa; no `dist/` gerado, `pt-BR.html`, `en/about.html` e `es/contact.html` trazem o mesmo `"@id":"<origem>/#person"` e o JSON-LD de `es/contact.html` traz `"email"` sem `mailto:`.
    - **Evidência:** `VITE_SITE_URL=https://felipe-sant.vercel.app npm run build` verde (o build exige a variável). `dist/pt-BR.html`, `dist/en/about.html` e `dist/es/contact.html` com `"@id":"https://felipe-sant.vercel.app/#person"`; JSON-LD de `es/contact.html` com `"email":"contact.felipesant@gmail.com"`. `npm run test:cov` com os workers padrão: 2 falhas em `src/prerender/test/mountClient.test.tsx` (`findByRole` do heading da página lazy, timeout com a suíte em paralelo; falha igual na base sem esta mudança); `npm run test:cov -- --maxWorkers=2`: 325 arquivos, 2915 testes verdes, cobertura 98.84% linhas.
