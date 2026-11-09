# Ambientes

## Ambientes

| Ambiente     | Para que serve                                                                                                | Como subir                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Local        | Desenvolvimento no computador                                                                                 | `npm run dev` e abrir `http://localhost:5173`                                                          |
| Staging/beta | Ambiente de testes, em `https://felipe-sant-beta.vercel.app`, com `noindex`, só o PO acessa                   | Push na branch `staging` (merge de PR), depois do CI verde, pelo workflow `deploy.yml`                 |
| Produção     | Site público, em `https://felipe-sant.vercel.app`                                                             | Push na branch `main` (promoção `staging` -> `main`), depois do CI verde, pelo `deploy.yml`            |
| Fatec        | Produção da v1, no GitHub Pages da Fatec, em `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/` | `npm run build:fatec` e o workflow `fatec-pages.yml` (ver [Fatec (GitHub Pages)](#fatec-github-pages)) |

A hospedagem é a Vercel, num projeto só (decisão em [ADR 0003](../adr/0003-hosting-vercel.md)): a `main` é o deployment de produção e a `staging` é um deployment de teste com alias. A produção da v1 da Fatec é outra trilha, no GitHub Pages, e não passa por aqui: ver [Fatec (GitHub Pages)](#fatec-github-pages).

### Fluxo de publicação

```
PR -> staging -> (promoção) -> main
```

1. Toda alteração entra por PR na `staging`. O CI roda no PR (com escopo por diff) e no push na `staging`.
2. Com o CI de push verde, o `deploy.yml` publica a `staging` no beta.
3. A promoção é um PR de `staging` para `main`, aberto e atualizado pelo `promote.yml` (ver "Promoção (`promote.yml`)"); o merge é humano. O CI não roda de novo no PR: os checks são os do push na `staging`, no mesmo commit, e aparecem uma única vez na página do PR. O push na `main` roda o CI e, verde, o `deploy.yml` publica em produção.

O `deploy.yml` dispara por `workflow_run` do CI e só publica quando o CI de um push na `main` ou na `staging` termina com sucesso: CI falhando, cancelado ou vindo de PR não publica. O CI também roda em push em `hotfix/**` para validar o PR `hotfix/*` -> `main` (o PR para a `main` não dispara o CI); esse push não publica, porque o `deploy.yml` só escuta `main` e `staging`. Como o `workflow_run` usa o arquivo de workflow da branch padrão (`staging`), o primeiro deploy de produção só acontece depois da primeira promoção `staging` -> `main`.

O beta tem Vercel Authentication ligada (Deployment Protection, "Standard Protection"): abrir exige login Vercel com acesso ao projeto, e `curl -I` sem login devolve a resposta de proteção, sem os headers da aplicação. Para conferir `X-Robots-Tag: noindex` por `curl`, use o bypass de automação da Vercel. A produção é pública e não traz `noindex`.

O `vercel.json` da raiz tem `cleanUrls: true` e `trailingSlash: false` e nenhuma reescrita genérica: `/pt-BR` serve `pt-BR.html` sem redirecionar, `/en/` redireciona para `/en`, `/pt-BR.html` redireciona para `/pt-BR`, o documento com extensão (`/en/projects/<id>/docs/SETUP.md`) serve `SETUP.md.html`, a raiz `/` serve o `index.html` (que redireciona por idioma) e qualquer URL desconhecida responde 404 com o corpo do `404.html` (a não encontrada pré-renderizada, em inglês), igual ao Pages. Uma rota de tela ainda fora do registro de pré-renderização cai no `404.html` e o cliente a renderiza com `createRoot`. O `noindex` da `staging` é acrescentado ao `vercel.json` em tempo de deploy pelo job `staging` (`jq '. + {headers: ...}'`), sem alterar o arquivo versionado; o teste `scripts/test/vercelConfig.test.ts` garante que a mescla preserva `cleanUrls` e `trailingSlash`.

Para conferir o beta, com o bypass de automação (`x-vercel-protection-bypass`): `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" <beta>/pt-BR` (200, sem redirecionamento, o mesmo para `/en` e `/es`), `<beta>/en/` (308 para `/en`), `<beta>/xyz` e `<beta>/pt-BR/xyz` (404 com `<h1>Page not found` no corpo), `<beta>/` (200 com o script de redirecionamento por idioma) e `curl -sI <beta>/pt-BR` (traz `X-Robots-Tag: noindex` só no beta).

## Build

`npm run build` encadeia cinco passos: `npm run typecheck`, `vite build` (cliente, em `dist/`), `npm run build:server` (`vite build --ssr --outDir dist-server`, as entradas de servidor `entry-server`, `routes` e `prerenderRoutes`, sem `public/`) e `npm run prerender` (`scripts/prerender.ts`, que escreve em `dist/` um HTML por rota pré-renderizada e por idioma, mais o `404.html`, e lista no log as rotas do registro que ainda não têm tela) e `npm run build:seo` (`scripts/generateSeoFiles.ts`, que escreve em `dist/` o `robots.txt`, o `sitemap.xml`, o `llms.txt` e os três `llms-full*.txt`, montando as URLs com `VITE_SITE_URL` e `BASE_PATH`). O `dist-server/` é intermediário, fica no `.gitignore` e nunca é publicado. O `BASE_PATH` vale para os dois builds, porque o `base` é resolvido na compilação. Detalhe da forma em [Pré-renderização](../architecture/frontend.md#pré-renderização).

## Fatec (GitHub Pages)

A v1 é publicada no GitHub Pages de `fatec-jacarei-dsm-portfolio/ra2581392423047` (Pages legacy em `main:/docs`), ou seja, num subcaminho: `/ra2581392423047/`. A #45 entrega o build e o artefato; a #63 entrega a publicação, que é um commit em `main:/docs` do repositório da Fatec feito por este repositório.

- `npm run build:fatec` roda `npm run build` com `BASE_PATH=/ra2581392423047/` (constante em `scripts/fatecBasePath.ts`) e prepara o `dist/`: cria o `.nojekyll` vazio (o Jekyll do Pages ignoraria arquivos e pastas iniciados em `_`) e falha em português se o `404.html` pré-renderizado não existir ou não contiver o base. O `404.html` não é mais cópia do `index.html`: é a página não encontrada em inglês, gerada pelo `npm run build`.
- `npm run preview:fatec` serve esse `dist/` com o mesmo base em `http://localhost:4173/ra2581392423047/`. É um servidor Node próprio (`scripts/previewFatec.ts`, sem dependência nova) que resolve o caminho como o Pages (`scripts/resolvePagesFile.ts`): arquivo exato, depois `<caminho>.html`, depois pasta com `index.html` (301 para a barra final) e, senão, o `404.html` com status 404. Serve para conferir por `curl` o HTML pré-renderizado (`/pt-BR`, `/en`, `/es` com 200; `/xyz` e `/en/` com 404). O `vite preview` não serve para isso, pois devolve o `index.html` em qualquer rota.
- `BASE_PATH` não tem prefixo `VITE_` porque só o `vite.config.ts` a lê, por `scripts/resolveBase.ts`; o cliente recebe o resultado em `import.meta.env.BASE_URL`, que alimenta o `basename` do router e o `publicUrl`. Ausente ou vazia vale `/`; sem `/` inicial ou final é normalizada; valor com `//`, `..`, espaço, `?` ou `#` falha o build.

### Workflow `fatec-pages.yml`

Reutilizável (`workflow_call`) e manual (`workflow_dispatch`), com a entrada opcional `tag`. O job `build` roda `npm ci`, `npm run build`, `npm run lint`, `npm run test:cov` e `npm run build:fatec`, e só então anexa o `dist/` como artefato `fatec-pages` do run (com `include-hidden-files`, senão o `.nojekyll` não sobe). Falha em qualquer passo anterior ao upload não gera artefato. O job `publish` depende do `build` e só roda quando `is-release` é `true`. O workflow tem `contents: read`; o único segredo é `FATEC_PAGES_TOKEN`, usado só no job `publish`.

- Sem `tag`, ou com `tag` fora de `^v1\.[0-9]+\.[0-9]+$` (`v2.0.0`, `1.0.0`, `v1.0`), é ensaio: usa o código do ref do run, `is-release` é `false` e o job `publish` é pulado.
- Com `tag` `v1.x.y`, o `build` faz checkout dessa tag e `is-release` é `true`.
- A `tag` entra por `env:` nos passos que a usam, nunca interpolada no `run`, para não abrir injeção. O token só aparece em `with:` do checkout do destino.
- `concurrency` sem cancelar: o workflow agrupa por `tag` e o job `publish` usa um grupo único (`fatec-publish`), então duas publicações nunca correm em paralelo. Com `cancel-in-progress: false`, o GitHub mantém só uma execução pendente por grupo e cancela as demais pendentes (a em andamento nunca é cancelada). Ensaios com `tag` vazia caem todos no mesmo grupo `fatec-pages-`. Repetir a publicação da mesma tag é seguro: o passo "sem mudança, sem commit" termina verde sem criar commit vazio.

#### Job `publish`

1. **Guarda de origem:** consulta `repos/<repositório>/compare/<tag>...main` pela API do GitHub (com `github.token`, só leitura) e falha a menos que o `status` seja `ahead` ou `identical`, ou seja, o commit da tag precisa estar na `main` deste repositório.
2. Faz checkout deste repositório na tag (`refs/tags/<tag>`, sem persistir credenciais), para o script e o artefato serem da mesma versão, instala as dependências e baixa o artefato `fatec-pages` (com `.nojekyll` e `404.html`).
3. Faz checkout de `fatec-jacarei-dsm-portfolio/ra2581392423047` em `main`, em `fatec-repository`, com `FATEC_PAGES_TOKEN`.
4. `npm run publish:fatec:docs -- fatec-artifact fatec-repository` (`scripts/replaceFatecDocs.ts`) valida o artefato (`index.html`, `404.html` e `.nojekyll`; senão falha em português sem tocar o destino), remove o `docs/` inteiro do destino e copia o artefato. Nada fora de `docs/` muda, inclusive o `README.md` da raiz. O `docs/` é removido e recriado para não sobrar arquivo do build antigo (Create React App).
5. Faz commit como `github-actions[bot]` com a mensagem `Publica a <tag> do portfólio` e `git push origin main`, sem `--force`. Se `git status --porcelain` não mostra mudança, termina verde sem commit. Se o push é rejeitado (alguém commitou na `main` da Fatec no meio), o job falha e não faz rebase: o PO resolve à mão.

#### Como disparar

A publicação automática vem do `release.yml` (ver [Versionamento](#versionamento-changesets)); a manual continua disponível: Actions > Fatec Pages > Run workflow, informando `tag` (por exemplo `v1.0.0`), com a tag já existente e dentro da `main`. Sem `tag`, só gera o artefato (ensaio). Reverter uma publicação é `git revert` do commit dela no repositório da Fatec, feito pelo PO.

O gatilho automático `release: types: [published]` não existe. Tag ou release criada por workflow com `GITHUB_TOKEN` não dispara outro workflow, por isso o contrato abaixo usa `workflow_call`.

#### Contrato com o `release.yml`

O job `publish-fatec` do `release.yml` chama o workflow no mesmo run da criação da tag, só para versão 1.x:

```yaml
publish-fatec:
    uses: ./.github/workflows/fatec-pages.yml
    with:
        tag: v1.x.y
    secrets: inherit
```

O job de release precisa de ao menos `contents: read` e passar os segredos (`secrets: inherit`). O `secrets.FATEC_PAGES_TOKEN` é opcional no `workflow_call` para o ensaio e o `workflow_dispatch` não o exigirem.

#### Credencial `FATEC_PAGES_TOKEN`

O PO tem push, mas não admin, no repositório da Fatec, então não há Pages por Actions, deploy key nem secret do lado de lá: a publicação usa um token do PO guardado como secret de repositório deste repositório (Settings > Secrets and variables > Actions > New repository secret, nome `FATEC_PAGES_TOKEN`).

- **Preferido:** PAT fine-grained (Settings > Developer settings > Personal access tokens > Fine-grained tokens), com o repositório `fatec-jacarei-dsm-portfolio/ra2581392423047` como único acesso e a permissão `Contents: Read and write`. A organização pode exigir aprovação do token ou não aceitar fine-grained.
- **Alternativa:** PAT classic com escopo `repo`, com expiração curta, só se a organização recusar o fine-grained. Dá acesso a todos os repositórios do PO, por isso a expiração curta.
- **Expiração e rotação:** defina a validade ao criar. Perto de vencer, crie outro token com o mesmo escopo, atualize o secret e revogue o antigo. O token vencido faz o checkout do destino falhar.
- **Revogação:** o token classic da `v1.0.0` segue em uso pela publicação automática da #47 e a revogação está pendente até a entrega final da v1 (M7, 22/11/2026), junto com a remoção do secret. Se o fine-grained passar a ser aceito pela organização, ele substitui o classic. Token comprometido ou entrega da Fatec encerrada: revogue em Settings > Developer settings e apague o secret.
- O token nunca é impresso nem interpolado em `run`.

#### Pontos de atenção da primeira publicação

- Na `v1.0.0` foi usado o PAT classic com escopo `repo`, porque a organização não listou o repositório da Fatec na criação do token fine-grained.
- O primeiro deploy do Pages travou e só voltou depois de um commit vazio em `main` do repositório da Fatec (`git commit --allow-empty` e push). Se uma publicação aparecer commitada mas o site não atualizar, esse é o caminho antes de investigar mais.

#### Plano B manual

Se o workflow não puder rodar (token indisponível, Actions fora do ar), o PO publica à mão, com push na Fatec:

1. `git clone git@github.com:fatec-jacarei-dsm-portfolio/ra2581392423047.git` em outra pasta e `git switch main`.
2. Neste repositório, na tag da versão (`git switch --detach v1.x.y`), `npm ci` e `npm run build:fatec`.
3. No clone da Fatec, `rm -rf docs` e `mkdir docs`; copie o `dist/` inteiro, incluindo o `.nojekyll` (`cp -a <este repositório>/dist/. docs/`).
4. `git add --all docs`, `git commit -m "Publica a v1.x.y do portfólio"` e `git push origin main`.
5. Aguarde o Pages e abra `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/pt-BR`, mais `/en`, `/es`, `/pt-BR/projects` e uma rota inexistente (404.html), recarregando cada uma.

#### Na V2

O workflow não é removido: fica inerte, porque a classificação `is-release` só aceita tag `v1.x.y` (qualquer outra pula o job `publish`) e a guarda recusa tag fora da `main`. Continua podendo publicar uma correção `v1.x.y` se a Fatec pedir. Remover é um `Chore` opcional quando a entrega da Fatec for encerrada.

## Currículo em PDF

Os PDFs do currículo (`public/cv/cv-pt-BR.pdf`, `cv-en.pdf` e `cv-es.pdf`) são gerados à mão por
`npm run cv:pdf` a partir dos `cv-<idioma>.md` da mesma pasta (Chromium do Playwright) e
commitados. O build, o CI e a Vercel não geram PDF nem precisam de Chromium para isso. Quando um
`.md` muda, rode `npm run cv:pdf` e commite os PDFs: o teste
`scripts/test/resumePdfsUpToDate.test.ts`, que roda no job de testes do CI, regera o PDF em
temporário e compara o texto extraído com o do PDF versionado, e falha se estiverem diferentes.

Em celular (ponteiro grosso) ou sem visualizador de PDF no navegador, o modal desenha as páginas em
`<canvas>` com o `pdfjs-dist` (build `legacy`), importado só nessa hora. O worker
(`pdf.worker.min-<hash>.mjs`) é emitido em `dist/assets/` com o `base` do build e servido da mesma
origem, sem CDN: o GitHub Pages e a Vercel o entregam como `text/javascript` pela extensão `.mjs`, e
o `preview:fatec` mapeia `.mjs` do mesmo jeito. `npm run check:chunk` limita o chunk do `pdfjs` a
170 KB gzip e o worker a 420 KB gzip e reprova se o `pdfjs` aparecer na entrada, no Início ou em
Projetos.

## Versionamento (Changesets)

Três workflows em `.github/workflows/`, descritos aqui porque os arquivos não têm comentários. A regra de incremento e o fluxo estão em [`roadmap.md`](../product/roadmap.md#versionamento).

- **`changeset-check.yml`** (`pull_request` para a `staging`): roda `npx changeset status --since=origin/staging` e falha sem changeset. O job é pulado quando o head é `changeset-release/staging` (PR de versão) ou `main` (retorno depois de hotfix, cujo changeset já foi consumido; conflito em `CHANGELOG.md` e `package.json` nesse retorno se resolve à mão).
- **`version.yml`** (push na `staging` e `workflow_dispatch`): `changesets/action@v2` com `version-script: npm run changeset:version`, que aplica `changeset version` e sincroniza o `package-lock.json`. Abre ou atualiza o PR `changeset-release/staging` → `staging` com título e commit `Chore :see_no_evil: Atualiza versão e CHANGELOG`. Com só changesets vazios, a versão não muda. O PR aberto com `GITHUB_TOKEN` não dispara CI; a validação completa acontece no push na `staging` depois do merge. Exige "Allow GitHub Actions to create and approve pull requests" ligado em Settings > Actions > General.
- **`release.yml`** (push na `main`, sem `workflow_dispatch`): `scripts/prepareRelease.ts` lê a versão do `package.json`, as tags e o `CHANGELOG.md`. Com versão `>= 1.0.0` e sem a tag `vX.Y.Z`, `gh release create` cria a tag e o Release na `main` com a seção do `CHANGELOG.md`; com `0.x` ou tag existente não faz nada. Para `1.x`, o job `publish-fatec` chama `fatec-pages.yml` com a tag e o `FATEC_PAGES_TOKEN`; `2.0.0` em diante não publica. Tag e Release criados por engano: `gh release delete <tag> --cleanup-tag`.
- **Hotfix:** o changeset `patch` e o `npm run changeset:version` rodam na `hotfix/*`, antes do PR para a `main`; o push cria a tag normalmente.
- **CHANGELOG com link:** `.changeset/config.json` usa `@changesets/changelog-github` (`repo` `felipe-sant/portfolio-frontend`), que consulta a API do GitHub para linkar PR, commit e autor em cada entrada. No `version.yml`, o `changesets/action` já exporta o `GITHUB_TOKEN`; fora do CI (o `npm run changeset:version` do hotfix), exporte `GITHUB_TOKEN` (por exemplo `GITHUB_TOKEN=$(gh auth token) npm run changeset:version`) e tenha rede, senão o comando falha. Só as entradas geradas a partir daí têm o formato novo.

## Promoção (`promote.yml`)

Workflow em `.github/workflows/promote.yml`, descrito aqui porque os arquivos não têm comentários. A lógica fica em `scripts/preparePromotion.ts`, que só orquestra `git` e `gh` sobre funções puras (`parseMergedPullNumbers`, `hasPendingChangesets` e `buildPromotionBody`), todas com teste em `scripts/test/`; a estrutura do YAML é guardada por `scripts/test/promoteWorkflow.test.ts`.

- **Gatilhos:** push na `staging` e `workflow_dispatch`, com `concurrency` sem cancelar (o segundo push espera o primeiro). Permissões: `contents: read` e `pull-requests: write`. Exige o mesmo "Allow GitHub Actions to create and approve pull requests" (Settings > Actions > General) do `version.yml`; nada novo a ligar.
- **PR único:** abre ou atualiza um PR `staging` -> `main`, nunca dois. Título `Chore :see_no_evil: Promove staging para produção`, na criação e na atualização. Assignee é o dono do repositório, sem labels.
- **Corpo:** as mesmas seções de `.github/PULL_REQUEST_TEMPLATE.md`, com a lista das issues incluídas (cada uma uma vez, com os PRs que a fecharam) e os PRs sem issue numa lista própria, em ordem crescente, itens de "Revisão humana" desmarcados e sem `Closes`. Os números vêm de `git log origin/main..origin/staging` (`Merge pull request #N` ou sufixo `(#N)`) e as issues de `closingIssuesReferences` de `gh pr view`.
- **Sem diferença:** com `origin/main` já contendo todos os commits da `staging`, o run termina verde sem criar PR.
- **Bloqueio por versão pendente:** enquanto houver `.changeset/*.md` além do `README.md` (o que mantém aberto o PR `changeset-release/staging`), o workflow não cria nem edita PR, escreve o motivo no resumo do run e termina verde; um PR de promoção aberto vira draft (`gh pr ready --undo`), o que impede o merge. Depois que o PR de versão é mergeado, o push seguinte (ou um `workflow_dispatch`) reavalia: cria o PR, ou tira o existente de draft e atualiza o corpo. O critério é o arquivo no checkout, nunca o PR de versão aberto, que pode estar obsoleto quando os dois workflows rodam em paralelo.
- **Checks:** o head do PR é a própria `staging`, então ele mostra os checks do push no mesmo commit; o PR criado com `GITHUB_TOKEN` não dispara CI e nenhum workflow de `pull_request` escuta a `main`.
- **Merge humano, por commit de merge:** o workflow nunca faz merge, auto-merge nem aprovação. Mergear a promoção por squash deixaria a `staging` "à frente" da `main` e o PR reabriria: use sempre commit de merge.
- **Rollback:** apagar `promote.yml` e fechar o PR gerado.

## Variáveis

A fonte das variáveis é o `.env.example` da raiz. Só variáveis com prefixo `VITE_` chegam ao código do cliente, lidas com `import.meta.env.VITE_ALGO`. Nos ambientes publicados, o valor vem do GitHub Environment correspondente (`staging` ou `production`), em Settings > Environments > Environment variables.

| Variável       | Local | Staging | Produção | Para que serve                                                |
| -------------- | ----- | ------- | -------- | ------------------------------------------------------------- |
| `VITE_API_URL` | vazia | ausente | ausente  | URL base do backend, lida só em `src/services/http/apiUrl.ts` |

| `VITE_SITE_URL` | `http://localhost:5173` (padrão sem a variável) | `https://felipe-sant-beta.vercel.app` | `https://felipe-sant.vercel.app` | Origem pública do site (só `http(s)://host`, sem caminho nem barra final), lida só em `src/utils/getSiteUrl.ts`; base de canônica, Open Graph e sitemap (NF-HO-06) |

| Variável                    | Local                                          | Staging | Produção | Para que serve                                                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_CONTACT_FORM_ENABLED` | `false` (ligada só no `.env.local`, se quiser) | ausente | ausente  | Liga o formulário da tela Contato (D41). Só o valor `"true"` liga; lida só em `src/utils/contactFormEnabled.ts`. Desligada em todo ambiente publicado até a #44, porque o envio é simulado; os testes a trocam por `vi.mock` |

`VITE_SITE_URL` é obrigatória em `npm run build`: ausente, vazia, sem `http(s)` ou com caminho, query ou hash, o build falha em português (`scripts/resolveSiteUrl.ts`, chamada em `vite.config.ts` só no `build`; `dev` e testes não falham). Na Fatec a origem é `https://fatec-jacarei-dsm-portfolio.github.io` e o subcaminho `/ra2581392423047/` vem de `BASE_PATH`, nunca da variável. Os workflows definem o valor literal (é público): o `deploy.yml` em cada job, o `ci.yml` e o `fatec-pages.yml` o valor de produção só para o build passar, e `npm run build:fatec` força a origem da Fatec (`scripts/fatecSiteUrl.ts`).

`npm run build:fatec:form` gera um segundo artefato do Pages em `dist-form/`, com `VITE_CONTACT_FORM_ENABLED=true` passada só ao processo desse script (nunca gravada em `.env*` nem nos workflows de publicação), para os testes E2E do formulário de Contato (`e2e/contact-form.spec.ts`, projetos Playwright `contact-form-*`, servidos na porta 4174 por `PREVIEW_DIR=dist-form PREVIEW_PORT=4174 npm run preview:fatec`). Ele devolve o `dist/` do `build:fatec` como estava e não publica nada: `build`, `build:fatec`, `deploy.yml` e `fatec-pages.yml` seguem com a flag desligada. Um guard, `npm run check:contact-form <diretório>`, confere o HTML pré-renderizado de um build e falha se achar o formulário de Contato (`id="contact-form"` ou a referência ao chunk `ContactForm`; o chunk em si existe nos dois estados, então só o HTML distingue). Ele roda no job `Build` do `ci.yml` (sobre `dist/`), no job `build` do `fatec-pages.yml` (sobre `dist/`, antes do upload do artefato) e nos dois jobs do `deploy.yml` (sobre `.vercel/output/static`, depois do `vercel build` e antes do `deploy`), porque a flag cadastrada no painel da Vercel entra no build pelo `vercel pull` sem passar por arquivo do repositório. Nenhum workflow o aponta para `dist-form/`, que tem o formulário de propósito. No `ci.yml` o E2E tem três jobs: `E2E scope` decide o escopo por diff (`full`, `changed` ou `none`) e a matriz; `E2E shard i/N` (4 fatias no `full`, uma só no `changed`, nenhuma no `none`) roda os dois builds, guarda o Chromium em cache pela versão do Playwright e roda `--shard=i/N` da suíte conforme a classificação de specs; e `E2E`, o agregador e único check exigido pelo ruleset, falha se o escopo ou alguma fatia falhar, junta os blobs com `merge-reports` (HTML e JSON), avisa no resumo dos testes `flaky` (`npm run e2e:flaky`, sem falhar o check) e confere a união das fatias com `npm run e2e:check-shards` no `full`. Detalhe em `docs/setup/e2e-performance.md`.

O backend ainda não existe e a aplicação usa dados mock, então `VITE_API_URL` fica vazia ou ausente: nos Environments ela não está definida, porque o GitHub não aceita variável vazia, e o workflow funciona sem ela. Sem a variável, `apiUrl.ts` usa string vazia e as requisições saem com caminho relativo. O valor do `.env.example` é só um modelo do formato. Quando o backend existir, a URL entra como variável de cada Environment.

Variável de build, fora do cliente e sem prefixo `VITE_`:

| Variável    | Padrão | Fatec               | Para que serve                                                                       |
| ----------- | ------ | ------------------- | ------------------------------------------------------------------------------------ |
| `BASE_PATH` | `/`    | `/ra2581392423047/` | Subcaminho de publicação, lida só em `vite.config.ts` (por `scripts/resolveBase.ts`) |

Variável de uso só do pipeline, no Environment `staging`:

| Variável        | Valor                         | Para que serve                                            |
| --------------- | ----------------------------- | --------------------------------------------------------- |
| `STAGING_ALIAS` | `felipe-sant-beta.vercel.app` | Domínio que o job `staging` aponta para o deploy de teste |

### Convenção do Vite e configuração de build

A convenção de variáveis de ambiente é a do Vite: só variáveis com prefixo `VITE_`
são expostas ao código do cliente, e a leitura é `import.meta.env.VITE_ALGO`, nunca
`process.env.REACT_APP_ALGO`. A convenção é
materializada em `.env.example` (na raiz, com `VITE_API_URL` como exemplo) e na augmentação de
`ImportMetaEnv`/`ImportMeta` em `src/vite-env.d.ts`.

`BASE_PATH` (sem prefixo `VITE_`) é lida só em `vite.config.ts`, por `scripts/resolveBase.ts`, e define o `base`
do Vite (`/` por padrão); o código do cliente só vê `import.meta.env.BASE_URL`. `scripts/` tem o alias
`@scripts/*` (em `tsconfig.node.json` e `resolve.alias`) para os testes de `scripts/test/`.

A configuração de build fica em `vite.config.ts` na raiz (plugin React + bloco `test` do Vitest),
e a entrada da aplicação é o `index.html` da raiz, que carrega `/src/entry-client.tsx` como módulo.

## Segredos

Tudo o que vai no build do frontend é público, então não coloque segredo em variável `VITE_*`. Credenciais de deploy e tokens de pipeline ficam no cofre de segredos do provedor de CI, fora do repositório.

Os três segredos do deploy ficam em GitHub Secrets do repositório (Settings > Secrets and variables > Actions):

| Segredo             | Origem                                                     |
| ------------------- | ---------------------------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com/account/tokens, com escopo do time e validade   |
| `VERCEL_ORG_ID`     | Team ID, em Settings do time na Vercel                     |
| `VERCEL_PROJECT_ID` | Project ID, em Settings > General do projeto `felipe-sant` |

Os GitHub Environments `production` e `staging` entregam as variáveis a cada job do `deploy.yml`. Em `workflow_run`, o GitHub avalia a regra de branches do Environment contra a branch padrão (`staging`), não contra a do push: a regra de ambos precisa permitir `staging` (o `if` de cada job já garante que `production` só publica o CI da `main`). A integração Git da Vercel fica desconectada: quem publica é o GitHub Actions.
