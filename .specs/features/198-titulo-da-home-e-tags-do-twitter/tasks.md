# Tasks: título da home, tags do Twitter e imagem de compartilhamento por página

> Spec: `./spec.md`

## Plano de execução

O PR tem três commits atômicos, nesta ordem. Nenhum estado vermelho é commitado: cada teste é escrito antes do código
e o commit só sai com o gate verde. Nenhum exemplo nem arquivo leva comentário em código. O changeset (`patch`) não é
tarefa do `executor`.

```
Commit 1 (#198)   T1 → T2   Feat :sparkles: [#198] Inclui função e stack no título da página inicial
Commit 2 (#138)   T3 → T4   Feat :sparkles: [#138] Completa as tags de compartilhamento do Twitter
Commit 3 (#138)   T5 → T6 → (aprovação do PO, Q-B) → T7 → T8 → T9
                            Feat :sparkles: [#138] Gera uma imagem de compartilhamento por página
Fim               T10 Verificação completa
```

O título usa a opção A da spec. Se o PO escolher B ao aprovar, troque só a string nos mesmos arquivos.

## Tarefas

- [x] T1: título da Início com nome, cargo e stack nos três idiomas
    - **Arquivo(s):**
        - textos: `src/locales/pt-BR/home.json`, `src/locales/en/home.json` e `src/locales/es/home.json` (só
          `meta.title`);
        - página e testes: `index.html` (`<title>`), `src/pages/test/Home.page.test.tsx`, `src/test/App.test.tsx`
          (linha ~67), `src/prerender/test/mountClient.test.tsx` (linha ~147), `src/test/entry-server.test.tsx` e
          `scripts/test/indexHtmlMeta.test.ts`;
        - constantes dos E2E: `e2e/support/uiTexts.ts` (`homeTitle` nos três idiomas) e `e2e/language.spec.ts`
          (`title` nos três idiomas).
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - CA-01: em `es`, com `setLanguage("es")` dentro do `it`, `document.title` é "Luiz Felipe dos Santos ·
          Desarrollador full stack junior · React, TypeScript y Node.js" (`src/pages/test/Home.page.test.tsx`).
        - CA-01: em `pt-BR`, `document.title` é "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior · React,
          TypeScript e Node.js" (`Home.page.test.tsx`, substitui a asserção atual).
        - CA-01: em `en`, `document.title` é "Luiz Felipe dos Santos · Junior full stack developer · React, TypeScript
          and Node.js" (`Home.page.test.tsx`).
        - CA-01: com a página aberta, depois de `act(() => setLanguage("es"))`, `document.title` muda para o título
          `es` (`Home.page.test.tsx`, `it` de troca de idioma).
        - CA-02: em `pt-BR`, `en` e `es` (`it.each`), `og:title` é igual a `document.title` (`Home.page.test.tsx`).
        - CA-03: o `<title>` do `index.html` é igual a `HOME_PT_BR.meta.title`. A comparação lê o JSON e não fixa a
          string (`scripts/test/indexHtmlMeta.test.ts`).
        - CA-04: `pt-BR.html`, `en.html` e `es.html` contêm `<title>` com o título do idioma
          (`src/test/entry-server.test.tsx`, `it.each` ao lado do de canônica).
        - Regressão: `src/test/App.test.tsx` e `src/prerender/test/mountClient.test.tsx` afirmam o título `pt-BR` novo.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/pages/test/Home.page.test.tsx src/test/App.test.tsx src/prerender/test/mountClient.test.tsx src/test/entry-server.test.tsx scripts/test/indexHtmlMeta.test.ts`
    - **Feito quando:**
        - o gate passa;
        - `grep -rn "Portf[oó]lio · Luiz\|Portafolio · Luiz" src e2e scripts index.html` não retorna nada;
        - a `description` e o `heading` de `home.json` não mudaram.
    - **Evidência:** typecheck e lint verdes; 5 arquivos do gate, 140 testes verdes; o grep não acha o título antigo; o teste do `index.html` compara o `<title>` sem os espaços da quebra de linha do Prettier.

- [x] T2: documentação do título
    - **Arquivo(s):** `docs/screens/home.md` (tabela de chaves, linha ~199, e "Metadados e dados estruturados", linha
      ~302) e `docs/screens/layout.md` (tabela de rotas, linha ~301, e o parágrafo das linhas ~310–311)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:**
        - os dois documentos citam o título novo nos três idiomas e dizem que `twitter:title` é igual a ele;
        - a regra "a raiz é a exceção ao formato `<Tela> · Luiz Felipe dos Santos`" continua;
        - T1 e T2 saem juntas no commit `Feat :sparkles: [#198] Inclui função e stack no título da página inicial`.
    - **Evidência:** `home.md` e `layout.md` com o título novo nos três idiomas; a menção a `twitter:title` fica para a T4, que cria a tag.

- [x] T3: `PageMeta` emite `twitter:title`, `twitter:description`, `twitter:image` e `twitter:image:alt`
    - **Arquivo(s):** `src/components/PageMeta.tsx`, `src/components/test/PageMeta.test.tsx` e
      `src/test/entry-server.test.tsx`
    - **Depende de:** T2 (commit 1 fechado)
    - **Testes (escritos antes, RED):**
        - CA-06 (fronteira): `404.html` não contém `twitter:title`, `twitter:image` nem `twitter:description`
          (`src/test/entry-server.test.tsx`, no `it` "não declara canônica, hreflang, Open Graph nem JSON-LD").
        - CA-05: com imagem e alt próprios (`it` "usa a imagem, o alt e as dimensões recebidos"), `twitter:image` é
          `${SITE_URL}/images/projects/x-large.webp` e `twitter:image:alt` é "Captura do projeto"
          (`src/components/test/PageMeta.test.tsx`).
        - CA-05: em `pt-BR`, `en` e `es` (`it.each`), `twitter:title`, `twitter:description`, `twitter:image` e
          `twitter:image:alt` são iguais a `og:title`, `og:description`, `og:image` e `og:image:alt`
          (`PageMeta.test.tsx`).
        - CA-05: as quatro tags usam o atributo `name` (`meta[name="twitter:title"]`), não `property`, e
          `twitter:card` continua `summary_large_image` (`PageMeta.test.tsx`).
        - CA-05: com a página aberta, depois de `setLanguage("en")`, `twitter:image:alt` passa a "Cat next to the name
          Luiz Felipe dos Santos" (`PageMeta.test.tsx`, `it` de troca de idioma).
        - CA-06: `pt-BR.html`, `en.html` e `es.html` contêm `<meta name="twitter:title" content="<título do
idioma>"/>` e `twitter:image` com a mesma URL do `og:image`, como o React serializa
          (`src/test/entry-server.test.tsx`, junto do `it.each` de canônica).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/components/test/PageMeta.test.tsx src/test/entry-server.test.tsx`
    - **Feito quando:**
        - o gate passa;
        - `PageMeta.tsx` emite exatamente quatro tags `twitter:*` novas, todas com valor derivado das mesmas
          variáveis que alimentam as `og:*` (`title`, `description`, `imageUrl` e o alt resolvido), sem duplicar a
          lógica do alt.
    - **Evidência:** RED com 9 testes falhando antes do código; depois typecheck, lint e 97 testes verdes nos dois arquivos do gate; o alt é resolvido uma vez (`resolvedImageAlt`) e alimenta `og:image:alt` e `twitter:image:alt`.

- [x] T4: documentação das tags do Twitter
    - **Arquivo(s):** `docs/architecture/frontend.md` (linhas ~62 e ~345), `docs/screens/layout.md` (linhas ~289 e
      ~423) e `docs/product/non-functional-requirements.md` (NF-IA-10, linha ~260)
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:**
        - os três documentos citam `twitter:title`, `twitter:description`, `twitter:image` e `twitter:image:alt`
          iguais às `og:*`, ao lado de `twitter:card`;
        - T3 e T4 saem juntas no commit `Feat :sparkles: [#138] Completa as tags de compartilhamento do Twitter`.
    - **Evidência:** `frontend.md` (Metadados e SEO por tela), `layout.md` (regras e checklist NF-IA-10) e NF-IA-10 citam as quatro `twitter:*` iguais às `og:*`.

- [ ] T5: lista de páginas com imagem e caminho da imagem
    - **Arquivo(s):**
        - lista e tipo: `src/enum/sharePages.enum.ts` (`SHARE_PAGES = ["home", "projects", "about", "contact"] as
const`) e `src/types/seo/SharePage.types.ts` (tipo derivado do enum);
        - função: `src/utils/buildShareImagePath.ts` e o teste `src/utils/test/buildShareImagePath.test.ts`.
    - **Depende de:** T4 (commit 2 fechado)
    - **Testes (escritos antes, RED):**
        - CA-07: `buildShareImagePath("home", "pt-BR")` devolve `images/share/pt-BR/home.png`, sem barra inicial,
          relativo como o `DEFAULT_IMAGE` do `PageMeta` (`src/utils/test/buildShareImagePath.test.ts`).
        - CA-07: para cada página de `SHARE_PAGES` e cada idioma de `SUPPORTED_LANGUAGES`, o caminho é único
          (`buildShareImagePath.test.ts`).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/utils/test/buildShareImagePath.test.ts`
    - **Feito quando:** o gate passa, e o enum, o tipo e a função têm um `export default` cada um.
    - **Evidência:**

- [ ] T6: o gerador produz as 12 imagens com as cores dos tokens, com o teste do formato antes
    - **Arquivo(s):**
        - função de cores: `scripts/readColorTokens.ts` (pura, lê `--neutral-050`, `--neutral-500`, `--neutral-900` e
          `--brand-primary` do texto de `src/styles/global.css`) e o teste `scripts/test/readColorTokens.test.ts`;
        - teste do formato: `scripts/test/ogImage.test.ts`;
        - gerador: `scripts/generateOgImage.ts` e a saída `public/images/share/**`.
    - **Depende de:** T5
    - **Testes (escritos antes, RED):**
        - CA-09 (fronteira): `readColorTokens` lança `Error` em português, com o nome do token, quando um dos quatro
          falta (`scripts/test/readColorTokens.test.ts`).
        - CA-09: `readColorTokens` devolve os hex de `:root` (`#fbf9f5`, `#7c7770`, `#202020` e `#ffcc00`) a partir do
          `global.css` real, sem pegar os valores do tema escuro (`readColorTokens.test.ts`).
        - CA-09 (fronteira): para cada página de `SHARE_PAGES` e cada idioma, o arquivo existe em
          `public/<buildShareImagePath(page, language)>` (`scripts/test/ogImage.test.ts`). O teste é escrito **antes**
          de rodar o gerador e é visto vermelho, porque `public/images/share/` ainda não existe.
        - CA-09: cada arquivo tem assinatura PNG, IHDR 1200×630 e no máximo 100 KB (`ogImage.test.ts`, `it.each`
          sobre página × idioma).
        - Regressão: o `it` existente do `og-site.png` continua passando.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/readColorTokens.test.ts scripts/test/ogImage.test.ts`
    - **Feito quando:**
        - o gate passa depois de `npm run og:image` (com Chromium instalado por `npm run playwright:install`), que gera
          `og-site.png` e as 12 imagens em `public/images/share/<idioma>/<página>.png`, com o caminho de
          `buildShareImagePath`;
        - os textos vêm das chaves listadas na spec, item (c);
        - os hex fixos saem do script;
        - **o `executor` para e pede ao PO a aprovação do desenho das 12 imagens (Q-B), sem commitar nada**. A sessão
          principal mostra as imagens ao PO e só segue para T7 com a aprovação.
    - **Evidência:**

- [ ] T7: aprovação do PO sobre as imagens (Q-B)
    - **Arquivo(s):** `scripts/generateOgImage.ts` e `public/images/share/**`, só se o PO pedir ajuste
    - **Depende de:** T6
    - **Testes (escritos antes, RED):** não se aplica (aparência; o formato já é provado pelo teste da T6)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/ogImage.test.ts`
    - **Feito quando:** o PO aprovou o desenho das 12 imagens. Se ele pediu ajuste, o gerador foi alterado, as imagens
      foram regeneradas com `npm run og:image` e o gate continua verde.
    - **Evidência:**

- [ ] T8: as quatro telas declaram a própria imagem, e Projeto usa a de Projetos como reserva
    - **Arquivo(s):**
        - hook: `src/hooks/useShareImage.ts` (recebe a página e devolve `{ image, imageAlt }`, com o idioma ativo e
          o alt de `<página>:meta.imageAlt` por um `Record<SharePage, ...>` de chaves literais tipadas, sem cast nem
          chave montada por template; os namespaces são carregados estaticamente em `src/i18n/resources.ts`, então
          `projects` está disponível na tela Projeto) e o teste `src/hooks/test/useShareImage.test.tsx`;
        - páginas: `src/pages/Home.page.tsx`, `src/pages/Projects.page.tsx`, `src/pages/About.page.tsx`,
          `src/pages/Contact.page.tsx`, `src/pages/Project.page.tsx` (reserva quando não há captura) e, se a reserva
          precisar de lógica, `src/pages/hooks/useProject.ts`;
        - textos: `meta.imageAlt` em `src/locales/{pt-BR,en,es}/{home,projects,about,contact}.json`;
        - testes de página: `src/pages/test/Home.page.test.tsx`, `Projects.page.test.tsx`, `About.page.test.tsx`,
          `Contact.page.test.tsx`, `Project.page.test.tsx`, além de `src/test/entry-server.test.tsx`.
    - **Depende de:** T7
    - **Textos novos (`pt-BR` como referência; `en` e `es` com o mesmo sentido; o PO revisa):**
        - `home:meta.imageAlt`: "Gato ao lado do nome Luiz Felipe dos Santos, do cargo e da stack";
        - `projects:meta.imageAlt`: "Gato ao lado do nome Luiz Felipe dos Santos e do título Projetos";
        - `about:meta.imageAlt`: "Gato ao lado do nome Luiz Felipe dos Santos e do título Informações";
        - `contact:meta.imageAlt`: "Gato ao lado do nome Luiz Felipe dos Santos e do título Contato".
    - **Testes (escritos antes, RED):**
        - CA-08 (fronteira): na tela Projeto de um projeto sem imagens, `og:image` e `twitter:image` são
          `${SITE_URL}/images/share/pt-BR/projects.png` e o alt é o de `projects:meta.imageAlt`
          (`src/pages/test/Project.page.test.tsx`).
        - CA-08: na tela Projeto com captura, `og:image` continua a captura (o teste existente continua passando)
          (`Project.page.test.tsx`).
        - CA-07: `useShareImage("contact")` em `es` devolve `images/share/es/contact.png` e o alt `es`
          (`src/hooks/test/useShareImage.test.tsx`, com `setLanguage` dentro do `it`).
        - CA-07: na Início em `pt-BR`, `en` e `es` (`it.each`), `og:image` é `${SITE_URL}/images/share/<idioma>/home.png`
          e `og:image:alt` é o texto do idioma (`src/pages/test/Home.page.test.tsx`).
        - CA-07: o mesmo para Projetos, Informações e Contato, um `it` por tela, em `pt-BR`, afirmando o texto em
          português (`Projects.page.test.tsx`, `About.page.test.tsx` e `Contact.page.test.tsx`).
        - CA-07 e CA-10: `en.html`, `es.html` e `pt-BR/contact.html` pré-renderizados contêm o `og:image` e o
          `twitter:image` da página no idioma (`src/test/entry-server.test.tsx`).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/hooks/test/useShareImage.test.tsx src/pages/test/Home.page.test.tsx src/pages/test/Projects.page.test.tsx src/pages/test/About.page.test.tsx src/pages/test/Contact.page.test.tsx src/pages/test/Project.page.test.tsx src/test/entry-server.test.tsx`
    - **Feito quando:**
        - o gate passa;
        - nenhuma página monta o caminho da imagem no JSX (só chama o hook);
        - as quatro chaves `meta.imageAlt` existem nos três idiomas;
        - `common:meta.imageAlt` continua em uso pelo `PageMeta` como alt padrão.
    - **Evidência:**

- [ ] T9: documentação das imagens por página
    - **Arquivo(s):** `docs/architecture/frontend.md` (seção "Metadados de SEO" e "SEO por tela"),
      `docs/setup/development.md` (`npm run og:image`, linhas ~73 e ~174), `docs/screens/layout.md` (`og:image` por
      página) e `docs/product/non-functional-requirements.md` (NF-IA-10)
    - **Depende de:** T8
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:**
        - os documentos dizem que Início, Projetos, Informações e Contato têm imagem própria por idioma em
          `public/images/share/`, gerada por `npm run og:image` e versionada;
        - dizem que Projeto e documento usam a captura e, sem ela, a imagem de Projetos;
        - dizem que `og-site.png` continua como reserva;
        - T5 a T9 saem juntas no commit `Feat :sparkles: [#138] Gera uma imagem de compartilhamento por página`, o
          último do PR.
    - **Evidência:**

- [ ] T10: verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada da feature)
    - **Feito quando:** o gate passa. Depois dele, a sessão principal sobe `npm run dev` para a verificação manual do PO
      (spec, "Checagens manuais") e o `qa` roda os E2E.
    - **Evidência:**
