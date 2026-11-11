# Spec: declara-vaga-junior-e-encurta-cartao-fatec

> **Tipo:** `feature` (Feat na branch e no commit) <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#134` <br />
> **Criado em:** `11-11-2026`

Feature com tela (Início, e Informações pelo texto do cargo): o `qa` se aplica. Base: `origin/staging` com a #229 (#145) já mergeada (`714c103`) e esta branch rebaseada.

## Problema

A primeira tela da Início descreve o perfil, mas não diz qual nível o PO procura: o `h1` é "Desenvolvedor full stack em TypeScript" e a palavra "Júnior" só aparece em Informações, em "Sobre mim". Além disso, no celular o cartão "Cursando" (Fatec) junta o nome inteiro da instituição ao nome do curso (cerca de 130 caracteres, `Fatec – Faculdade de Tecnologia do Estado de São Paulo (Jacareí) · Tecnólogo em Desenvolvimento de Software Multiplataforma`, `src/components/StatusCard.tsx`) e quebra em várias linhas, empurrando "Projetos em destaque" para baixo (`.cards` em `src/styles/pages/home.module.css`, colunas de no mínimo 17rem, uma coluna no celular). Origem: revisão do site de 07/11/2026, achado 2.

Hoje o site diz coisas diferentes sobre o cargo: o `jobTitle` do JSON-LD da Início vem de `home:heading` ("Desenvolvedor full stack em TypeScript") e o de Informações vem de `profile.role` ("Estagiário de Desenvolvimento Frontend"), e as duas páginas descrevem a mesma `Person` (`@id` `.../#person`). O texto de estagiário também está no perfil, na trajetória e nos CV.

## Decisão do PO (registrada pelo Master como "D-05")

Não confundir com a `D05` de `docs/design/decisions.md` (formulário de contato desligado). O cargo principal é **"Desenvolvedor full stack Júnior"** (React, TypeScript e Node.js) em todos os lugares (JSON-LD da Início e de Informações, `h1`, linha sob o título, README, textos de Início e Informações, `<title>`/`<meta>`, `index.html` e CV), nos três idiomas, e o cargo atual deixa de ser estagiário e passa a ser Júnior; a InCicle segue como empregador (`worksFor`).

## Objetivo

1. Declarar na Início, nos três idiomas, o cargo "Desenvolvedor full stack Júnior" no `h1` e, logo abaixo, uma linha só com a stack: "React, TypeScript e Node.js".
2. Fazer o cargo ser o mesmo texto onde ele aparece: `h1`, `jobTitle` da Início, `profile.role` (`jobTitle` de Informações e cartão "Agora"), título da experiência atual (cartão "Trabalhando como") e metadados.
3. No celular (375 e 390px), o cartão "Cursando" ocupa menos altura (no máximo duas linhas de destaque) e "Projetos em destaque" começa mais acima do que hoje.
4. Nada no conteúdo, no código vivo, na documentação viva e no CV diz que o cargo atual é de estagiário.

## Fora de escopo

- Reescrever o design da Início, o `AvailabilityBadge`, a faixa de stack ou os destaques; mudar texto ou contrato do cartão "Cursando" (decisão do PO: só CSS).
- O conteúdo de Projetos, formulário de contato, `D05`, backend (R1).
- `docs/design/decisions.md` (decisão registrada só em `home.md` e `about.md`, ver "Decisões do PO") e `package.json` (`description` não é metadado do site).
- Os fixtures de teste que usam "Desenvolvedor full stack" ou "Estagiário" sem depender do conteúdo real (`src/testUtils/buildProfile.ts`, `src/components/test/AboutNowCard.test.tsx`, `src/utils/test/buildAboutJsonLd.test.ts`, `src/components/test/StatusCard.test.tsx`): ficam como estão.
- `docs/adr/0004-prerendering.md` (histórico) e `docs/design/prototype/` (protótipo congelado, PI5).
- Imagem OG (`scripts/generateOgImage.ts` só desenha o gato).

## Inventário (arquivo e linha, depois do rebase sobre a #229)

Estagiário, intern, pasante, estágio, internship:

