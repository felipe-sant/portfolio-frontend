# Tasks: 202-lastmod-e-licencas-fora-do-sitemap

> Spec: `./spec.md`

Trabalho só no worktree `/home/felipe/faculdade/portfolio/wt-202`. Estado vermelho nunca é commitado: cada tarefa é um commit com código, testes e docs dela. O gate por tarefa é leve (`typecheck`, `lint` e os testes dos arquivos alterados, sempre com `--maxWorkers=2`, conferindo `uptime` antes). **`npm run build` e o E2E não rodam localmente**: rodam no CI do PR. Nenhum comentário em código, teste ou exemplo. Texto de UI só por chave, nos três idiomas (`pt-BR` primeiro). Commits no formato `<Tipo> <ícone> [#202|#207] <descrição>`.

## Plano de execução

```
Fase 1 (T1 [P], T2 [P], T3 [P])  →  T4  →  T5  →  Fase 3 (T6 [P], T7 [P], T8 [P])  →  T9  →  T10  →  T11
```

T1, T2 e T3 criam funções puras novas, em arquivos distintos. T4 mexe no modelo de dados e T5 no conteúdo. T6 (sitemap), T7 (Informações) e T8 (Projeto) editam arquivos distintos e só dependem do que vem antes; os docs (T9) e o E2E (T10) editam arquivos compartilhados e seguem em sequência.

## Tarefas

- [ ] T1 [P] — #202: `formatMonthYear` (`AAAA-MM-DD` para `MM/AAAA`, por texto)
    - **Arquivo(s):** `src/utils/formatMonthYear.ts` (novo, `export default`), `src/utils/test/formatMonthYear.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: valor que não é `AAAA-MM-DD` válido (`""`, `"2026-13-01"`, `"2026-7-1"`, `"hoje"`) devolve `undefined` (CA5, CA6), em `src/utils/test/formatMonthYear.test.ts`
        - `"2026-07-19"` devolve `"07/2026"`; `"2026-01-01"` devolve `"01/2026"` (CA5), em `formatMonthYear.test.ts`
        - não depende do fuso: com `vi.stubEnv("TZ", "America/Sao_Paulo")` e `"2026-01-01"`, devolve `"01/2026"` (CA5), em `formatMonthYear.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/formatMonthYear.test.ts`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -n "new Date\|toLocale" src/utils/formatMonthYear.ts` não retorna nada
    - **Evidência:** (preenchida pelo `executor`: tabela de adequação com `arquivo:linha` e veredito)

