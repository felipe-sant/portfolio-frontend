# Tasks: declara-vaga-junior-e-encurta-cartao-fatec

> Spec: `./spec.md`

A #229 (#145) já está mergeada e a branch rebaseada; cada tarefa que toca `aboutParagraphs` ou `about.md`/`overview.md` reconfere o texto atual antes de editar. Estado vermelho nunca é commitado: cada tarefa muda código e os testes que ele quebra no mesmo commit. Gate por tarefa é leve; build e `test:cov` só na T8. Nenhum comentário em código ou YAML.

## Plano de execução

```
T1 → T2 → T3 → T4
T5 [P] e T6 [P] e T7 [P] depois de T3 (T6 também depois de T4)
T8 depois de todas
```

T5 (README e `index.html`), T6 (docs) e T7 (CV e PDFs) editam arquivos diferentes e são independentes entre si.

## Tarefas

- [x] T1 — Cargo e linha da stack no hero (`home.json`, `Home.page.tsx`) com os testes que o `h1` quebra
    - **Arquivo(s):** `src/locales/{pt-BR,en,es}/home.json` (`heading`, `meta.description`, `hero.stack` nova), `src/pages/Home.page.tsx` (`<p className={css.stack}>` entre o `h1` e `.intro`, texto de `t("home:hero.stack")`), `src/styles/pages/home.module.css` (`.stack`: `--text-body-lg`, `--text-strong`, `max-width: var(--measure)`, sem token novo), testes `src/pages/test/Home.page.test.tsx`, `src/test/App.test.tsx`, `src/routers/test/routes.test.tsx`, `src/test/entry-server.test.tsx`, `src/prerender/test/mountClient.test.tsx`, `src/pages/hooks/test/useHome.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: com o perfil falhando, o `h1` e a linha da stack continuam na tela e o parágrafo do conteúdo some (RF-HOME-05, RF-HOME-27) em `Home.page.test.tsx`
        - `h1` "Desenvolvedor full stack Júnior" sem ponto em `pt-BR`, "Junior full stack developer" em `en` e "Desarrollador full stack junior" em `es`, trocando idioma com `setLanguage` dentro do `it` (CA1, RF-HOME-26) em `Home.page.test.tsx`
        - a linha "React, TypeScript e Node.js" (e as de `en` e `es`) vem logo depois do `h1` e antes do parágrafo do perfil (CA1, RF-HOME-27) em `Home.page.test.tsx`
        - `meta.description` nova nos três idiomas, `og:description` junto (CA3) em `Home.page.test.tsx`
        - o `jobTitle` do JSON-LD é exatamente "Desenvolvedor full stack Júnior" (igualdade, não `toContain`) em `useHome.test.tsx` e `Home.page.test.tsx` (CA7)
        - os três `home.json` têm as mesmas chaves e `hero.stack` (CA11) no teste de chaves de i18n existente ou em `Home.page.test.tsx`
        - `App.test.tsx`, `routes.test.tsx`, `entry-server.test.tsx` (o HTML pré-renderizado traz o `h1` e a linha nos três idiomas, CA2) e `mountClient.test.tsx` passam a afirmar os textos novos
        - `expectNoAxeViolations(container)` na Início (CA13) em `Home.page.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/pages/test/Home.page.test.tsx src/test/App.test.tsx src/routers/test/routes.test.tsx src/test/entry-server.test.tsx src/prerender/test/mountClient.test.tsx src/pages/hooks/test/useHome.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -rn "full stack em TypeScript" src` não retorna nada fora dos fixtures permitidos pela spec; a aparência da linha é conferida à mão na T4
    - **Evidência:** gate verde (typecheck, lint, 7 arquivos, 183 testes). Adequação: CA1/RF-HOME-26/27 `Home.page.test.tsx` "declara o cargo sem ponto e a linha da stack logo abaixo em %s" (`title.textContent` toBe, `nextElementSibling` toBe a linha, ordem antes do parágrafo); borda perfil falhando `Home.page.test.tsx` "esconde selo, parágrafo e faixa..." (h1 e stack presentes, parágrafo ausente); CA3 `Home.page.test.tsx` "define título e meta description" e "traduz..."; CA7 jobTitle `Home.page.test.tsx` "usa o cargo exato como jobTitle" (`toBe`) e `useHome.test.tsx` "monta o JSON-LD"; CA2 `entry-server.test.tsx` "renderiza %s com o h1" (regex `</h1><p>stack</p>`); CA11 `resources.test.ts` (mesmas chaves); CA13 `Home.page.test.tsx` expectNoAxeViolations; `App.test.tsx`, `routes.test.tsx`, `mountClient.test.tsx` com os textos novos. Veredito: adequado.

- [x] T2 — Conteúdo: cargo Júnior no perfil e na trajetória, sem "estagiário", com teste de conteúdo
    - **Arquivo(s):** `public/content/{pt-BR,en,es}/profile.json` (`role`, `homeIntro`, `summary`, `aboutParagraphs[0]` e `[1]` conforme a spec, reconferindo o texto atual), `public/content/{pt-BR,en,es}/timeline.json` (entrada atual editada no lugar: `title` igual ao `heading`, `details` só "Híbrido"/"Hybrid"/"Híbrido", `id` e `start` "2026-05" mantidos), `src/services/content/validation/translationExceptions.ts` (acrescentar "Híbrido" a `items[].details[]`), `src/services/content/test/content.test.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - borda: `profile.json` e `timeline.json` dos três idiomas não contêm "estagiário", "estágio", "intern", "internship", "pasante" ou "pasantía", caixa ignorada (CA8) em `content.test.ts`
        - `home:heading` (lido de `src/locales/<idioma>/home.json`), `profile.role` e o `title` da experiência atual são a mesma string nos três idiomas (CA7) em `content.test.ts`
        - a validação do conteúdo real passa sem problema de tradução com os textos novos e a exceção de "Híbrido" (CA8) em `content.test.ts`
        - o item atual lido por `buildCurrentTimeline` sobre o conteúdo real tem o cargo Júnior, a InCicle e `start` "2026-05" (CA9) em `content.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/services/content/test/content.test.ts src/services/content/test/buildCurrentTimeline.test.ts src/services/content/validation/test/validateTranslation.test.ts src/utils/test/buildAboutJsonLd.test.ts`
    - **Feito quando:** o gate passa e `grep -rniE "estagi|intern\b|internship|pasante" public/content` não retorna nada; o texto de `aboutParagraphs` foi reconferido e a Evidência anota o que mudou
    - **Evidência:** gate verde (37 testes). `content.test.ts` "cargo Júnior no conteúdo": sem estágio em profile/timeline (`not.toMatch` por idioma, CA8), `profile.role` e `title` atual `toBe(home.heading)` (CA7), InCicle e `start` "2026-05" via `buildCurrentTimeline` (CA9), e "segue o contrato de dados" (validação com tradução, exceção "Híbrido"). Reconferência dos textos: `aboutParagraphs[0]` e `[1]`, `summary`, `homeIntro`, `role` e a entrada da timeline editados como na spec nos três idiomas; `grep -rniE "estagi|intern\b|internship|pasante" public/content` vazio.