| Onde | O que diz | Muda? |
| ---- | --------- | ----- |
| `public/content/{pt-BR,en,es}/profile.json:2` | `role` "Estagiário de Desenvolvimento Frontend", "Frontend Development Intern", "Pasante de Desarrollo Frontend" | Sim: "Desenvolvedor full stack Júnior", "Junior full stack developer", "Desarrollador full stack junior" |
| `public/content/{pt-BR,en,es}/profile.json:3` | `homeIntro` com "estagiário/intern/pasante" e a stack | Sim: sem estagiário e sem a stack (Q6) |
| `public/content/{pt-BR,en,es}/profile.json:4` | `summary` "desenvolvedor full stack" | Sim: acrescenta o nível |
| `public/content/{pt-BR,en,es}/profile.json:28` | `aboutParagraphs[0]` (a #145 deixou dois parágrafos): "...e estagiário de desenvolvimento na InCicle..." | Sim |
| `public/content/{pt-BR,en,es}/profile.json:29` | `aboutParagraphs[1]`: "Busco uma posição júnior e aprendo fazendo..." | Sim: ele já é Júnior, a frase passa a "Aprendo fazendo, em projetos dentro e fora do trabalho" |
| `public/content/{pt-BR,en,es}/timeline.json:6,8` | `title` "Estagiário de Desenvolvimento Frontend" (en/es idem) e `details` "Estágio · Híbrido" (en "Internship · Hybrid", es "Pasantía · Híbrido") | Sim: `title` igual ao `heading`; `details` só "Híbrido"/"Hybrid"/"Híbrido" |
| `public/cv/cv-{pt-BR,en,es}.md:14` e os três `.pdf` | "InCicle — Estagiário de Desenvolvimento (05/2026 – atual)" | Sim, com os PDFs regerados (ver "Decisões do PO") |
| `src/utils/test/buildAboutJsonLd.test.ts:97,127`, `src/components/test/AboutNowCard.test.tsx:8,22` | "Estagiário" em fixture | Não |
| `docs/` | nenhum diz estagiário/intern/pasante (conferido por `grep`) | Não |

"Desenvolvedor full stack" como cargo ou título:

| Onde | Muda? |
| ---- | ----- |
| `src/locales/{pt-BR,en,es}/home.json:6` (`heading`) e `:4` (`meta.description`) | Sim |
| `src/pages/hooks/useHome.ts:40` (`jobTitle: t("home:heading")`), `src/utils/buildAboutJsonLd.ts:60` (`jobTitle: profile?.role`) | Código não muda; o dado muda |
| `index.html:95,97` (`<meta description>` e `<title>`) | Sim |
| `README.md:3` (resumo em inglês) e as capturas `docs/design/assets/readme/home-{light,dark}.png` | Sim |
| `docs/screens/home.md:37,85,147,197,198,353,397`, `docs/design/design-system.md:223`, `docs/screens/layout.md:301`, `docs/product/accessibility.md:300`, `docs/product/overview.md:3` | Sim |
| `docs/screens/about.md` (tabela de `role`/`jobTitle`, linhas ~241 e ~310) | Sim: nota do cargo Júnior (decisão registrada aqui) |
| Testes do `h1` e da descrição: `src/pages/test/Home.page.test.tsx:110,127,138,153,159,163,196`, `src/test/App.test.tsx:28,41,53,65,69,80,91`, `src/test/entry-server.test.tsx:18,23,28`, `src/routers/test/routes.test.tsx:47,56-58,126,240,246,253,325`, `src/prerender/test/mountClient.test.tsx:134,145,157,166`, `src/pages/hooks/test/useHome.test.tsx:123` | Sim |
| E2E: `e2e/support/uiTexts.ts:36,39,252,255,466,469`, `e2e/language.spec.ts:15,22,29` | Sim (`navigation`, `not-found` e `home-flows` leem de `uiTexts`) |
| `package.json:3`, `docs/architecture/api-contract.md:117,119`, `docs/adr/0004`, protótipo | Não |

## Desenho

### a) Hero (D24, RF-HOME-04, RF-HOME-05, D44)

- `h1` (chave `home:heading`, sem ponto, D24) passa a ser exatamente o cargo: "Desenvolvedor full stack Júnior" / "Junior full stack developer" / "Desarrollador full stack junior". "em TypeScript" sai porque a stack ganha linha própria.
- Logo abaixo do `h1` entra um `<p>` com a chave nova `home:hero.stack`: "React, TypeScript e Node.js" / "React, TypeScript and Node.js" / "React, TypeScript y Node.js", sem ponto. Sem verbo e sem intenção de vaga (decisão do PO); a issue ("declara a vaga Júnior, com React, TypeScript e Node.js") fica atendida pelo `h1` e a linha juntos.
- O parágrafo `homeIntro` continua vindo do conteúdo (D44, RF-HOME-05) e deixa de repetir a stack.
- A linha fica fora do `h1` (o `h1` é só o cargo, alvo de foco, RF-LAY-32), em `--text-body-lg`, `--text-strong`, `max-width: var(--measure)`; sem token novo.
- Com o `h1` igual ao cargo, `jobTitle` da Início, `profile.role` e o título da experiência atual passam a ser a mesma string por idioma (CA7).
- Chaves: `hero.stack` é nova nos três idiomas; `heading` e `meta.description` mudam de valor; nenhuma chave fica sem uso (R2).

### b) Cartão "Cursando" no celular (só CSS)

`.cards` é `grid` com `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))`, então abaixo de ~37rem os cartões empilham, e o destaque de `studying` é `<JoinedParts parts={[organization, title]} />` em `--text-body-lg` (Bricolage 700). Decisão do PO: aceitar duas linhas, sem mudar texto nem contrato. Abaixo de 640px (NF-RE-01), em `statusCard.module.css`, o padding do cartão passa a `--space-4` e o destaque a `--text-body-md` (ou `--text-body-sm` se necessário), sem token novo, sem `overflow: hidden`, sem reticências (A11Y-G11). A partir de 640px nada muda.

**Risco que o executor mede primeiro:** o destaque tem ~130 caracteres e, a 390px, cada linha comporta cerca de 37 (em 16px) a 45 (em 14px) caracteres, então só CSS provavelmente chega a três linhas, não duas. O executor mede a linha de base em `staging` e o resultado com `--text-body-md` e `--text-body-sm`; se duas linhas não for alcançável sem texto menor que `--text-body-sm` ou sem mudar o texto, ele para e devolve ao PO (a spec não autoriza mudar texto nem contrato) com as medidas, e o E2E passa a afirmar o valor medido. O ganho de altura é conferido contra a linha de base.

### c) Entrada atual da trajetória

Editar a entrada atual no lugar (decisão do PO): mesmo `id`, `start` "2026-05", novo `title` (igual ao `heading`) e `details` só "Híbrido". O cartão passa a dizer "Júnior desde 05/2026". `buildCurrentTimeline` já pega a experiência sem `end`.

### d) Metadados

- `meta.description`: pt-BR "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack Júnior com React, TypeScript e Node.js: projetos, trajetória e contato."; en "Portfolio of Luiz Felipe dos Santos, junior full stack developer with React, TypeScript and Node.js: projects, background and contact."; es "Portafolio de Luiz Felipe dos Santos, desarrollador full stack junior con React, TypeScript y Node.js: proyectos, trayectoria y contacto." `og:description` e `twitter:description` seguem por `PageMeta`.
- `meta.title` não muda ("Portfólio · Luiz Felipe dos Santos").
- `index.html` (pt-BR): `<title>` "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior" e descrição igual à de `pt-BR`.
- JSON-LD: Início `jobTitle` por `home:heading`; Informações por `profile.role`; iguais.

## Textos novos (R2)

| Namespace | Chave | pt-BR | en | es |
| --------- | ----- | ----- | -- | -- |
| `home` | `heading` (muda) | Desenvolvedor full stack Júnior | Junior full stack developer | Desarrollador full stack junior |
| `home` | `meta.description` (muda) | ver d) | ver d) | ver d) |
| `home` | `hero.stack` (nova) | React, TypeScript e Node.js | React, TypeScript and Node.js | React, TypeScript y Node.js |

