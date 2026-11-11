# Spec: 200-id-unico-da-pessoa-nos-dados-estruturados

> **Tipo:** `bug` (Fix na branch e no commit principal) <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#200` (com `#199`) <br />
> **Criado em:** `11-11-2026`

Sem tela visível: a mudança está só no JSON-LD (`<script type="application/ld+json">`). O `qa` se aplica só para conferir o HTML pré-renderizado e os E2E existentes (nenhum E2E novo). A verificação manual do PO é opcional: abrir o código-fonte de `/pt-BR`, `/en/about` e `/es/contact` e achar o mesmo `@id` da `Person`. Branch `fix/200-id-unico-da-pessoa-nos-dados-estruturados`, nascida de `origin/staging` (`6c10b34`, já com a #134).

## Problema

Origem: auditoria de SEO de 10/11/2026 em felipe-sant.vercel.app (issues #200 e #199).

1. **Três `@id` para a mesma pessoa.** Cada construtor de JSON-LD em `src/utils/` monta o id como `${buildAbsoluteUrl(ROUTES.home, language)}#person`, o que dá `<site>/pt-BR#person`, `<site>/en#person` e `<site>/es#person`. Para os buscadores são três pessoas diferentes, e o perfil completo (descrição, imagem, formação) só fica ligado à de Informações de cada idioma. A documentação já pede um id único, `<URL canônica de />#person`, "o mesmo em todas as telas e idiomas" (decisão transversal do PO de 11-10-2026, em `docs/screens/home.md`, `about.md`, `contact.md`, `projects.md`, `project.md` e `docs/architecture/frontend.md`): o código se afastou da documentação, que só não dizia de forma explícita que essa URL é a raiz do site sem o prefixo de idioma.
2. **`email` com `mailto:`.** `buildContactJsonLd` declara `email: "mailto:<e-mail>"`; o schema.org espera o endereço puro.
3. **Palavra repetida no projeto.** `buildProjectJsonLd` põe toda a stack em `keywords` e as linguagens também em `programmingLanguage`, então "TypeScript" aparece nos dois campos. Um mesmo nome em dois grupos da stack também se repete dentro de `keywords`.
4. **#199, cargo.** A decisão do PO registrada pelo Master como **D-05** (não confundir com a `D05` de `docs/design/decisions.md`, formulário de contato desligado) fixou o cargo "Desenvolvedor full stack Júnior", e a #134 já alinhou `home:heading` e `profile.role` nos três idiomas. `src/services/content/test/content.test.ts` confere a igualdade nos arquivos de origem e `e2e/home.spec.ts` (RF-HOME-26) confere no navegador, mas nenhum teste de unidade confere o `jobTitle` que os construtores de fato emitem em Início e Informações.

## Objetivo

- Um único `@id` da `Person`, `<getSiteUrl()><base>/#person` (raiz do site com o `base` do Vite, sem prefixo de idioma), produzido por uma função pura `buildPersonId()` e usado pelos seis construtores, em todas as telas e nos três idiomas.
- `email` do JSON-LD de Contato sem `mailto:`.
- Nenhum termo repetido entre `keywords` e `programmingLanguage`, nem dentro de cada um.
- Um teste com o conteúdo real que prove o mesmo `jobTitle` e o mesmo `@id` em Início e Informações nos três idiomas, sem estágio no cargo.
- Documentação com o formato exato do id, o e-mail sem `mailto:` e a regra de `keywords`.

## Fora de escopo

- `@id` para `WebSite`, `ProfilePage` ou `ContactPage`, e qualquer campo novo na `Person` (como `image` ou `description` na Início): a #201, a #208 e a #202 mexem nos mesmos construtores depois desta.
- Os links `mailto:` da interface (`ContactChannels`, `Footer`, markdown): eles continuam com `mailto:`, que é o certo para `href`.
- Texto de UI, `src/locales/`, `public/content/` e o CV: nada muda (R2 não se aplica; o cargo já foi alinhado pela #134).
- `docs/design/decisions.md` e o protótipo.
- E2E novo: `e2e/home.spec.ts` (RF-HOME-26) já compara o `jobTitle` no navegador e nenhum E2E afirma `#person` nem o `email` do JSON-LD.
- O changeset (`patch`) é feito pelo Dev ao abrir o PR, não por uma tarefa desta spec.

## Decisões

- **Formato do id.** `buildPersonId()` em `src/utils/buildPersonId.ts`, sem parâmetro, devolve `` `${getSiteUrl()}${publicUrl("/")}#person` ``. `publicUrl("/")` já devolve `/` ou `/<base>/` com uma barra final só, e `getSiteUrl()` já tira a barra final da origem: com `base` `/` sai `https://felipe-sant.vercel.app/#person`; com `base` `/ra2581392423047/` sai `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/#person`. Não usa `buildAbsoluteUrl`, que sempre acrescenta o prefixo de idioma.
- **`url` da `Person`.** Continua a canônica da Início no idioma (`buildAbsoluteUrl(ROUTES.home, language)`), em Início e Informações. A raiz `/` só redireciona e não é canônica, então não serve como `url`. Consequência aceita: com um id só, o buscador junta as três `Person` numa entidade com três `url`, três `jobTitle` e três `description`, que são traduções do mesmo dado e não contradições. É o que a issue pede.
- **`WebSite` da Início.** `publisher` passa a `{ "@id": buildPersonId() }`; o `url` do `WebSite` continua a Início no idioma.
- **`keywords` e `programmingLanguage`.** `programmingLanguage` continua só em `SoftwareSourceCode` (com repositório) e sem nome repetido. Quando ele é emitido, `keywords` são os nomes da stack sem repetição e sem os que estão em `programmingLanguage`; quando não é emitido (`CreativeWork`, ou repositório sem linguagem marcada), `keywords` mantém todos os nomes da stack, sem repetição. Se `keywords` ficar vazio, o campo é omitido (`undefined`), nunca `[]`. A comparação é pelo nome exato.
- **Estágio (#199).** Depois da #134 o conteúdo não tem mais estágio (`public/content/*/timeline.json` sem "estagi", "intern" ou "pasant"). O critério "o segundo papel vai em `worksFor` ou `hasOccupation`" fica atendido pela estrutura que já existe: `jobTitle` é um valor só (`profile.role` em Informações, `home:heading` na Início), as experiências vão para `hasOccupation` e o empregador atual para `worksFor`. O teste novo trava isso.
- **Onde fica o teste da #199.** Em `src/test/entry-server.content.test.tsx`, que já pré-renderiza os alvos com o conteúdo real de `public/` (`installPublicFetch`, `listTargets`) e só renderiza, sem hidratar (não fere a regra de `docs/setup/testing.md` sobre `render` e hidratação no mesmo arquivo). Ele lê o JSON-LD do HTML de `<idioma>.html` e de `<idioma>/about.html`. É um teste de caracterização: passa na primeira execução, porque a #134 já alinhou os textos (ver T5).

## Critérios de aceite

Requisitos: NF-IA-08 e NF-IA-09 (`docs/product/non-functional-requirements.md`), RF-HOME-26 (`docs/screens/home.md`), RF-ABOUT-29 (`docs/screens/about.md`), RF-CONTACT-26 (`docs/screens/contact.md`) e o JSON-LD de `docs/screens/projects.md` e `docs/screens/project.md`.

- [ ] **CA1 (NF-IA-08):** `buildPersonId()` devolve `<origem>/#person` com `base` `/`, `<origem>/<base>/#person` com `base` de subpasta (o `base` uma vez só) e nunca `//` depois do esquema, mesmo com `VITE_SITE_URL` terminada em `/`.
- [ ] **CA2 (NF-IA-08, RF-HOME-26):** na Início, `Person["@id"]` e `WebSite.publisher["@id"]` são `buildPersonId()` nos três idiomas; `Person.url` e `WebSite.url` continuam a Início no idioma.
- [ ] **CA3 (RF-ABOUT-29):** em Informações, `mainEntity["@id"]` é `buildPersonId()` nos três idiomas e `mainEntity.url` continua a Início no idioma.
- [ ] **CA4 (RF-CONTACT-26):** em Contato, `mainEntity["@id"]` é `buildPersonId()` e `mainEntity.email` é o e-mail do perfil sem `mailto:`; sem perfil, `email` continua omitido.
- [ ] **CA5 (NF-IA-08, Projetos):** em Projetos, `author["@id"]` é `buildPersonId()`.
- [ ] **CA6 (NF-IA-08, Projeto):** no projeto e no documento (`TechArticle`), `author["@id"]` é `buildPersonId()`.
- [ ] **CA7 (NF-IA-08, Projeto):** com repositório e linguagem marcada, `keywords` não contém nenhum nome de `programmingLanguage` (fixture com React e TypeScript: `keywords` `["React"]`, `programmingLanguage` `["TypeScript"]`); sem repositório, `keywords` traz toda a stack (`["React", "TypeScript"]`); nome repetido entre grupos aparece uma vez em cada lista; stack só de linguagens com repositório omite `keywords`.
- [ ] **CA8 (RF-HOME-26, RF-ABOUT-29, #199):** com o conteúdo real, nos três idiomas, o `jobTitle` do JSON-LD pré-renderizado da Início é igual ao de Informações e a `home:heading` do idioma, não tem termo de estágio (`/estagi|internship|\bintern\b|pasante|pasant[ií]a/i`), o `@id` da `Person` é o mesmo nas duas páginas e igual a `buildPersonId()`, e `worksFor` de Informações traz o empregador atual (a `organization` da experiência em curso).
- [ ] **CA9 (NF-IA-08):** nenhum teste nem código em `src/` monta mais o id com o prefixo de idioma (`grep -rn '#person' src e2e scripts` só mostra `buildPersonId.ts` e testes que usam `buildPersonId()` ou o literal `<origem>/#person`).
- [ ] **CA10:** `docs/screens/home.md`, `about.md`, `contact.md`, `projects.md`, `project.md` e `docs/architecture/frontend.md` descrevem o id como a raiz do site com o `base` e sem idioma (`<origem><base>/#person`, por `buildPersonId()`), o exemplo de Contato traz `email` sem `mailto:` e `project.md` diz que `keywords` exclui as linguagens de `programmingLanguage`.

## Estratégia de validação

- **Checagens automatizadas:** testes de `src/utils/test/` (seis construtores e `buildPersonId`), de página (`Home`, `Contact`, `Projects`), de pré-renderização (`src/test/entry-server.test.tsx` e `src/test/entry-server.content.test.tsx`), e a verificação completa `npm run build && npm run test:cov`.
- **Checagens manuais (opcional, PO):** `npm run build` e abrir `dist/pt-BR.html`, `dist/en/about.html` e `dist/es/contact.html` (ou o código-fonte no navegador): o mesmo `"@id":"<origem>/#person"` nos três, e `"email"` sem `mailto:`. Validação externa no Schema Markup Validator depois do deploy (NF-IA-08).
- **Rollback:** reverter o commit principal; nenhum dado nem texto muda.

## Questões em aberto

- Nenhuma bloqueante. O PO pode preferir outra `url` para a `Person` (por exemplo, a Início em `en` em todos os idiomas, por ser o `x-default`); a spec mantém a Início do idioma pelo motivo em "Decisões".

## Notas / decisões

- Arquivos de código tocados: `src/utils/buildPersonId.ts` (novo) e os seis `src/utils/build{About,Contact,Document,Home,Project,Projects}JsonLd.ts`. Testes: `src/utils/test/buildPersonId.test.ts` (novo), os seis `src/utils/test/build*JsonLd.test.ts`, `src/pages/test/Home.page.test.tsx` (linha 223), `src/pages/test/Contact.page.test.tsx` (linha 224), `src/pages/test/Projects.page.test.tsx` (linha 622), `src/test/entry-server.test.tsx` (linha 218) e `src/test/entry-server.content.test.tsx`. `src/pages/hooks/test/useHome.test.tsx` só confere o `jobTitle` e não muda. Nenhum E2E afirma `#person` ou o `email` do JSON-LD.
- Sem dependência nova.
- Conflito previsto com a trilha E (também mexe em `Home.page.test.tsx`): rebase trivial. #201, #208 e #202 esperam esta.
- Commits: o principal `Fix :bug: [#200] Unifica o id da pessoa e corrige e-mail e palavras-chave dos dados estruturados` (T1 a T4) e o segundo `Test :test_tube: [#199] Confere o mesmo cargo em Início e Informações nos três idiomas` (T5). O PR fecha as duas issues (`Closes #200`, `Closes #199`).
