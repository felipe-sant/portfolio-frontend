# Tasks: declara-vaga-junior-e-encurta-cartao-fatec

> Spec: `./spec.md`

Pré-condição: só executar depois do merge da #229 (#145) em `staging` e do rebase desta branch (ver "Pré-condição de execução, conflitos e ordem" na spec). Toda tarefa que toca `aboutParagraphs` ou `about.md`/`overview.md` começa reconferindo o texto depois do rebase. Estado vermelho nunca é commitado: cada tarefa muda código e os testes que ele quebra no mesmo commit. Gate por tarefa é leve; build e `test:cov` só na T10. As tarefas T4 a T6 valem para a opção (a) de Q2; com (b) ou (c) elas são trocadas. Nenhum comentário em código ou YAML.

## Plano de execução

```
T1 → T2 → T3
T4 → T5 → T6 (T4 pode andar em paralelo com T1 a T3: arquivos diferentes, exceto `buildContentSnapshot.ts`, só em T4)
T7 [P] e T8 [P] depois de T3 e T6
T9 (condicional, Q3)
T10 depois de todas
```

## Tarefas

- [ ] T1 — Cargo e linha de posicionamento no hero (texto de `home.json`, `Home.page.tsx`) com os testes que o `h1` quebra
    - **Arquivo(s):** `src/locales/{pt-BR,en,es}/home.json` (`heading`, `meta.description`, `hero.positioning` nova), `src/pages/Home.page.tsx` (um `<p className={css.positioning}>` entre o `h1` e `.intro`, texto de `t("home:hero.positioning")`), `src/styles/pages/home.module.css` (`.positioning`: `--text-body-lg`, `--text-strong`, `max-width: var(--measure)`, sem token novo), testes `src/pages/test/Home.page.test.tsx`, `src/test/App.test.tsx`, `src/routers/test/routes.test.tsx`, `src/test/entry-server.test.tsx`, `src/prerender/test/mountClient.test.tsx`, `src/pages/hooks/test/useHome.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: com o perfil falhando, o `h1` e a linha de posicionamento continuam na tela e o parágrafo do conteúdo some (RF-HOME-05, RF-HOME-27) em `Home.page.test.tsx`
        - `h1` "Desenvolvedor full stack Júnior" sem ponto em `pt-BR`, "Junior full stack developer" em `en` e "Desarrollador full stack junior" em `es`, trocando idioma com `setLanguage` dentro do `it` (CA1, RF-HOME-26) em `Home.page.test.tsx`
        - a linha "Procuro uma vaga Júnior com React, TypeScript e Node.js" (e as de `en` e `es`) vem logo depois do `h1` e antes do parágrafo do perfil (CA1, RF-HOME-27) em `Home.page.test.tsx`
        - `meta.description` nova nos três idiomas, `og:description` junto (CA3) em `Home.page.test.tsx`
        - o `jobTitle` do JSON-LD é exatamente "Desenvolvedor full stack Júnior" (igualdade, não `toContain`) em `useHome.test.tsx` e em `Home.page.test.tsx` (CA7)
        - os três `home.json` têm as mesmas chaves e `hero.positioning` (CA11) no teste de chaves existente de i18n ou em `Home.page.test.tsx`
        - `App.test.tsx`, `routes.test.tsx`, `entry-server.test.tsx` (o HTML pré-renderizado traz o `h1` e a linha nos três idiomas, CA2) e `mountClient.test.tsx` passam a afirmar os textos novos
        - `expectNoAxeViolations(container)` na Início (CA13) em `Home.page.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/pages/test/Home.page.test.tsx src/test/App.test.tsx src/routers/test/routes.test.tsx src/test/entry-server.test.tsx src/prerender/test/mountClient.test.tsx src/pages/hooks/test/useHome.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -rn "full stack em TypeScript" src` não retorna nada fora dos fixtures permitidos pela spec; aparência da linha só verificada à mão (T6)
    - **Evidência:** (preenchida pelo `executor`: tabela de adequação com `arquivo:linha` e veredito)

- [ ] T2 — Conteúdo: cargo Júnior no perfil e na trajetória, sem "estagiário", com teste de conteúdo
    - **Arquivo(s):** `public/content/{pt-BR,en,es}/profile.json` (`role`, `homeIntro` por Q6, `summary`; `aboutParagraphs`: reconferir depois do rebase e trocar só o que ainda disser estagiário), `public/content/{pt-BR,en,es}/timeline.json` (título e `details` da entrada atual; com a data da promoção da Q5, encerrar a entrada antiga com `end` e abrir outra com `id` novo de `npm run content:id`), `src/services/content/validation/translationExceptions.ts` (acrescentar "Híbrido" a `items[].details[]`, se Q4 mantiver o default), `src/services/content/test/content.test.ts`
    - **Depende de:** T1 e do rebase sobre a #229
    - **Testes (escritos antes, RED):**
        - borda: nenhum `profile.json` e `timeline.json` dos três idiomas contém "estagiário", "estágio", "intern", "internship", "pasante" ou "pasantía", caixa ignorada (CA8) em `content.test.ts`
        - `home:heading` (lido de `src/locales/<idioma>/home.json`), `profile.role` e o `title` da experiência atual são a mesma string nos três idiomas (CA7) em `content.test.ts`
        - a validação do conteúdo real continua sem problemas de tradução com os textos novos (CA8) em `content.test.ts`
        - o cartão "Trabalhando como" lê o cargo Júnior e a InCicle (`buildCurrentTimeline` sobre o conteúdo real, CA9) em `content.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/services/content/test/content.test.ts src/services/content/test/buildCurrentTimeline.test.ts src/services/content/validation/test/validateTranslation.test.ts src/utils/test/buildAboutJsonLd.test.ts`
    - **Feito quando:** o gate passa; os três idiomas têm o mesmo cargo que o `heading`; `grep -rniE "estagi|intern\b|internship|pasante" public/content` não retorna nada; o texto de `aboutParagraphs` foi reconferido depois do rebase e anotado na Evidência
    - **Evidência:** ...

- [ ] T3 — E2E: textos esperados, posicionamento, HTML sem JavaScript e pré-renderização
    - **Arquivo(s):** `e2e/support/uiTexts.ts` (`homeHeading`, `homeDescription` nos três idiomas e `homePositioning` novo), `e2e/language.spec.ts` (headings à mão), `e2e/home.spec.ts` (RF-HOME-26, RF-HOME-27 no título do teste), `e2e/no-javascript.spec.ts`, `e2e/about.spec.ts` (se afirmar o cargo; reconferir depois do rebase)
    - **Depende de:** T1, T2
    - **Testes (escritos antes, RED):**
        - borda: sem JavaScript, `/pt-BR`, `/en` e `/es` já trazem o `h1` e a linha de posicionamento no HTML (CA2, NF-CO-03) em `e2e/no-javascript.spec.ts`
        - com JavaScript, o `h1` e a linha nos três idiomas e `<title>`/descrição da Início (CA1, CA3, RF-HOME-26, RF-HOME-27) em `e2e/home.spec.ts` e `e2e/language.spec.ts`
        - o `jobTitle` do JSON-LD da Início é igual ao de Informações em cada idioma (CA7), lendo os dois `<script type="application/ld+json">`, em `e2e/home.spec.ts` ou `e2e/about.spec.ts`
        - `navigation.spec.ts`, `not-found.spec.ts` e `home-flows.spec.ts` seguem verdes só com a troca de `uiTexts.ts` (sem literal próprio)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/specClassification.test.ts` e, com `npm run build:fatec` já feito, `npx playwright test e2e/home.spec.ts e2e/language.spec.ts e2e/no-javascript.spec.ts --project=desktop-light`
    - **Feito quando:** o gate passa; nenhum spec novo fora de `specClassification.ts`; o ID do requisito está no título de cada teste novo; E2E espera por estado, nunca por tempo
    - **Evidência:** ...

