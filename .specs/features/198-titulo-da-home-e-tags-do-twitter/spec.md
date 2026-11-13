# Spec: título da home, tags do Twitter e imagem de compartilhamento por página

> **Tipo:** `feature` <br />
> **Status:** `implementada` <!-- rascunho -> em-revisao -> aprovada -> em-andamento -> implementada --> <br />
> **Issue:** `#198` e `#138` (dois PRs: PR1 `Closes #198` e `Refs #138`, PR2 `Closes #138`) <br />
> **Criado em:** `11-11-2026`

## Problema

- **#198:** o título da Início é "Portfólio · Luiz Felipe dos Santos" (`en` "Portfolio · …", `es` "Portafolio · …"). Ele
  serve para quem busca pelo nome, mas não diz o que eu faço. O título é o principal sinal do resultado de busca
  (auditoria de SEO de 10/11/2026).
- **#138:** toda página pública emite `twitter:card`, mas nenhuma emite `twitter:title`, `twitter:description` ou
  `twitter:image`. O X e outras redes usam as `og:*` como reserva, então o prejuízo é pequeno, mas a marcação fica
  incompleta. Além disso, as quatro telas principais (Início, Projetos, Informações e Contato) compartilham a mesma
  imagem genérica `images/og-site.png`, com o gato e o nome. Uma prévia de link não mostra qual página está sendo
  compartilhada (revisão do site de 07/11/2026, achado 9).

## Objetivo