Conteúdo (`public/content/`, não é chave): `role` igual ao `heading`; `homeIntro` (proposta simples, o PO ajusta na verificação manual): pt-BR "Estudante de Desenvolvimento de Software Multiplataforma e desenvolvedor na InCicle, construindo produtos reais com foco em frontend.", en "Multiplatform Software Development student and developer at InCicle, building real products with a focus on the frontend.", es "Estudiante de Desarrollo de Software Multiplataforma y desarrollador en InCicle, construyendo productos reales con foco en el frontend."; `summary` com "full stack Júnior"/"junior full stack"; `aboutParagraphs[0]` com "Sou desenvolvedor full stack Júnior, com atuação principal em frontend, na InCicle, onde trabalho..." (en "I am a junior full stack developer, mainly focused on frontend, at InCicle, where I work...", es "Soy desarrollador full stack junior, con foco principal en frontend, en InCicle, donde trabajo..."); `aboutParagraphs[1]` sem "Busco uma posição júnior" (pt-BR "Aprendo fazendo, em projetos dentro e fora do trabalho."); título da experiência atual igual ao `heading`.

## Critérios de aceite

Legenda: [teste] Vitest, [E2E] Playwright, [manual] verificação do PO ou do `qa`.

- [ ] **CA1** (issue 1) [teste] [E2E]: a Início em `pt-BR`, `en` e `es` tem `h1` igual a "Desenvolvedor full stack Júnior", "Junior full stack developer" e "Desarrollador full stack junior", sem ponto (D24), e logo abaixo o `<p>` "React, TypeScript e Node.js" / "React, TypeScript and Node.js" / "React, TypeScript y Node.js", sem chave no lugar do texto (RF-HOME-26, RF-HOME-27).
- [ ] **CA2** (issue 1, 4) [E2E] [teste]: sem JavaScript, o HTML pré-renderizado de `/pt-BR`, `/en` e `/es` já traz o `h1` e a linha da stack (`no-javascript.spec.ts`, `entry-server.test.tsx`).
- [ ] **CA3** (issue 2) [teste] [E2E]: `<title>`, `<meta name="description">`, `og:description` e `twitter:description` da Início usam a descrição nova nos três idiomas, e `<title>` e descrição de `index.html` batem com a de `pt-BR`.
- [ ] **CA4** (issue 2) [teste]: o resumo do `README.md` diz "Junior full stack developer" com React, TypeScript e Node.js, `npm test -- --run scripts/test/readme.test.ts` segue verde e as capturas `home-{light,dark}.png` mostram o título novo (ou a pendência fica anotada, Q8).
- [ ] **CA5** (issue 3, decisão do PO) [E2E]: a 375px e a 390px, nos três idiomas, o destaque de cada cartão de status tem no máximo duas linhas (altura ≤ 2 × `line-height` calculado, mais 1px) e a página não rola na horizontal (RF-HOME-28, NF-RE-03). Sujeito ao risco da seção Desenho b): se duas linhas não for alcançável só com CSS, o executor devolve ao PO com as medidas.
- [ ] **CA6** (issue 3) [E2E] [manual]: a 375px e 390px, o topo do `h2` "Projetos em destaque" fica em posição menor ou igual à da linha de base medida em `staging` (mesmo com a linha nova do hero), e a 640px e acima a aparência do cartão não mudou.
- [ ] **CA7** (decisão do PO) [teste]: nos três idiomas, `home:heading`, `profile.role` e o `title` da experiência atual são a mesma string, e o `jobTitle` do JSON-LD da Início é igual ao de Informações (`Home.page.test.tsx`, `content.test.ts`).
- [ ] **CA8** (decisão do PO) [teste]: `profile.json` e `timeline.json` dos três idiomas não contêm "estagiário", "estágio", "intern", "internship", "pasante" ou "pasantía" (caixa ignorada), e a validação do conteúdo real (inclusive de tradução) passa; os três `cv-*.md` também não contêm esses termos.
- [ ] **CA9** (decisão do PO) [teste]: o cartão "Trabalhando como" mostra o cargo Júnior, a InCicle e "desde 05/2026", e o `worksFor` do JSON-LD de Informações segue `InCicle`.
- [ ] **CA10** (issue 4) [teste] [E2E]: `npm run test:cov` e os E2E de Início, Informações, idioma, navegação e sem JavaScript passam com os textos novos; os PDFs do CV batem com os `.md` (`scripts/test/resumePdfsUpToDate.test.ts`).
- [ ] **CA11** (R2) [teste]: os três `home.json` têm as mesmas chaves, `hero.stack` existe nos três e nenhuma chave de `home` ficou sem uso.
- [ ] **CA12** (documentação) [review]: `home.md` risca `RF-HOME-04` e `A11Y-IN01` e traz `RF-HOME-26`, `RF-HOME-27`, `RF-HOME-28` e o novo ID de acessibilidade; `design-system.md`, `layout.md`, `accessibility.md`, `overview.md` e `about.md` coerentes com a decisão; `decisions.md` e contrato de dados intocados.
- [ ] **CA13** [E2E] [teste]: `expectNoAxeViolations` na Início e em Informações nos temas e larguras já cobertos e `jsx-a11y` limpo.
- [ ] **CA14** [manual]: pendência de verificação manual depois do `executor`: o PO confere e ajusta o texto do `homeIntro`, de `aboutParagraphs` e o resultado do cartão a 375 e 390px.