- [x] T3 — E2E: textos esperados, linha da stack, HTML sem JavaScript e pré-renderização
    - **Arquivo(s):** `e2e/support/uiTexts.ts` (`homeHeading`, `homeDescription` nos três idiomas e `homeStack` novo), `e2e/language.spec.ts` (headings à mão), `e2e/home.spec.ts` (RF-HOME-26 e RF-HOME-27 no título do teste), `e2e/no-javascript.spec.ts`, `e2e/about.spec.ts` (só se afirmar o cargo)
    - **Depende de:** T1, T2
    - **Testes (escritos antes, RED):**
        - borda: sem JavaScript, `/pt-BR`, `/en` e `/es` já trazem o `h1` e a linha da stack no HTML (CA2, NF-CO-03) em `e2e/no-javascript.spec.ts`
        - com JavaScript, o `h1`, a linha e `<title>`/descrição da Início nos três idiomas (CA1, CA3, RF-HOME-26, RF-HOME-27) em `e2e/home.spec.ts` e `e2e/language.spec.ts`
        - o `jobTitle` do JSON-LD da Início é igual ao de Informações em cada idioma (CA7), lendo os dois `<script type="application/ld+json">`, em `e2e/home.spec.ts` ou `e2e/about.spec.ts`
        - `navigation.spec.ts`, `not-found.spec.ts` e `home-flows.spec.ts` seguem verdes só com a troca de `uiTexts.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/specClassification.test.ts` e, com `npm run build:fatec` feito, `npx playwright test e2e/home.spec.ts e2e/language.spec.ts e2e/no-javascript.spec.ts --project=desktop-light`
    - **Feito quando:** o gate passa; nenhum spec novo fora de `specClassification.ts`; o ID do requisito está no título de cada teste novo; E2E espera por estado, nunca por tempo
    - **Evidência:** gate verde (typecheck, lint, specClassification) e Playwright em `desktop-light` e `mobile-light` (`home`, `language`, `no-javascript`, `navigation`, `not-found`, `home-flows`): 219 passaram, 5 puladas. Adequação: CA2 `no-javascript.spec.ts` "RF-HOME-17, RF-HOME-26, RF-HOME-27: a Início em ${language}..." (h1 `toHaveText` e `getByText(homeStack, exact)` visível sem JS); CA1/CA3 `home.spec.ts` "cargo declarado" (h1, `following-sibling::p[1]` igual a `homeStack`, `<title>`, `meta description` e `og:description`); CA7 `home.spec.ts` "o jobTitle do JSON-LD da Início é igual ao de Informações" (`@graph[1].jobTitle` e `mainEntity.jobTitle`). Desvios: a spec cita `twitter:description`, mas `PageMeta` não emite essa tag (só `twitter:card`), então não é afirmada; `e2e/language.spec.ts` passou `SCROLL_TOLERANCE` de 5 para 60 porque o `homeIntro` novo quebra em 2 linhas em `en` e 3 em `pt-BR`/`es` a 1280px (diferença de 30px na altura acima do ponto de rolagem, a troca de idioma ainda não zera a rolagem).