1. O `<title>` da Início traz meu nome, o cargo e a stack nos três idiomas. `og:title` e `twitter:title` são iguais a
   ele (#198).
2. `PageMeta` emite `twitter:title`, `twitter:description`, `twitter:image` e `twitter:image:alt` iguais às tags Open
   Graph correspondentes, em toda página pública e nos três idiomas (#138).
3. Início, Projetos, Informações e Contato têm uma imagem de compartilhamento própria por idioma: 1200×630 em PNG,
   versionada em `public/` e com alt traduzido. `og:image` e `twitter:image` apontam para ela (#138, decisão do PO de
   11/11/2026 que reverte a D-12 do dispatch da Onda 1).

A feature **não tem tela nova nem mudança visível na página**. O que muda é a aba do navegador (título), o `<head>`
(tags) e a prévia de link. O `qa` atua só nos E2E de metadados. Não há fluxo de interface novo.

## Fora de escopo

- O título das outras telas, que continuam no formato `<Tela> · Luiz Felipe dos Santos` (`layout.md`).
- Imagem de compartilhamento gerada por projeto ou por documento: a tela Projeto e a de documento continuam com a
  captura do projeto (D26, já implementada). Ver "Notas", item (a).
- Imagem para a página não encontrada e para a de erro: elas são `noindex` e não declaram Open Graph (`layout.md`). Isso
  não muda.
- Geração da imagem no build ou por serviço externo. Ver "Notas", item (b).
- Trocar o `og:image` padrão (`images/og-site.png`). Ele continua como reserva do `PageMeta`.
- Atualizar as menções a `twitter:card` em `about.md`, `contact.md`, `projects.md` e `project.md`. Elas remetem ao
  "mecanismo de #52" e continuam corretas. A spec atualiza só os documentos centrais (`frontend.md`, `layout.md`,
  `home.md` e `non-functional-requirements.md`).
- A troca da expressão de idioma dentro do `PageMeta.tsx`, que é da #141 e vem depois.

## Título proposto (#198)

Restrições que valem ao mesmo tempo:

- O cargo é igual ao `home:heading` (decisão D-05 do dispatch da Onda 1, RF-HOME-26).
- O critério de aceite da #198 pede função **e** stack.
- O título deve caber em cerca de 60 caracteres no resultado de busca.

O Google corta o título por largura em pixels (cerca de 580 a 600 px), não por caracteres, então os 60 caracteres são
só uma referência. Nome, cargo e stack juntos dão de 84 a 86 caracteres. **As três restrições não cabem juntas**, e a
proposta escolhe o que sobra quando o título for cortado.

Voz: sem emoji, sem superlativo, separador `·`, sem ponto final (D24). A contagem é de caracteres Unicode.

| Opção                                    | `pt-BR`                                                                                     | `en`                                                                                      | `es`                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **A (recomendada)** nome · cargo · stack | Luiz Felipe dos Santos · Desenvolvedor full stack Júnior · React, TypeScript e Node.js (86) | Luiz Felipe dos Santos · Junior full stack developer · React, TypeScript and Node.js (84) | Luiz Felipe dos Santos · Desarrollador full stack junior · React, TypeScript y Node.js (86) |
| B cargo · stack, sem o nome              | Desenvolvedor full stack Júnior · React, TypeScript e Node.js (61)                          | Junior full stack developer · React, TypeScript and Node.js (59)                          | Desarrollador full stack junior · React, TypeScript y Node.js (61)                          |

- **A (recomendada):** cumpre o critério da #198 e mantém o nome no começo. Quando o resultado de busca cortar, o que
  aparece ("Luiz Felipe dos Santos · Desenvolvedor full stack Júnior", 56 caracteres) continua dizendo quem sou e o que
  faço, e só a stack é cortada. A stack também está na `description`. Na prévia de link (WhatsApp, LinkedIn, X), que
  mostra mais texto, o título aparece inteiro. Ele também vira o `<title>` estático do `index.html`, que hoje é
  "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior".
- **B (alternativa):** cumpre o critério e cabe em cerca de 60 caracteres. O custo é tirar o nome do título, que é o
  sinal da busca pelo meu nome. O nome continua no JSON-LD, na `description` e no `h1` de Informações.
- **Não equivalente:** "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior" (56) cabe, mas não tem a stack. Só
  vale se o PO alterar o critério de aceite da #198. Do jeito que a issue está escrita, ela não fecharia.

O PO escolhe a opção ao promover a spec para `aprovada`. As tarefas usam a opção A. Se ele escolher B, troca só a
string, nos mesmos arquivos.

## Critérios de aceite

Cada critério tem um ID desta spec, o requisito de `docs/` entre colchetes e o teste que o prova (ver `tasks.md`).

- [ ] **CA-01** [RF-HOME-26, A11Y-G01, NF-IA-10]: em `/pt-BR`, `/en` e `/es`, `document.title` da Início é o título
      escolhido (opção A), no idioma da página, e acompanha a troca de idioma com a página aberta.
- [ ] **CA-02** [NF-IA-10]: na Início, `og:title` e `twitter:title` são iguais ao `<title>` nos três idiomas.
- [ ] **CA-03** [NF-IA-10]: o `<title>` estático do `index.html` é igual ao `meta.title` de `home` em `pt-BR`.
- [ ] **CA-04** [NF-IA-10]: o HTML pré-renderizado da Início (`pt-BR.html`, `en.html` e `es.html`) traz o título
      novo.
- [ ] **CA-05** [NF-IA-10]: `PageMeta` emite `<meta name="twitter:title">`, `twitter:description`, `twitter:image` e
      `twitter:image:alt` com o mesmo valor de `og:title`, `og:description`, `og:image` e `og:image:alt`, nos três
      idiomas. Com imagem e alt próprios (tela Projeto, captura), as `twitter:image*` acompanham a imagem recebida, não a
      padrão. `twitter:card` continua `summary_large_image`.
- [ ] **CA-06** [NF-IA-10]: o HTML pré-renderizado da Início nos três idiomas traz as quatro tags `twitter:*` iguais
      às `og:*`. O `404.html` não traz `twitter:title`, como já não traz `og:title`.
- [ ] **CA-07** [NF-IA-10, D26]: Início, Projetos, Informações e Contato declaram `og:image` e `twitter:image`
      apontando para `images/share/<idioma>/<página>.png`, com `og:image:width` 1200, `og:image:height` 630 e o alt da
      própria página no idioma (`<namespace>:meta.imageAlt`).
- [ ] **CA-08** [NF-IA-10, D26]: a tela Projeto com captura continua usando a captura. Sem captura, usa a imagem de
      Projetos do idioma, com o alt dela. As telas de documento seguem a mesma regra.
- [ ] **CA-09** [NF-IA-10]: para cada página (Início, Projetos, Informações e Contato) e idioma, o arquivo existe em
      `public/images/share/<idioma>/<página>.png` e é um PNG de 1200×630 com no máximo 100 KB.
- [ ] **CA-10** [R2]: os textos novos (`meta.imageAlt` de `home`, `projects`, `about` e `contact`) existem em `pt-BR`,
      `en` e `es`, e nenhuma chave fica sem uso.

## Estratégia de validação

- **Checagens automatizadas:** testes de tela (`Home.page.test.tsx`, páginas de Projetos, Informações, Contato e
  Projeto), `PageMeta.test.tsx`, o novo `useShareImage.test.tsx`, `buildShareImagePath.test.ts`, os testes de
  pré-renderização em `src/test/entry-server.test.tsx`, `scripts/test/indexHtmlMeta.test.ts` e
  `scripts/test/ogImage.test.ts`. O `qa` cobre os E2E (`e2e/home.spec.ts`, `e2e/language.spec.ts` e
  `e2e/no-javascript.spec.ts`) com `npm run build:fatec && npm run test:e2e`.
- **Checagens manuais do PO:**
    1. Aba do navegador em `/pt-BR`, `/en` e `/es` com o título novo (`npm run dev`).
    2. Código-fonte da Início, Projetos, Informações e Contato (Ctrl+U) com as tags `twitter:*` e o `og:image` da
       página. Opcionalmente, uma prévia de link com a URL publicada da `staging` (LinkedIn Post Inspector ou WhatsApp).
    3. Aprovação do desenho de cada uma das 12 imagens em `public/images/share/` **antes** do commit das imagens (T7).
- **Rollback / mitigação:** são dois PRs. O PR1 (título e tags do Twitter) e o PR2 (imagens) são independentes: reverter o PR2
  volta as páginas para `og-site.png` sem afetar o título nem as tags de texto.

## Questões em aberto

- **Q-A (decidida em 11/11/2026):** opção A, nome · cargo · stack, nos três idiomas.
- **Q-B (bloqueia o commit das imagens, T7):** aprovação do desenho das 12 imagens. A proposta é a mesma composição do
  `og-site.png` (faixa amarela no topo, gato, nome), com o nome da página abaixo do nome. Na Início, o texto abaixo
  do nome é o cargo e a stack.
- **Q-C (decidida em 11/11/2026: sem foto):** incluir a foto de perfil (`public/images/profile/photo-large.webp`) na imagem da Início ou
  de Informações. A proposta é **não incluir**: fica mais simples e não depende de aprovar um recorte. Se o PO quiser,
  entra só na imagem de Informações.

## Notas / decisões

- Aprovada pelo PO em 11/11/2026. Entrega em dois PRs: PR1 com o título (#198) e as tags de texto do Twitter (#138), `Closes #198` e `Refs #138`; PR2 com as 12 imagens de compartilhamento por página, em branch separada a partir do PR1, `Closes #138`.

Decisões aplicadas: D-05 (cargo) e a reversão da D-12 (imagem por página), ambas do dispatch da Onda 1 e decididas
pelo PO em 11/11/2026. Elas não são as `D05`/`D12` de `docs/design/decisions.md`. De `decisions.md` valem D24 (sem
ponto final) e D26 (`og:image` é a captura do projeto quando houver). Requisitos: RF-HOME-26, A11Y-G01 e NF-IA-10.

**(a) Quais telas e idiomas ganham imagem.**

- **Início, Projetos, Informações e Contato × `pt-BR`, `en` e `es`:** 12 imagens.
- **Projeto e documento:** mantêm a captura do projeto (D26), que já é uma imagem por projeto e mostra o projeto de
  verdade. Gerar uma imagem por projeto (capa e título) multiplicaria os arquivos por projeto e por idioma e exigiria
  rodar o script a cada projeto novo. Sem captura, a reserva é a imagem de Projetos do idioma, mais específica que
  `og-site.png`.
- **Não encontrada e erro:** sem imagem (`noindex`, sem Open Graph).
- **`og-site.png`:** continua como reserva padrão do `PageMeta`.

**(b) Produção e local das imagens.** Recomendado: **asset estático versionado** em
`public/images/share/<idioma>/<página>.png`, gerado pelo `scripts/generateOgImage.ts` estendido (`npm run og:image`).

- O script já monta um HTML com a fonte Bricolage embutida em base64 e o gato de `CatLogo.tsx`, e tira um screenshot
  1200×630 com o Chromium do `@playwright/test`. A extensão só repete isso por página e idioma, trocando o texto.
- Alternativa descartada: gerar no build. Exigiria o Chromium no `npm run build` e no CI do Pages e deixaria o build
  mais lento e frágil, para imagens que só mudam quando o texto muda.
- O teste do formato (CA-09) acusa imagem faltando ou fora do padrão.

**(c) Origem do conteúdo visual.**

- **Gerado sem depender do PO:**
    - as cores: `--neutral-050` (fundo), `--neutral-500` (corpo do gato), `--neutral-900` (texto e detalhes) e
      `--brand-primary` (faixa), lidas de `src/styles/global.css` em vez dos hex fixos de hoje;
    - a fonte self-hospedada e o gato de `CatLogo.tsx`;
    - os textos, lidos das chaves que já existem: `common:authorName`; na Início, `home:heading` e `home:hero.stack`;
      nas demais, `projects:heading`, `about:hero.label` e `contact:heading`.
- **Depende do PO:**
    - a aprovação do desenho de cada imagem (Q-B);
    - a revisão dos alts novos nos três idiomas;
    - a decisão sobre a foto (Q-C).
- O handoff fica fora do repositório e não é lido pelo script.

**(d) Dependência nova: nenhuma.** O script reaproveita `@playwright/test` (`^1.64.1`, já em `devDependencies` e já
usado pelo `og:image` e pelos E2E), `node:fs` e `node:path`. Checagem de "Dependências novas" do `CLAUDE.md`:

| Item                 | Resultado                                                                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manutenção           | Não se aplica: nenhum pacote entra.                                                                                                                                                     |
| Problemas conhecidos | Não se aplica.                                                                                                                                                                          |
| Compatibilidade      | Não se aplica.                                                                                                                                                                          |
| Necessidade e peso   | Nada entra no bundle. As imagens são estáticas, cerca de 31 KB cada (a referência é o `og-site.png`), num total próximo de 400 KB em `public/`. Só são baixadas por quem gera a prévia. |

**(e) Ligação no `<head>`.**

- `og:image` e `twitter:image` usam a prop `image` que o `PageMeta` já tem, e `og:image:alt`/`twitter:image:alt` usam
  `imageAlt`. Largura e altura ficam no padrão 1200×630.
- O caminho vem de uma função pura, `buildShareImagePath(page, language)` (`src/utils/`), que o script e o teste do
  formato também usam, para que nunca divirjam.
- As páginas pegam caminho e alt por um hook reutilizável, `useShareImage(page)` (`src/hooks/`). Assim a lógica não
  fica no JSX.

**(f) Validação do formato.** O `validateImages` (`src/services/content/validation/`) valida o **conteúdo** (imagens
de `projects.json` e `profile.json`, por snapshot). As imagens de compartilhamento não são conteúdo: são assets do
site, como o `og-site.png`. Por isso a validação estende `scripts/test/ogImage.test.ts`, que já confere o
`og-site.png`. Para cada página e idioma, o teste confere a existência, a assinatura PNG, o IHDR 1200×630 e o limite
de 100 KB. O limite de 100 KB dá folga sobre os ~31 KB de hoje e fica bem abaixo dos 300 KB que o WhatsApp aceita na
prévia. A lista de páginas vem do enum `SHARE_PAGES`. Página nova no enum sem arquivo gerado quebra o teste.

**Riscos.**

- **Rebase com o PR #236 (trilha D):** ele também altera `src/pages/test/Home.page.test.tsx`. O rebase é trivial
  (blocos de `it` diferentes), mas quem fizer o merge depois resolve o conflito nos `it` de título.
- **#141 (depois):** troca a expressão de idioma dentro de `PageMeta.tsx`. Esta spec só acrescenta tags e não mexe
  nessa linha.
- **E2E com texto fixo:** `e2e/support/uiTexts.ts` (`homeTitle`) e `e2e/language.spec.ts` (`title`) afirmam o título
  antigo. O `executor` atualiza essas constantes na T1, porque é troca de string e não spec nova. O `qa` roda e amplia
  os E2E.
- **Chromium local:** gerar as imagens exige `npm run playwright:install`. Os testes não geram imagem, só leem os
  arquivos versionados.
- **Tamanho do título na prévia do X:** o X corta títulos longos. A opção A perde só a stack no corte.