## Casos de borda

- QUANDO a trajetória não tem item `education` em curso ENTÃO a seção mostra só "Trabalhando como" e nada quebra.
- QUANDO o idioma é `es` ENTÃO "Desarrollador full stack junior" cabe no cartão "Trabalhando como" a 375px em no máximo duas linhas.
- QUANDO a largura é exatamente 640px ENTÃO o cartão mantém a aparência de hoje (o ajuste vale só abaixo de 640px, NF-RE-01).
- QUANDO o perfil falha ao carregar ENTÃO o `h1` e a linha da stack (texto fixo) continuam visíveis e o parágrafo do conteúdo some sem mensagem (RF-HOME-05, RF-HOME-24).
- QUANDO o texto é ampliado a 200% ENTÃO nada é cortado (sem reticências nem `overflow: hidden` no destaque; A11Y-G11).

## Estratégia de validação

- **Checagens automatizadas:** por tarefa, `npm run typecheck && npm run lint && npm test -- --run <arquivos>`; no fim, `npm run build`, `npm run test:cov` e os E2E (`build:fatec` antes; ver T8).
- **Checagens manuais (`qa` e PO):** Início a 375, 390 e 1280px, nos três idiomas e dois temas (cartão e linha nova); Informações com o cargo novo; capturas anotadas na Evidência da T4; texto do `homeIntro` conferido pelo PO (CA14).
- **Rollback / mitigação:** reverter o commit do CSS do cartão (T4) sem tocar nos textos; o cargo é independente do cartão.

