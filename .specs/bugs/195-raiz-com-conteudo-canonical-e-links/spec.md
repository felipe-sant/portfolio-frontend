# Spec: raiz com conteúdo, canonical e links

> **Tipo:** `bug` <br />
> **Status:** `implementada` <br />
> **Issue:** `#195` <br />
> **Criado em:** `11-11-2026`

Tem tela: sim, mas só sem JavaScript (a raiz `/` com JavaScript continua redirecionando e ninguém a vê). O `qa` verifica a raiz com JavaScript desligado.

## Problema

Comportamento atual, lido no código da `staging` (depois da #140):

- `index.html` tem `<html lang="pt-BR">`, um script inline que, só quando `location.pathname === base`, escolhe o idioma (escolha salva, depois `navigator.languages`, depois `navigator.language`, depois `en`) e faz `location.replace(base + idioma + search + hash)`, um `<noscript>` com o aviso de `common:noscript` em `pt-BR` e `<div id="root"></div>` vazio. Não há `canonical`, `hreflang` nem link algum.
- `npm run build` copia esse arquivo para `dist/index.html` (Vite) e o `scripts/prerender.ts` o usa como **molde** (`template`) para `pt-BR.html`, `en.html`, `es.html`, as demais rotas e o `404.html` (`composePage`). A raiz nunca é alvo de pré-renderização: `ROUTES.root` em `src/routers/routes.tsx` só tem `redirectRootLoader`, e `listTargets` só emite as rotas do registro mais o `404.html`.
- Quem não executa JavaScript (robôs de IA, prévia de link, alguns rastreadores) recebe na raiz uma página vazia, com `lang="pt-BR"` mesmo quando o destino é `en` ou `es`, sem canonical, sem `hreflang` e sem caminho para os três idiomas. A auditoria de SEO de 10/11/2026 acusou isso em quatro relatórios (técnico, sitemap, GEO e agêntico).
- O sitemap (`listSitemapEntries`) só lista alvos com `pattern`, então a raiz não está nele (e `e2e/machine-files.spec.ts` já afirma isso); isso fica como está.
- A documentação diz hoje o contrário do que se quer: `NF-IN-09` ("A raiz `/` não é conteúdo, só redireciona"), `NF-IA-17` ("o `index.html` da raiz fica em `pt-BR`") e `NF-IA-01` (lista `/` entre as rotas com HTML por idioma, o que é a Início `/<idioma>`).

## Objetivo

Sem JavaScript, o HTML servido em `/` (e em `/<repo>/` no Pages da Fatec) passa a ter `<html lang="en">`, título e descrição em `en`, `canonical`, `hreflang` e um `<noscript>` com um link para cada um dos três idiomas. Com JavaScript, nada muda: o script inline continua redirecionando pelo idioma salvo ou do navegador.

Decisões desta spec (aplicam `NF-IA-11`, `NF-IA-17`, `NF-IN-05`, `NF-IN-09`, `NF-HO-02` e as decisões do `docs/design/decisions.md` sobre idioma no caminho, `D31` e `D32`):

1. **Onde nasce o HTML da raiz:** o `index.html` do repositório **não muda** (continua o molde das demais páginas e continua com os 3 scripts inline, então os hashes da CSP de `vercel.json` não mudam). A raiz de `dist/` é gerada no fim de `scripts/prerender.ts`, depois de todos os alvos e do `404.html`, por uma função pura nova `composeRootPage` aplicada ao mesmo molde. Assim o molde lido em memória nunca carrega canonical nem `<noscript>` de links para as outras páginas, nem para o `404.html`.
2. **Não entra em `listTargets` nem no registro de pré-renderização:** a raiz não é rota com tela (continua `redirectRootLoader` em `routes.tsx`, que **não é alterado**) e não vai para o sitemap, o `llms.txt` nem o `robots.txt`. Por isso a #195 não conflita com a #140 em `routes.tsx` (ela já foi mesclada e esta não o toca).
3. **`lang`:** `en`, o idioma do `x-default` e do `fallbackLng`. O `<title>` e a `<meta name="description">` da raiz vêm de `src/locales/en/home.json` (`meta.title`, `meta.description`), lidos no build como `readNoscriptText` já lê `common.json`. O `index.html` de origem continua com os textos `pt-BR` (`scripts/test/indexHtmlMeta.test.ts` não muda).
4. **Canonical e `hreflang`:** `canonical` aponta para `/en` (`<origem><base>en`), as quatro `<link rel="alternate" hreflang>` são `pt-BR`, `en`, `es` e `x-default` (este para `/en`, como `NF-IA-11` e o `PageMeta`). Motivo do canonical em `/en`: a raiz não é uma página própria, só leva a um idioma; apontar para o idioma padrão evita uma URL a mais no índice. As URLs são absolutas, montadas com `resolveSeoOrigin()` (mesma fonte do sitemap), o `base` de `resolveBase` e `buildSeoUrl` + `buildPath`; no Pages da Fatec saem sob `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/`. A `staging` herda a `VITE_SITE_URL` do build (a canônica dela já aponta para a produção, `NF-IA-14`) e continua com `noindex`.
5. **Open Graph mínimo** (para as prévias de link citadas na issue): `og:title`, `og:description`, `og:type` (`website`), `og:url` (= canonical) e `og:image` (a `images/og-site.png` da #138, absoluta). Sem `og:locale`, `twitter:*` nem JSON-LD na raiz.
6. **`<noscript>` da raiz** substitui o aviso de `common:noscript` (a raiz não tem conteúdo a avisar sobre) por: um `<h1>` e uma `<nav>` com uma lista de três `<a href hreflang lang>`, cada um no próprio idioma. O `<noscript>` fica dentro do `<body>`, como hoje (`body > noscript`). Texto por chave de tradução, em `common` nos três idiomas (R2; `pt-BR` é a referência):

    | Chave          | pt-BR                        | en                            | es                           |
    | -------------- | ---------------------------- | ----------------------------- | ---------------------------- |
    | `root.heading` | Luiz Felipe dos Santos       | Luiz Felipe dos Santos        | Luiz Felipe dos Santos       |
    | `root.link`    | Ver o portfólio em português | View the portfolio in English | Ver el portafolio en español |

    O rótulo acessível da `<nav>` vem de `languageSelector.label` do `en` ("Language"). Voz e copy: primeira pessoa não se aplica aqui, botão com verbo no infinitivo + objeto, sem emoji nem ponto final. Nenhuma chave sai de uso (`common:noscript` continua usada nas demais páginas).

7. **Script de redirecionamento:** inalterado. Fica no `<head>` antes de tudo e só age quando `location.pathname === base`; no navegador com JavaScript a pessoa é levada ao idioma antes de ver o `<noscript>`. `rootRedirect.test.ts` e `language.spec.ts` ("raiz e caminho sem prefixo") continuam sendo o contrato.
8. **404.html e `base` do Pages:** o `404.html` continua composto do molde limpo (sem canonical de raiz nem links), e o `composeRootPage` só roda sobre `<base>index.html`, então o 404 não herda nada. Sob `/ra2581392423047/` os `href` do `<noscript>` e as URLs absolutas levam o `base` (`/ra2581392423047/en`); os links relativos ao `base` usam o mesmo `buildPath` das demais páginas, nunca caminho escrito à mão.
9. **Redirecionamento HTTP na Vercel (sugestão da issue): descartado nesta spec.** Redirecionar `/` por `Accept-Language` em `vercel.json` só valeria na Vercel; o Pages da Fatec (a v1) não aceita regra de servidor, então o comportamento diferiria entre ambientes e a raiz continuaria vazia na entrega da faculdade. Também mexeria em `vercel.json`, que a #194, #197 e #163 disputam. Pode voltar como melhoria da V2 (ver "Questões em aberto"). `<meta http-equiv="refresh">` também descartado: mandaria robôs sem JavaScript embora da página que deve ter conteúdo, sem escolher idioma.

## Fora de escopo

- Redirecionamento HTTP/`vercel.json`, `Accept-Language` no servidor.
- Colocar a raiz no `sitemap.xml`, `llms.txt` ou `robots.txt`.
- Trocar o `index.html` de origem (lang, título, descrição, scripts) ou os hashes da CSP.
- Alterar `routes.tsx`, `redirectRootLoader` ou `getPreferredLanguage`.
- Conteúdo além do `<h1>` e dos três links; JSON-LD, `twitter:*` e `og:locale` na raiz.
- Camada de dados (`readJson`, `package.json`, #162) e `404.html`.

## Casos de borda

- QUANDO o build usa `BASE_PATH=/ra2581392423047/` ENTÃO canonical, `hreflang` e `href` do `<noscript>` levam o `base` e a origem `https://fatec-jacarei-dsm-portfolio.github.io`.
- QUANDO o `composeRootPage` roda duas vezes sobre o mesmo HTML ENTÃO o resultado é igual ao de uma vez (nenhum `canonical`, `hreflang` ou `<noscript>` duplicado).
- QUANDO `npm run prerender` roda de novo sobre um `dist/` já processado ENTÃO as demais páginas não herdam o canonical da raiz (o molde passa por remoção dos itens da raiz antes de compor).
- QUANDO um idioma não tem `root.heading` ou `root.link` ENTÃO o build falha com mensagem que cita o idioma e a chave (como `readNoscriptText`).
- QUANDO a raiz é aberta com JavaScript ENTÃO a pessoa termina em `/<idioma>` pelo mesmo critério de hoje, preservando query e hash.

## Critérios de aceite

- [ ] Sem JavaScript, `GET /` responde 200 com `<html lang="en">`, `<title>` e `<meta name="description">` de `en`, e um `<noscript>` com `<h1>` e três links (`pt-BR`, `en`, `es`) cujo `href` é `<base><idioma>`, com `hreflang` e `lang` do idioma. (`NF-IA-22`, `NF-IN-05`, `NF-IA-04`)
- [ ] O HTML da raiz tem `<link rel="canonical">` absoluto para `/en` e `hreflang` `pt-BR`, `en`, `es` e `x-default` (este para `/en`), todos absolutos e com o `base`. (`NF-IA-11`, `NF-IA-22`)
- [ ] O HTML da raiz tem `og:title`, `og:description`, `og:type`, `og:url` e `og:image`. (`NF-IA-10`, `NF-IA-22`)
- [ ] Com JavaScript, a raiz continua redirecionando: escolha salva, depois idioma do navegador, depois `en`, com query e hash preservados. (`NF-IN-09`)
- [ ] O script de redirecionamento e os hashes da CSP de `vercel.json` não mudam (`vercelConfig.test.ts` e `rootRedirect.test.ts` passam sem alteração).
- [ ] `404.html`, `pt-BR.html`, `en.html` e `es.html` não ganham canonical da raiz nem os links do `<noscript>` da raiz, e o sitemap continua sem a raiz.
- [ ] `common.json` tem `root.heading` e `root.link` em `pt-BR`, `en` e `es` (`NF-IN-01`).
- [ ] A doc (`NF-IA-22` novo, `NF-IA-17`, `NF-IA-01`, `NF-IN-09`, `frontend.md`, `environments.md`) descreve a raiz com conteúdo estático e o `lang` `en`.
- [ ] Verificação manual (aparência, tela: `/` com JavaScript desligado, em `npm run preview:fatec`): o `<noscript>` da raiz não herda a faixa vermelha do aviso (`body > noscript` em `global.css`), usa tokens (`--space-*`, `--pad-page`, `--text-*`), é legível e foca nos links em claro e escuro.

## Estratégia de validação

- **Checagens automatizadas:** testes de unidade em `scripts/test/` (`composeRootPage`, `readRootTexts`, idempotência) e E2E em `e2e/no-javascript.spec.ts` (lista `independentSpecs`, já classificado; nada novo em `specClassification.ts`). `e2e/routesUnderTest.ts` **não** recebe a raiz: o arquivo alimenta specs com JavaScript (axe, teclado, tema) em que a raiz redireciona; os casos da raiz ficam num `describe` próprio com `javaScriptEnabled: false`.
- **Checagens manuais:** `npm run build:fatec && npm run preview:fatec`, `curl -s http://localhost:4173/ra2581392423047/` e abrir com JavaScript desligado (DevTools); depois com JavaScript ligado e `navigator.language` `es`.
- **Rollback / mitigação:** a mudança é só na etapa de pré-renderização; reverter o commit devolve a raiz vazia sem tocar nas demais páginas.

## Riscos

- **Vazamento no molde:** se a raiz fosse gravada antes das demais páginas (ou o molde fosse relido de `dist/index.html` já processado), canonical e links iriam para todas elas. Mitigação: raiz por último e remoção dos itens da raiz do molde (teste de idempotência).
- **Estilo global:** `body > noscript` já pinta o aviso em vermelho; sem ajuste o seletor pega o `<noscript>` da raiz. Mitigação: marcar o `<noscript>` da raiz (por exemplo `data-root`) e excluí-lo do seletor, com regra própria por tokens (verificação manual).
- **Docs divergentes:** `NF-IN-09` e `NF-IA-17` hoje dizem que a raiz só redireciona e fica em `pt-BR`; a doc entra na mesma entrega para não contradizer a implementação.
- **Conflitos com outras trilhas:** `scripts/prerender.ts` é compartilhado com a #162 (camada de dados), mas a #195 só acrescenta uma chamada no fim do arquivo e arquivos novos em `scripts/prerender/`; não toca `readJson`, `package.json`, `routes.tsx` nem `vercel.json`. `common.json` e os docs são tocados por várias issues: rebase simples. A #195 não precisa ser quebrada.

## Questões em aberto

- Canonical da raiz em `/en` (proposto) ou autorreferente na própria raiz com `x-default` em `/en`? A issue só fixa o `x-default`.
- Aceita o `og:*` mínimo na raiz (proposto) ou fica só canonical e `hreflang`?
- Vale registrar um redirecionamento HTTP por idioma na Vercel como melhoria da V2 (não vale no Pages da Fatec)?
- `lang="en"` para a raiz está bem, ainda que `NF-IA-17` dissesse `pt-BR` (a spec atualiza a doc)?

## Notas / decisões

- Nenhuma dependência nova.
- IDs: `NF-IA-22` é novo (próximo livre depois de `NF-IA-21`) e entra em `docs/product/non-functional-requirements.md` na tarefa de doc.

## Desvios da implementação

- A remoção dos itens da raiz ficou em `scripts/prerender/removeRootPageItems.ts`, fora da lista de arquivos da spec, por causa da regra de um símbolo exportado por arquivo. Numa raiz já processada ela deixa `lang`, título e descrição do `en` e um `<noscript></noscript>` vazio; o `composePage` os troca nas demais páginas.