- [ ] T2 [P] — #207: `isLicenseDocument` (regra única de `LICENSE`)
    - **Arquivo(s):** `src/utils/isLicenseDocument.ts` (novo, `export default`), `src/utils/test/isLicenseDocument.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: `"LICENSES"`, `"NOTICE"`, `"README.md"`, `"SETUP.md"`, `"MYLICENSE.md"` e `""` devolvem `false` (CA8, CA10), em `src/utils/test/isLicenseDocument.test.ts`
        - `"LICENSE"`, `"license"`, `"License.md"` e `"LICENSE.txt"` devolvem `true`, sem diferenciar maiúsculas e sem extensão (CA8), em `isLicenseDocument.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/isLicenseDocument.test.ts`
    - **Feito quando:** o gate passa e cada teste listado tem asserção
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T3 [P] — #207: `buildDocumentDescription` (descrição própria derivada do documento)
    - **Arquivo(s):** `src/utils/buildDocumentDescription.ts` (novo, `export default`; assinatura `buildDocumentDescription(content: string | undefined, format: "markdown" | "text"): string | undefined`, limite 155 caracteres em constante, só texto puro: sem importar `parseMarkdown`, remark nem `@/services/`), `src/utils/test/buildDocumentDescription.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: `undefined`, `""`, só espaços, só títulos, só bloco de código, só tabela, só HTML e só emblemas/imagens devolvem `undefined` (CA12), em `src/utils/test/buildDocumentDescription.test.ts`
        - markdown: pula `# título`, linhas de emblema `[![...](...)](...)`, imagens e bloco de código até o primeiro parágrafo com texto, e devolve esse parágrafo em uma linha só (CA11)
        - remove marcação: `[texto](url)` vira `texto`, `**negrito**`, `*itálico*` e `` `código` `` ficam só com o texto (CA11)
        - texto de mais de 155 caracteres corta no último espaço antes do limite, termina em `…`, sem espaço nem pontuação solta antes dele, e o resultado tem no máximo 155 caracteres (CA11)
        - `format: "text"` usa o primeiro bloco de linhas não vazias, sem tratar `#` como título (CA11)
        - com os `SETUP.md` e `ARCHITECTURE.md` reais de `public/content/pt-BR/projects/*/docs`, lidos com `node:fs` em `// @vitest-environment node`, as 6 descrições são diferentes entre si e nenhuma é igual a `project.summary` de `public/content/pt-BR/projects.json` (CA13)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/buildDocumentDescription.test.ts`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -n "remark\|parseMarkdown\|services/" src/utils/buildDocumentDescription.ts` não retorna nada
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T4 — #202: `updatedAt` no perfil (tipo, validação, modelo em branco, docs do contrato)
    - **Arquivo(s):** `src/types/profile/Profile.types.ts` (`updatedAt: string`), `src/services/content/validation/validateProfile.ts` (chave obrigatória em `REQUIRED_KEYS`), `src/services/content/validation/validateDates.ts` (`checkDay` sobre `profile.updatedAt` de cada idioma), `src/services/content/validation/validateProjects.ts` e `validateDocuments.ts` (ou `validateDates.ts`, onde ficar mais simples: `updatedAt` obrigatório em todo projeto e em todo documento que não é `README.md`, com `isLicenseDocument` não usado aqui), `src/services/content/validation/translatablePaths.ts` (confirmar que `updatedAt` não é traduzível e que a paridade exige o mesmo valor nos três idiomas; sem mudança se já for o caso), `src/services/content/template/createBlankProfile.ts` (`updatedAt: ""`), `src/testUtils/buildContentSnapshot.ts` (perfil com `updatedAt`), testes em `src/services/content/validation/test/` e `src/services/content/test/buildContentTemplate.test.ts`, `docs/architecture/data-model.md` (campo `Profile.updatedAt`: `AAAA-MM-DD`, curado, "atualize ao mudar `profile.json` ou `timeline.json`", `dateModified` do `ProfilePage` e `lastmod` das páginas fixas) e `docs/architecture/api-contract.md` (resposta de `GET /profile`)
    - **Depende de:** nenhuma (T1 a T3 independentes)
    - **Testes (escritos antes, RED):**
        - borda: `profile.json` sem `updatedAt` falha com mensagem em português que cita `content/<idioma>/profile.json#` e `updatedAt` (CA4), em `src/services/content/validation/test/validateProfile.test.ts`
        - `profile.updatedAt` fora de `AAAA-MM-DD` (`"2026-02-30"`, `"07/2026"`) falha com "Data fora do formato AAAA-MM-DD" (CA4), em `src/services/content/validation/test/validateDates.test.ts`
        - projeto sem `updatedAt` e documento que não é `README.md` sem `updatedAt` falham; `README.md` sem `updatedAt` passa (CA4), em `validateDates.test.ts` (ou no teste do validador de documentos, conforme onde a regra ficar)
        - perfis com `updatedAt` diferente entre idiomas falham na paridade (CA4), em `src/services/content/validation/test/validateLanguageParity.test.ts`
        - `createBlankProfile` traz `updatedAt` vazio e o modelo gerado continua válido para o gerador, sem alterar os demais campos, em `src/services/content/test/buildContentTemplate.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/services/content/validation/test src/services/content/test/buildContentTemplate.test.ts` (o `typecheck` acusa todo fixture de `Profile` que faltar; ajustar na mesma tarefa)
    - **Feito quando:** o gate passa; cada teste listado tem asserção; `npm run content:check` ainda falha só por falta de dado (resolvido na T5), com a mensagem de CA4
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T5 — #202: dados reais de `updatedAt` (3 `profile.json` e 3 `projects.json`)
    - **Arquivo(s):** `public/content/{pt-BR,en,es}/profile.json` (`updatedAt`), `public/content/{pt-BR,en,es}/projects.json` (`updatedAt` dos projetos `01a131df-93ee-72f3-8c7a-f67501e47a7a` e `01a131fc-d24c-7c70-887b-0d055f57d251` e dos documentos `ARCHITECTURE.md` e `SETUP.md` de `01a131df-...`, `SETUP.md` de `01a13216-9960-7a66-8288-462bf96ec9a5` e `ARCHITECTURE.md` e `SETUP.md` de `01a1323d-b9bc-73c0-8bac-2e93e30ee193`)
    - **Depende de:** T4
    - **Testes (escritos antes, RED):** a prova é o teste de conteúdo que já existe: `npm run content:check` (`src/services/content/test/content.test.ts`) está vermelho desde a T4 e fica verde aqui (CA4). Sem teste novo.
    - **Gate:** `npm run typecheck && npm run lint && npm run content:check -- --maxWorkers=2`
    - **Feito quando:** o gate passa; o valor de cada `updatedAt` é o mesmo nos três idiomas; os valores seguem a Questão 1 e a Questão 2 da spec (se o Felipe não tiver respondido: `git log -1 --format=%cs -- <arquivo>` do documento, do `projects.json` e de `profile.json`/`timeline.json`, registrado na Evidência com o comando e a saída de cada um, para o Felipe confirmar na revisão); nenhum outro campo dos JSON muda (`git diff --stat` só em `public/content/*/{profile,projects}.json`)
    - **Evidência:** (preenchida pelo `executor`: tabela arquivo, campo, valor, comando de origem)