- [ ] T4 — Contrato: campo opcional `cardTitle` na trajetória (Q2, opção a)
    - **Arquivo(s):** `src/types/timeline/TimelineItem.types.ts`, o tipo do registro de conteúdo correspondente em `src/types/`, `src/services/content/toTimelineItem.ts`, `src/services/content/validation/validateTimeline.ts` (chave aceita; só em `education` e `course`; texto não vazio), `src/services/content/validation/translatablePaths.ts` (`items[].cardTitle`), `src/services/content/template/createBlankTimelineItem.ts`, `src/testUtils/buildContentSnapshot.ts`, `src/testUtils/buildTimeline.ts`, testes ao lado (`validateTimeline.test.ts`, `buildContentTemplate.test.ts`, `toTimelineItem` e `buildTimeline.test.ts`)
    - **Depende de:** nenhuma (arquivos distintos de T1 a T3; `buildContentSnapshot.ts` só aqui, por causa da #143)
    - **Testes (escritos antes, RED):**
        - borda: `cardTitle` vazio ou em item `experience` é problema de validação (CA10) em `validateTimeline.test.ts`
        - `cardTitle` ausente é válido e o item sai sem o campo (borda do caso sem `cardTitle`) em `buildTimeline.test.ts`
        - `cardTitle` presente chega ao `TimelineItem` de `GET /timeline?current=true` (RF-HOME-28) em `buildCurrentTimeline.test.ts`
        - `cardTitle` igual ao de pt-BR sem tradução é acusado, salvo exceção (R2) em `validateTranslation.test.ts`
        - o gabarito de conteúdo em branco continua válido e traz o campo onde cabe em `buildContentTemplate.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/services/content/validation/test/validateTimeline.test.ts src/services/content/validation/test/validateTranslation.test.ts src/services/content/test/buildContentTemplate.test.ts src/services/content/test/buildTimeline.test.ts src/services/content/test/buildCurrentTimeline.test.ts`
    - **Feito quando:** o gate passa e o campo é opcional em todo o caminho (tipo, validação, template, mapeamento)
    - **Evidência:** ...

- [ ] T5 — Conteúdo: `cardTitle` do item `education` em curso nos três idiomas
    - **Arquivo(s):** `public/content/{pt-BR,en,es}/timeline.json`, `src/services/content/validation/translationExceptions.ts` (exceção `items[].cardTitle`: "Fatec Jacareí · Multiplataforma", igual em `pt-BR` e `es`)
    - **Depende de:** T2, T4
    - **Testes (escritos antes, RED):**
        - borda: o item `education` em curso tem `cardTitle` nos três idiomas e o conteúdo real valida sem problema de tradução (CA5, CA10) em `src/services/content/test/content.test.ts`
        - o `cardTitle` tem menos de 40 caracteres em cada idioma (proteção do "uma linha", CA5) em `content.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/services/content/test/content.test.ts src/services/content/validation/test/validateTranslation.test.ts`
    - **Feito quando:** o gate passa e os valores batem com a spec ("Fatec Jacareí · Multiplataforma", "Fatec Jacareí · Multiplatform", "Fatec Jacareí · Multiplataforma")
    - **Evidência:** ...

- [ ] T6 — Cartões de status compactos abaixo de 640px (`StatusCard`, `Home.page.tsx`, CSS) e E2E por largura
    - **Arquivo(s):** `src/components/StatusCard.tsx` (prop opcional `compactTitle`; dois `<span>` com o destaque completo e o compacto; sem `compactTitle`, só o completo), `src/styles/components/statusCard.module.css` (`@media (max-width: 639px)`: padding `--space-4`, destaque `--text-body-md`, mostra o compacto e esconde o completo; a partir de 640px o contrário), `src/pages/Home.page.tsx` (passa `status.studying.cardTitle`), `src/components/test/StatusCard.test.tsx`, `src/pages/test/Home.page.test.tsx`, `e2e/home.spec.ts` (por largura; classificação já em `perEnvironmentSpecs`), `docs/architecture/components.md` (nota de `StatusCard`)
    - **Depende de:** T1, T4, T5
    - **Testes (escritos antes, RED):**
        - borda: sem `compactTitle`, o cartão mostra só o destaque completo e nenhum span extra (RF-HOME-28) em `StatusCard.test.tsx`
        - com `compactTitle`, o destaque completo e o compacto estão no DOM, o separador continua `aria-hidden` e o axe não acusa nada (CA10, CA13) em `StatusCard.test.tsx`
        - a Início passa o `cardTitle` do item `education` ao cartão "Cursando" e o texto "Fatec Jacareí · Multiplataforma" aparece (RF-HOME-28) em `Home.page.test.tsx`
        - E2E (RF-HOME-28, NF-RE-03): a 375 e 390px (`setViewportSize`, pulando nos projetos desktop), em `pt-BR`, `en` e `es`, o destaque visível de cada cartão tem altura ≤ 1,5 × `line-height` calculado, a página não rola na horizontal e o cartão "Cursando" tem altura ≤ o teto medido (ponto de partida 8rem) (CA5) em `e2e/home.spec.ts`
        - E2E (RF-HOME-28): a 640px o destaque visível do cartão "Cursando" é o texto completo (CA6) em `e2e/home.spec.ts`
        - E2E (CA6): a 375 e 390px o topo do `h2` "Projetos em destaque" fica em posição ≤ à linha de base medida em `staging`, anotada na Evidência (com a linha nova do hero), em `e2e/home.spec.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/components/test/StatusCard.test.tsx src/pages/test/Home.page.test.tsx` e, com `build:fatec` feito, `npx playwright test e2e/home.spec.ts --project=mobile-light`
    - **Feito quando:** o gate passa; a Evidência traz a posição do `h2` e a altura do cartão antes e depois, a 375 e 390px; verificação manual (aparência, tela Início, 375/390/640/1280px, três idiomas, dois temas) anotada com captura; o desktop não mudou
    - **Evidência:** ...

- [ ] T7 [P] — README (resumo e capturas) e `index.html`
    - **Arquivo(s):** `README.md` (linha 3: "Personal portfolio of Luiz Felipe dos Santos, a Junior full stack developer working with React, TypeScript and Node.js."), `index.html` (`<title>` "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior" e `<meta name="description">` igual a `home.meta.description` de `pt-BR`), `docs/design/assets/readme/home-light.png` e `home-dark.png` (`npm run readme:images`, até 300 KB cada; exige `build:fatec` e `preview:fatec`), `scripts/test/readme.test.ts` (afirma o resumo, CA4), um teste que compare `index.html` com `src/locales/pt-BR/home.json` (descrição e `<title>`, CA3) ao lado dos testes de `index.html` já existentes
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - borda: a descrição e o `<title>` de `index.html` batem com os de `pt-BR` (CA3) em `scripts/test/prepareFatecArtifact.test.ts` ou no teste novo
        - o resumo do README em inglês diz "Junior full stack developer", React, TypeScript e Node.js, e as regras de `readme.test.ts` (ordem, até 100 linhas, capturas) seguem verdes (CA4)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/readme.test.ts scripts/test/readmeScreenshotPath.test.ts scripts/test/prepareFatecArtifact.test.ts`
    - **Feito quando:** o gate passa; as capturas mostram o título novo e os cartões compactos (se a máquina não aguentar regerar, anotar a pendência na Evidência)
    - **Evidência:** ...

- [ ] T8 [P] — Documentação viva: requisitos, textos, JSON-LD, decisão e contrato
    - **Arquivo(s):** `docs/screens/home.md` (riscar `RF-HOME-04` e `A11Y-IN01`; acrescentar `RF-HOME-26`, `RF-HOME-27`, `RF-HOME-28`; linhas 37, 85, 147, 197, 198, 353 e 397; tabela de chaves com `hero.positioning`; JSON-LD com `jobTitle` `home:heading`; tabela de divergências), `docs/product/accessibility.md` (linha 300 e novo ID de acessibilidade, o próximo livre depois de `A11Y-IN07`), `docs/design/design-system.md:223`, `docs/screens/layout.md:301`, `docs/product/overview.md` (linha 3; reconferir depois do rebase da #229), `docs/screens/about.md` (só se citar o cargo; reconferir depois do rebase), `docs/architecture/data-model.md` e `docs/architecture/api-contract.md` (`cardTitle`, Q2), `docs/product/glossary.md` (Status atual, se citar o cartão), `docs/design/decisions.md` (nova linha "PO (spec)": ID = próximo livre depois do rebase, esperado D70, nunca D69; linhas D70+ só se a Q7 mantiver o default)
    - **Depende de:** T3, T6 (os IDs e textos já existem no código)
    - **Testes (escritos antes, RED):** não se aplica (documentação)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/contributingTypesTable.test.ts`
    - **Feito quando:** CA12 vale por leitura e por `grep` (`grep -rn "full stack em TypeScript" docs --include=*.md` só retorna `adr/0004` e o protótipo); o ID da decisão foi reconferido contra `origin/staging` e contra a #143; nenhum ID reaproveitado
    - **Evidência:** ...

- [ ] T9 — CONDICIONAL (Q3): cargo nos CV e PDFs regerados
    - **Arquivo(s):** `public/cv/cv-{pt-BR,en,es}.md` (linha 14: cargo e período), `public/cv/cv-{pt-BR,en,es}.pdf` (`npm run cv:pdf`, Chromium, no mesmo commit)
    - **Depende de:** resposta do PO em Q3 e Q5 (data); T2
    - **Testes (escritos antes, RED):** `scripts/test/resumePdfsUpToDate.test.ts` fica verde com os PDFs regerados (não se aplica teste novo)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/resumePdfsUpToDate.test.ts scripts/test/readResumeMarkdown.test.ts`
    - **Feito quando:** o gate passa e os três PDFs e `.md` dizem o cargo novo; se o PO mantiver o default (fora), a tarefa é riscada com a nota "fora desta PR, Q3" e a pendência vai para o relatório
    - **Evidência:** ...

- [ ] T10 — Verificação completa e changeset
    - **Arquivo(s):** `.changeset/*.md` (um arquivo, `"portfolio-frontend": patch`, texto sem jargão: "Declara na Início a vaga Júnior com React, TypeScript e Node.js, troca o cargo de estagiário para desenvolvedor full stack Júnior no site e encurta o cartão da Fatec no celular, para os projetos em destaque aparecerem mais cedo.")
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada) e, com `npm run build:fatec` feito, os E2E de Início e Informações: `npx playwright test e2e/home.spec.ts e2e/home-flows.spec.ts e2e/about.spec.ts e2e/language.spec.ts e2e/navigation.spec.ts e2e/no-javascript.spec.ts e2e/accessibility.spec.ts`; se o `test:cov` estourar por carga da máquina, rodar os arquivos isolados e anotar
    - **Feito quando:** o gate passa; CA1 a CA14 conferidos (os `grep` de CA8 e CA12 anotados); o changeset está commitado e a pré-condição (#229 mergeada e rebase feito) foi cumprida
    - **Evidência:** ...