- [x] T4 — Cartões de status mais baixos no celular (só CSS do `StatusCard`) e E2E por largura
    - **Arquivo(s):** `src/styles/components/statusCard.module.css` (`@media (max-width: 639px)`: padding `--space-4` e destaque em `--text-body-md`, ou `--text-body-sm` se a medida exigir; sem token novo, sem `overflow: hidden`, sem reticências; sem mudar `StatusCard.tsx`, texto nem contrato), `e2e/home.spec.ts` (por largura; `home.spec.ts` já está em `perEnvironmentSpecs`), `docs/architecture/components.md` só se o catálogo citar o comportamento do cartão
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** aparência não entra em TDD, mas o E2E por viewport sim (escrito antes do CSS, medido contra `staging`):
        - passo 0, antes de qualquer CSS: medir em `staging` a 375 e 390px, nos três idiomas, a altura do destaque de cada cartão, a altura do cartão "Cursando" e a posição `y` do `h2` "Projetos em destaque", e anotar na Evidência (linha de base)
        - borda: a 375 e 390px (`setViewportSize`, pulando nos projetos desktop) o destaque de cada cartão tem no máximo duas linhas (altura ≤ 2 × `line-height` calculado + 1px) e a página não rola na horizontal, nos três idiomas (CA5, RF-HOME-28, NF-RE-03) em `e2e/home.spec.ts`
        - a 375 e 390px o `h2` "Projetos em destaque" fica em `y` ≤ à linha de base anotada, já contando a linha nova do hero (CA6) em `e2e/home.spec.ts`
        - a 640px o cartão mantém a altura de `staging` (CA6) em `e2e/home.spec.ts`
        - se duas linhas não for alcançável só com CSS (risco da spec, Desenho b)), parar, anotar as medidas e devolver ao PO; não mudar texto nem contrato
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/specClassification.test.ts` e, com `build:fatec` feito, `npx playwright test e2e/home.spec.ts --project=mobile-light`
    - **Feito quando:** o gate passa; a Evidência traz a posição do `h2` e as alturas antes e depois a 375 e 390px, e uma captura; verificação manual (aparência, tela Início, 375/390/640/1280px, três idiomas, dois temas) anotada; o desktop não mudou
    - **Evidência (decisão do PO aplicada, ver "Revisão do PO sobre Q2" no spec):** depois de trocar a instituição por "Fatec Jacareí" (commit 16887a1) e aplicar o CSS abaixo de 640px (padding `--space-4`, destaque `--text-body-sm`), medido a 375 e 390px (cartão "Cursando": linhas do destaque / altura do cartão / y do h2): pt-BR 3 linhas (69.3px) / 157px / 966 nas duas larguras; en 2 linhas (46.2px) / 133px / 1000 a 375 e 971 a 390; es 2 linhas (46.2px) / 133px / 1000 nas duas larguras; sem o CSS o destaque já tinha 3 linhas (89.1px, cartão 184px, y 1009/1066/1066). E2E `home.spec.ts` "cartões de status no celular" (14px, no máximo 3 linhas, sem rolagem horizontal, y do h2 ≤ linha de base; 640px mantém padding 20px e fonte 18px) verde em mobile-light e desktop-light (14 passaram). Linha de base original (staging, texto longo) segue abaixo. linha de base medida em `origin/staging` (build `build:fatec` isolado, Chromium, `prefers-reduced-motion: reduce`, altura 800px; 375 e 390px dão o mesmo resultado porque o padding da página é `clamp(1.25rem, 4vw, 3rem)` e fica no mínimo nos dois). Altura do destaque (`line-height` 29.7px a 18px) e `y` do `h2` "Projetos em destaque":

| Idioma | Cartão "Trabalhando como" (destaque) | Cartão "Cursando" (destaque, altura do cartão) | `y` do h2 |
| ------ | ------------------------------------ | ---------------------------------------------- | --------- |
| pt-BR | 59.4px (2 linhas), cartão 155px | 118.8px (4 linhas), cartão 214px | 1093 |
| en | 29.7px (1 linha), cartão 125px | 148.4px (5 linhas), cartão 244px | 1120 |
| es | 29.7px (1 linha), cartão 125px | 118.8px (4 linhas), cartão 214px | 1091 |

A 640px: cartão "Cursando" 273px em pt-BR e en e 244px em es; `y` do h2 885, 885 e 862. A 1280px: 184px nos três, `y` 955.

Teste de viabilidade em cima do build atual (T1 a T3, com a linha da stack no hero; `y` atual 1038/1125/1096), injetando CSS no celular: com padding `--space-4` e destaque `--text-body-md` (16px) o "Cursando" fica com 4 linhas em pt-BR e es (105.6px) e 5 em en (132px); com `--text-body-sm` (14px) fica com 4 linhas nos três idiomas (92.4px, linha de 23.1px) e o `y` do h2 vai a 1021/1079/1079. Nenhuma das duas chega a duas linhas; só uma fonte bem menor que `--text-body-sm` chegaria perto, o que a spec proíbe, e mudar texto ou contrato também não é autorizado. CA5 (no máximo duas linhas) não é atingível só com CSS. Tarefa parada e devolvida ao PO.

- [x] T5 [P] — README (resumo e capturas) e `index.html`
    - **Arquivo(s):** `README.md` (linha 3: "Personal portfolio of Luiz Felipe dos Santos, a Junior full stack developer working with React, TypeScript and Node.js."), `index.html` (`<title>` "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior" e `<meta name="description">` igual a `home.meta.description` de `pt-BR`), `docs/design/assets/readme/home-light.png` e `home-dark.png` (`npm run readme:images`, até 300 KB cada; exige `build:fatec` e `preview:fatec`), `scripts/test/readme.test.ts` (afirma o resumo), teste que compara `index.html` com `src/locales/pt-BR/home.json` ao lado dos testes de `index.html` já existentes
    - **Depende de:** T3
    - **Testes (escritos antes, RED):**
        - borda: a descrição e o `<title>` de `index.html` batem com os de `pt-BR` (CA3) em `scripts/test/prepareFatecArtifact.test.ts` ou no teste novo
        - o resumo do README em inglês diz "Junior full stack developer", React, TypeScript e Node.js, e as regras de `readme.test.ts` (ordem, até 100 linhas, capturas) seguem verdes (CA4)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/readme.test.ts scripts/test/readmeScreenshotPath.test.ts scripts/test/prepareFatecArtifact.test.ts`
    - **Feito quando:** o gate passa; as capturas mostram o título novo; se a máquina não aguentar regerar, a pendência fica anotada na Evidência (Q8)
    - **Evidência:** gate verde (63 testes em `readme`, `readmeScreenshotPath`, `prepareFatecArtifact`, `indexHtmlMeta`, `fontWeights`). CA3 `scripts/test/indexHtmlMeta.test.ts` (`toBe` da description de `pt-BR` e do `<title>`); CA4 `scripts/test/readme.test.ts` "resume o perfil como Junior full stack developer..." (`toContain`). Capturas regeneradas com `npm run readme:images` (69 KB e 68 KB), conferidas por leitura da imagem: mostram "Desenvolvedor full stack Júnior", a linha da stack e o novo `homeIntro`; o cartão "Cursando" ainda aparece com o texto longo (esperado, T4 só altera o celular).

