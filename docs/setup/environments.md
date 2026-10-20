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

1. Toda alteração entra por PR na `staging`. O CI roda no PR e no push na `staging`.
2. Com o CI de push verde, o `deploy.yml` publica a `staging` no beta.
3. A promoção é um PR de `staging` para `main`; o push na `main` roda o CI e, verde, o `deploy.yml` publica em produção.

O `deploy.yml` dispara por `workflow_run` do CI e só publica quando o CI de um push na `main` ou na `staging` termina com sucesso: CI falhando, cancelado ou vindo de PR não publica. Como o `workflow_run` usa o arquivo de workflow da branch padrão (`staging`), o primeiro deploy de produção só acontece depois da primeira promoção `staging` -> `main`.

O beta tem Vercel Authentication ligada (Deployment Protection, "Standard Protection"): abrir exige login Vercel com acesso ao projeto, e `curl -I` sem login devolve a resposta de proteção, sem os headers da aplicação. Para conferir `X-Robots-Tag: noindex` por `curl`, use o bypass de automação da Vercel. A produção é pública e não traz `noindex`.

O `vercel.json` da raiz devolve `index.html` para qualquer caminho que não seja arquivo estático, inclusive o de documento com extensão (`/en/projects/<id>/docs/SETUP.md`), para a rota interna recarregar sem 404 do host. O `noindex` da `staging` é acrescentado ao `vercel.json` em tempo de deploy pelo job `staging`, sem alterar o arquivo versionado.

## Fatec (GitHub Pages)

A v1 é publicada no GitHub Pages de `fatec-jacarei-dsm-portfolio/ra2581392423047` (Pages legacy em `main:/docs`), ou seja, num subcaminho: `/ra2581392423047/`. A publicação em si é a #63; a #45 entrega o build e o artefato.

- `npm run build:fatec` roda `npm run build` com `BASE_PATH=/ra2581392423047/` (constante em `scripts/fatecBasePath.ts`) e prepara o `dist/`: `404.html` (cópia do `index.html`, até a #49 existir) e `.nojekyll` vazio (o Jekyll do Pages ignoraria arquivos e pastas iniciados em `_`). Falha se o `index.html` não contiver o base.
- `npm run preview:fatec` serve esse `dist/` com o mesmo base em `http://localhost:4173/ra2581392423047/`. O `vite preview` devolve o `index.html` por rota, então não exercita o `404.html`; este só é validado pelo teste de `scripts/prepareFatecArtifact.ts` e pela presença no artefato. No Pages, o primeiro carregamento de uma rota interna responde 404 do host (com o conteúdo do `404.html`); a recarga dentro da aplicação não passa por isso.
- `BASE_PATH` não tem prefixo `VITE_` porque só o `vite.config.ts` a lê, por `scripts/resolveBase.ts`; o cliente recebe o resultado em `import.meta.env.BASE_URL`, que alimenta o `basename` do router e o `publicUrl`. Ausente ou vazia vale `/`; sem `/` inicial ou final é normalizada; valor com `//`, `..`, espaço, `?` ou `#` falha o build.

### Workflow `fatec-pages.yml`

Reutilizável (`workflow_call`) e manual (`workflow_dispatch`), com a entrada opcional `tag`. Um job roda `npm ci`, `npm run build`, `npm run lint`, `npm run test:cov` e `npm run build:fatec`, e só então publica o `dist/` como artefato `fatec-pages` do run (com `include-hidden-files`, senão o `.nojekyll` não sobe). Falha em qualquer passo anterior ao upload não gera artefato. Não há publicação nem segredo: `contents: read`.

- Sem `tag`, ou com `tag` fora de `^v1\.[0-9]+\.[0-9]+$` (`v2.0.0`, `1.0.0`, `v1.0`), é ensaio: usa o código do ref do run e `is-release` é `false`.
- Com `tag` `v1.x.y`, faz checkout dessa tag e `is-release` é `true`. A saída `is-release` é para a #63 encadear a publicação, em um job novo neste arquivo ou em um workflow que o chame.
- A `tag` entra por `env:` no passo de validação, nunca interpolada no `run`, para não abrir injeção.

## Variáveis

A fonte das variáveis é o `.env.example` da raiz. Só variáveis com prefixo `VITE_` chegam ao código do cliente, lidas com `import.meta.env.VITE_ALGO`. Nos ambientes publicados, o valor vem do GitHub Environment correspondente (`staging` ou `production`), em Settings > Environments > Environment variables.

| Variável       | Local | Staging | Produção | Para que serve                                                |
| -------------- | ----- | ------- | -------- | ------------------------------------------------------------- |
| `VITE_API_URL` | vazia | ausente | ausente  | URL base do backend, lida só em `src/services/http/apiUrl.ts` |

O backend ainda não existe e a aplicação usa dados mock, então `VITE_API_URL` fica vazia ou ausente: nos Environments ela não está definida, porque o GitHub não aceita variável vazia, e o workflow funciona sem ela. Sem a variável, `apiUrl.ts` usa string vazia e as requisições saem com caminho relativo. O valor do `.env.example` é só um modelo do formato. Quando o backend existir, a URL entra como variável de cada Environment.

Variável de build, fora do cliente e sem prefixo `VITE_`:

| Variável    | Padrão | Fatec               | Para que serve                                                                       |
| ----------- | ------ | ------------------- | ------------------------------------------------------------------------------------ |
| `BASE_PATH` | `/`    | `/ra2581392423047/` | Subcaminho de publicação, lida só em `vite.config.ts` (por `scripts/resolveBase.ts`) |

Variável de uso só do pipeline, no Environment `staging`:

| Variável        | Valor                         | Para que serve                                            |
| --------------- | ----------------------------- | --------------------------------------------------------- |
| `STAGING_ALIAS` | `felipe-sant-beta.vercel.app` | Domínio que o job `staging` aponta para o deploy de teste |

## Segredos

Tudo o que vai no build do frontend é público, então não coloque segredo em variável `VITE_*`. Credenciais de deploy e tokens de pipeline ficam no cofre de segredos do provedor de CI, fora do repositório.

Os três segredos do deploy ficam em GitHub Secrets do repositório (Settings > Secrets and variables > Actions):

| Segredo             | Origem                                                     |
| ------------------- | ---------------------------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com/account/tokens, com escopo do time e validade   |
| `VERCEL_ORG_ID`     | Team ID, em Settings do time na Vercel                     |
| `VERCEL_PROJECT_ID` | Project ID, em Settings > General do projeto `felipe-sant` |

Os GitHub Environments `production` e `staging` entregam as variáveis a cada job do `deploy.yml`. Em `workflow_run`, o GitHub avalia a regra de branches do Environment contra a branch padrão (`staging`), não contra a do push: a regra de ambos precisa permitir `staging` (o `if` de cada job já garante que `production` só publica o CI da `main`). A integração Git da Vercel fica desconectada: quem publica é o GitHub Actions.