## Conflitos e ordem

- **#145 (#229): já mergeada**, esta branch já foi rebaseada. Conferido no código atual: `aboutParagraphs` tem dois parágrafos (só o primeiro diz estagiário; o segundo diz "Busco uma posição júnior"), `about.md` e `overview.md` já refletem a nova ordem e nenhum deles cita o cargo de estagiário. O executor reconfere os textos antes de editar.
- **#143 (`feat/143-secao-experimentos-vitrine`, ainda não é PR):** sobreposição restante em `e2e/support/uiTexts.ts` e `e2e/no-javascript.spec.ts`; ficam numa tarefa só (T3) para o rebase ser barato. Sem `decisions.md`, sem `buildContentSnapshot.ts` e sem `package.json` nesta feature.
- **Changeset:** `patch` (`roadmap.md#versionamento`), texto sem jargão, um arquivo em `.changeset/` (T8).

## Decisões do PO (11-11-2026)

Respostas às questões levantadas na revisão da spec, repassadas pelo coordenador:

- **Q1 (linha do hero):** a linha sob o `h1` é só a stack, "React, TypeScript e Node.js" (en "React, TypeScript and Node.js", es "React, TypeScript y Node.js"), sem intenção de vaga. Chave `home:hero.stack`.
- **Q2 (cartão "Cursando"):** aceitar duas linhas; não criar `cardTitle`, não mudar o contrato nem o texto; só CSS do `StatusCard` no celular. O "cabe em uma linha" da issue passa a "no máximo duas linhas de destaque".
- **Q3 (CV):** entram os três `cv-*.md` e os PDFs regerados com `npm run cv:pdf`, no mesmo commit.
- **Q4 (`details`):** só "Híbrido" (en "Hybrid"), com exceção em `translationExceptions.ts` para a igualdade entre pt-BR e es.
- **Q5 (trajetória):** editar a entrada no lugar; cartão "Júnior desde 05/2026".
- **Q6 (`homeIntro`):** texto simples, sem estagiário e sem repetir a stack; o PO ajusta na verificação manual, depois do executor (CA14).
- **Q7 (registro):** decisão registrada só em `home.md` e `about.md`; sem `decisions.md`.
- **Q8 (capturas):** regerar as capturas do README com `npm run readme:images`; se a máquina não aguentar, anotar a pendência.

## Riscos

- Duas linhas no cartão "Cursando" pode não ser alcançável só com CSS (ver Desenho b)); mitigação: medir primeiro e devolver ao PO.
- Trocar `home:heading` quebra de uma vez seis arquivos de teste e `uiTexts`: T1 e T3 atualizam tudo junto, sem estado vermelho commitado.
- Conflito de rebase com a #143 em `uiTexts.ts` e `no-javascript.spec.ts`.
- Regerar os PDFs depende do Chromium do Playwright; sem ele `resumePdfsUpToDate.test.ts` falha.
- E2E de 375px usa `setViewportSize` em `home.spec.ts` (já em `perEnvironmentSpecs`) e roda nos projetos mobile.

## Notas

- Decisões de design aplicadas: D24, D44, D39, D54, NF-RE-01, D68 (não mexe). R3: convenções > `decisions.md` > protótipo > handoff; o protótipo tem o título antigo (PI5, congelado).
- IDs novos em `home.md`: `RF-HOME-26` (h1 igual ao cargo), `RF-HOME-27` (linha da stack), `RF-HOME-28` (cartões de status compactos abaixo de 640px); `RF-HOME-04` e `A11Y-IN01` são riscados; o novo ID de acessibilidade é o próximo livre depois de `A11Y-IN07` (conferir por `grep`).
- R1: tudo local; nada depende de backend. A linha da stack é texto fixo (chave) para o HTML pré-renderizado e o `meta.description` não dependerem do perfil.