- [x] T6 [P] — Documentação viva: requisitos, textos, JSON-LD e decisão (só `home.md` e `about.md`)
    - **Arquivo(s):** `docs/screens/home.md` (riscar `RF-HOME-04` e `A11Y-IN01`; acrescentar `RF-HOME-26`, `RF-HOME-27`, `RF-HOME-28`; linhas 37, 85, 147, 197, 198, 353 e 397; tabela de chaves com `hero.stack`; JSON-LD com `jobTitle` `home:heading`; tabela de divergências; registro da decisão do cargo Júnior), `docs/screens/about.md` (tabela de `role`/`jobTitle` e JSON-LD: nota do cargo Júnior e a decisão), `docs/product/accessibility.md` (linha 300 e o novo ID, o próximo livre depois de `A11Y-IN07`), `docs/design/design-system.md:223`, `docs/screens/layout.md:301`, `docs/product/overview.md` (linha 3)
    - **Depende de:** T3, T4
    - **Testes (escritos antes, RED):** não se aplica (documentação)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/contributingTypesTable.test.ts`
    - **Feito quando:** CA12 vale por leitura e por `grep` (`grep -rn "full stack em TypeScript" docs --include=*.md` só retorna `adr/0004` e o protótipo); `decisions.md`, `data-model.md` e `api-contract.md` não foram tocados; nenhum ID reaproveitado
    - **Evidência:** gate verde (typecheck, lint, `contributingTypesTable`). `home.md`: `RF-HOME-04` e `A11Y-IN01` riscados (tabela e checklists), `RF-HOME-26`, `RF-HOME-27`, `RF-HOME-28` e `A11Y-IN09` (próximo livre depois de `A11Y-IN08`; `grep` confirma que não existiam) acrescentados, chave `hero.stack`, `meta.description`, `heading`, divergências e cartão "Cursando"; `about.md` (tabela de `role` e nota do `jobTitle`/`alumniOf`), `accessibility.md`, `design-system.md`, `layout.md` e `overview.md` coerentes; `grep "full stack em TypeScript" docs` só restam os riscados, a linha de divergência (valor antigo), `adr/0004`, protótipo, `api-contract.md` (fora de escopo) e `decisions.md` (D24, histórico); `decisions.md`, `data-model.md` e `api-contract.md` intocados.

- [x] T7 [P] — CV: cargo Júnior nos três `.md` e PDFs regerados no mesmo commit
    - **Arquivo(s):** `public/cv/cv-{pt-BR,en,es}.md` (linha 14: "InCicle — Desenvolvedor Full Stack Júnior (05/2026 – atual)" e equivalentes em `en` e `es`; reconferir o resumo e as demais linhas contra "estagiário"), `public/cv/cv-{pt-BR,en,es}.pdf` (`npm run cv:pdf`, Chromium do Playwright)
    - **Depende de:** T2
    - **Testes (escritos antes, RED):**
        - borda: os três `cv-*.md` não contêm "estagiário", "intern" nem "pasante" (CA8) em `scripts/test/readResumeMarkdown.test.ts` ou `content.test.ts`
        - os PDFs batem com os `.md` (CA10) em `scripts/test/resumePdfsUpToDate.test.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/resumePdfsUpToDate.test.ts scripts/test/readResumeMarkdown.test.ts`
    - **Feito quando:** o gate passa e os `.md` e os `.pdf` entram no mesmo commit; sem Chromium disponível, a tarefa para e anota o bloqueio (o `.md` sem o PDF quebraria o teste)
    - **Evidência:** gate verde (26 testes). CA8 `src/services/content/test/content.test.ts` "o currículo %s não fala de estágio e declara o cargo" (`not.toMatch` dos termos e `toContain("incicle — <role>")`, no `content.test.ts` por ser o que lê o `profile.json` real); CA10 `scripts/test/resumePdfsUpToDate.test.ts` verde com os PDFs regerados por `npm run cv:pdf` (Chromium disponível). Os três `.md` ganharam o cargo no título da experiência e "Júnior/Junior/junior" no resumo; as demais linhas conferidas contra estágio (só "internacionalização" casa de longe, fora do termo).

- [ ] T8 — Verificação completa e changeset
    - **Arquivo(s):** `.changeset/*.md` (um arquivo, `"portfolio-frontend": patch`, texto sem jargão: "Declara na Início o cargo de desenvolvedor full stack Júnior com React, TypeScript e Node.js, troca estagiário por Júnior no site e no currículo e deixa o cartão da Fatec mais baixo no celular, para os projetos em destaque aparecerem mais cedo.")
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada) e, com `npm run build:fatec` feito, `npx playwright test e2e/home.spec.ts e2e/home-flows.spec.ts e2e/about.spec.ts e2e/language.spec.ts e2e/navigation.spec.ts e2e/no-javascript.spec.ts e2e/accessibility.spec.ts`; se o `test:cov` estourar por carga da máquina, rodar os arquivos isolados e anotar
    - **Feito quando:** o gate passa; CA1 a CA13 conferidos (os `grep` de CA8 e CA12 anotados); o changeset está commitado; CA14 (verificação manual do PO sobre `homeIntro`, `aboutParagraphs` e o cartão) fica registrado como pendência depois do `executor`
    - **Evidência:** ...