- [ ] T6 [P] — #202 e #207: `lastmod` completo e `LICENSE` fora do `listSitemapEntries`
    - **Arquivo(s):** `scripts/seo/listSitemapEntries.ts` (assinatura igual; `findLastmod` com o mapa da spec: Informações e Contato `profile.updatedAt`, Projetos o maior `updatedAt` de projeto, Início o maior entre os dois, projeto e documento como hoje; filtrar os alvos de documento com `isLicenseDocument(params.name)` antes de `groupPaths`), `scripts/test/listSitemapEntries.test.ts` (fórmula nova e testes com fixture pequena de `SeoContent`, sem depender do dado real), `scripts/test/buildSitemapXml.test.ts` (só se faltar caso de `lastmod` em página fixa), `scripts/seo/buildLlmsFullTxt.ts` (só conferir que o texto completo já omite a `LICENSE` e, se omitir por outra regra que não `isLicenseDocument`, trocá-la pela regra única; sem mudança de comportamento)
    - **Depende de:** T2, T4, T5
    - **Testes (escritos antes, RED):**
        - borda: com fixture em que um projeto não tem `updatedAt`, a entrada do projeto fica sem `lastmod` (o gerador não inventa) e a validação do conteúdo é quem garante o dado (CA3), em `scripts/test/listSitemapEntries.test.ts`
        - borda: com `vi.useFakeTimers()` e `vi.setSystemTime` em data diferente de todos os `updatedAt`, nenhum `lastmod` é a data fixada (CA3), em `listSitemapEntries.test.ts`
        - fixture com 2 projetos, `LICENSE`, `SETUP.md` e `README.md`: o sitemap não tem URL de `LICENSE` em nenhum idioma, mantém `SETUP.md` e cada entrada mantém os 3 alternates completos (CA8, CA10), em `listSitemapEntries.test.ts`
        - fixture: Informações e Contato com `profile.updatedAt`; Projetos com o maior `updatedAt` entre os projetos; Início com o maior entre os dois, em cada idioma (CA2), em `listSitemapEntries.test.ts`
        - dado real: `entries` tem `(4 + projetos + documentos que não são README nem LICENSE) x 3` entradas, igual a 48, nenhuma de `LICENSE`, todas com `lastmod` no formato `AAAA-MM-DD` (CA1, CA8), em `listSitemapEntries.test.ts`. Substitui a fórmula antiga "4 + projetos + documentos além do README"; a Evidência registra a troca
        - o teste que liga cada entrada às três versões de idioma e o de "404 e raiz" seguem verdes sem mudança (CA8), em `listSitemapEntries.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/listSitemapEntries.test.ts scripts/test/buildSitemapXml.test.ts scripts/test/buildLlmsFullTxt.test.ts scripts/test/writeSeoFiles.test.ts`
    - **Feito quando:** o gate passa; cada teste listado tem asserção; `git diff --stat` não lista `scripts/seo/writeSeoFiles.ts` nem `buildSitemapXml.ts` sem motivo registrado. Commits `Feat :sparkles: [#202] Preenche o lastmod de todas as URLs do sitemap` e `Fix :bug: [#207] Tira as páginas de LICENSE do sitemap`
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T7 [P] — #202: "Atualizado em" em Informações e `dateModified` no `ProfilePage`
    - **Arquivo(s):** `src/utils/buildAboutJsonLd.ts` (`dateModified: profile?.updatedAt` no nó `ProfilePage`, omitido sem perfil), `src/pages/hooks/useAbout.ts` (expõe `updatedLabel`: `formatMonthYear(profile.updatedAt)` quando houver perfil; sem lógica no JSX), `src/pages/About.page.tsx` (parágrafo com `t("about:updatedAt", { date })` só quando `updatedLabel` existe), `src/styles/pages/about.module.css` (classe nova, `--text-muted`, só tokens de `global.css`), `src/locales/pt-BR/about.json`, `src/locales/en/about.json`, `src/locales/es/about.json` (chave `updatedAt`: pt-BR "Atualizado em {{date}}", en "Updated {{date}}", es "Actualizado en {{date}}"), `src/utils/test/buildAboutJsonLd.test.ts`, `src/pages/test/About.page.test.tsx`
    - **Depende de:** T1, T4, T5
    - **Testes (escritos antes, RED):**
        - borda: com a query do perfil em carregamento ou com erro, a página não mostra "Atualizado" e o JSON-LD não tem `dateModified` (CA6, CA7), em `About.page.test.tsx` e `buildAboutJsonLd.test.ts`
        - com o perfil carregado (`renderWithStore`, resposta mockada com `updatedAt: "2026-07-19"`), `/pt-BR/about` mostra "Atualizado em 07/2026" (CA5), em `About.page.test.tsx`
        - `/en/about` mostra "Updated 07/2026" e `/es/about` "Actualizado en 07/2026", com `setLanguage` dentro do `it` (CA5), em `About.page.test.tsx`
        - o JSON-LD `ProfilePage` do `<script>` da página tem `dateModified` igual a `"2026-07-19"` (CA7), em `About.page.test.tsx` e `buildAboutJsonLd.test.ts`
        - `expectNoAxeViolations(container)` com a linha visível (acessibilidade), em `About.page.test.tsx`
        - as três `about.json` têm a chave `updatedAt` com `{{date}}`, sem chave sobrando, no teste de paridade de locales que já existe (R2), em `src/i18n/test` (arquivo existente; conferir qual)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/buildAboutJsonLd.test.ts src/pages/test/About.page.test.tsx src/i18n/test`
    - **Feito quando:** o gate passa; cada teste listado tem asserção. **Verificação manual (aparência, fora do TDD):** `npm run dev -- --port <porta> --strictPort`, em `/pt-BR/about`, `/en/about` e `/es/about`, nos temas claro e escuro: a linha aparece discreta abaixo do resumo do hero, sem quebrar o layout em 320 px, e some quando a rede do perfil falha (Questão 3). Commit `Feat :sparkles: [#202] Mostra a data de atualização em Informações`
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T8 [P] — #207: `noindex` na `LICENSE` e descrição própria por documento na página do projeto
    - **Arquivo(s):** `src/pages/Project.page.tsx` (em `ProjectDetailView`: `isLicense = documentEntry !== undefined && isLicenseDocument(documentEntry.name)`; `<meta name="robots" content={"noindex"} />` quando `isLicense`; `description` único passado a `<meta name="description">` e a `PageMeta`: `project.summary` para o README, `buildDocumentDescription(document.content, document.format) ?? t("project:meta.documentDescription", { document: document.exactName, project: project.title })` para os outros), `src/locales/pt-BR/project.json`, `src/locales/en/project.json`, `src/locales/es/project.json` (chave `meta.documentDescription` com `{{document}}` e `{{project}}`; pt-BR "Documento {{document}} do projeto {{project}}.", en "{{document}} document of the {{project}} project.", es "Documento {{document}} del proyecto {{project}}."), `src/pages/test/Project.page.test.tsx`
    - **Depende de:** T2, T3
    - **Testes (escritos antes, RED):**
        - borda: documento com conteúdo ainda carregando, com erro ou sem parágrafo útil usa a descrição traduzida de `meta.documentDescription`, nunca `project.summary` nem vazia (CA12), em `src/pages/test/Project.page.test.tsx`
        - `/pt-BR/projects/<id>/docs/LICENSE` tem `meta[name="robots"][content="noindex"]`; `SETUP.md` e o README não têm (CA9, CA10), em `Project.page.test.tsx`
        - em `SETUP.md` com conteúdo carregado, `meta[name="description"]` é a saída de `buildDocumentDescription` do conteúdo (afirmada pelo texto em português esperado, não por reimportar a função) e é a mesma de `og:description` e `twitter:description` do `PageMeta` (CA11), em `Project.page.test.tsx`
        - o README continua com `project.summary` na descrição (CA11), em `Project.page.test.tsx`
        - em `/en/` e `/es/`, o fallback sai no idioma (CA12), com `setLanguage` dentro do `it`, em `Project.page.test.tsx`
        - os três `project.json` têm `meta.documentDescription` (R2), no teste de paridade de locales existente
        - `expectNoAxeViolations(container)` já presente no teste de página segue verde (acessibilidade), em `Project.page.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/test/Project.page.test.tsx src/i18n/test`
    - **Feito quando:** o gate passa; cada teste listado tem asserção; `grep -n "isLicenseDocument" src/pages/Project.page.tsx scripts/seo/listSitemapEntries.ts` mostra a mesma função nos dois (CA15); `git diff` não muda `isDocumentPage` nem a regra do README. **Verificação manual:** em `/pt-BR/projects/<id>/docs/SETUP.md` e `/docs/LICENSE`, ver no DevTools o `<head>` (descrição própria e `noindex`) e que a página continua igual. Commit `Fix :bug: [#207] Dá descrição própria às páginas de documentação e marca a LICENSE como noindex`
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T9 — #202 e #207: docs e decisão
    - **Arquivo(s):** `docs/product/non-functional-requirements.md` (NF-IA-15: fórmula `(4 + projetos + documentos que não são README nem LICENSE) x 3`, `lastmod` em toda URL e vindo só do conteúdo; NF-IA-02: a `LICENSE` fica fora do sitemap e com `noindex`), `docs/architecture/frontend.md` (linha do `sitemap.xml` no parágrafo de `npm run build:seo`: `<lastmod>` em toda `<url>`, fonte e mapa das páginas fixas, `LICENSE` fora; e a nota de metadados de página: descrição própria do documento e `noindex` na `LICENSE`), `docs/screens/about.md` (`RF-ABOUT-31`: data "Atualizado em MM/AAAA" e `dateModified`), `docs/screens/project.md` (`RF-PROJECT-40`: descrição própria por documento e `noindex` na `LICENSE`), `docs/design/decisions.md` (decisão nova no próximo ID livre depois de `D72`, conferido na `origin/staging` atualizada com `grep -oE "^\| D[0-9]+" docs/design/decisions.md`, número confirmado pelo Orc: "LICENSE fora do sitemap e descrição própria nos documentos", Opções "manter tudo indexado", "tirar toda a documentação" e "tirar só a LICENSE", Decisão a terceira, com a justificativa da spec, Fonte `PO`, Data `11-11-2026`, Status `decidida`, Onde aplicar `scripts/seo/listSitemapEntries.ts` e `src/pages/Project.page.tsx`, Issues `#202 e #207`)
    - **Depende de:** T6, T7, T8
    - **Testes (escritos antes, RED):** não se aplica (documentação; `scripts/test/contributingTypesTable.test.ts` e os testes de docs existentes seguem verdes)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test`
    - **Feito quando:** o gate passa; `grep -n "sem \`lastmod\` inventado\|só quando o projeto ou o documento tem" docs/product/non-functional-requirements.md docs/architecture/frontend.md`não retorna a redação antiga; o ID da decisão nova aparece uma vez em`decisions.md`e é o citado nos docs. Commit`Docs :bulb: [#207] Registra a decisão sobre LICENSE e o novo lastmod do sitemap`
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T10 — #202 e #207: E2E atualizados (rodam só no CI)
    - **Arquivo(s):** `e2e/machine-files.spec.ts` (`countDocumentsBesidesReadme` passa a não contar `LICENSE`, com a mesma regra de `isLicenseDocument`; teste novo "NF-IA-15: nenhuma loc é de LICENSE e toda url tem lastmod AAAA-MM-DD"; a lista de 6 documentos esperados por idioma), `e2e/about.spec.ts` (teste novo "RF-ABOUT-31: Informações mostra Atualizado em MM/AAAA nos três idiomas, com a data lida de `public/content/<idioma>/profile.json` por `e2e/support/`" e JSON-LD com `dateModified`), `e2e/no-javascript.spec.ts` (HTML sem JavaScript: `/docs/LICENSE` com `noindex` e `/docs/SETUP.md` sem; descrição de `SETUP.md` diferente da de `ARCHITECTURE.md` e do `project.summary`), `e2e/support/` (helper que lê `updatedAt`, se faltar). Nenhum spec novo: só os existentes, então `specClassification.ts` e `routesUnderTest.ts` não mudam
    - **Depende de:** T6, T7, T8
    - **Testes (escritos antes, RED):** os E2E acima, cada um com o ID do requisito no título (CA1, CA5, CA7, CA8, CA9, CA10, CA11, CA14); a prova de RED é o CI do PR rodando sobre o código das T6 a T8 (não rodam localmente)
    - **Gate:** `npm run typecheck && npm run lint` (sem `playwright` local)
    - **Feito quando:** typecheck e lint passam; `git diff --stat origin/staging -- e2e/support/specClassification.ts e2e/support/routesUnderTest.ts` vazio; o CI do PR roda os três specs e passa (conferido na T11). O E2E que afirma `LICENSE` por conteúdo e navegação (`project-documents.spec.ts`, `no-javascript.spec.ts:116`, `project.spec.ts:598`) segue sem mudança, porque a página continua existindo
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T11 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1 a T10
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run test:cov -- --maxWorkers=2` (única rodada pesada local; conferir `uptime` antes e, se o load passar de 14, esperar ou avisar o Orc) e, depois do push liberado pelo Orc e do PR aberto, `gh pr checks <número>`. **Não** rodar `npm run build` nem Playwright localmente: o CI do PR roda o build, a pré-renderização, os arquivos de SEO e o E2E
    - **Feito quando:** `test:cov` passa; todos os checks do PR estão verdes (inclusive os E2E de `machine-files`, `about` e `no-javascript`); CA1 a CA15 conferidos e anotados; no `sitemap.xml` do preview do PR: 48 `<loc>`, 48 `<lastmod>`, nenhuma `LICENSE`; `.claude/CLAUDE.md` conferido (sem mudança esperada); o PO fez a verificação manual de Informações e de `/docs/LICENSE` (T7, T8)
    - **Evidência:** (preenchida pelo `executor`: saída resumida do `test:cov`, lista de checks do PR)
