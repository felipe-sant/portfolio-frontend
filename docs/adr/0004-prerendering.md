# 0004. Pré-renderização das rotas

- **Status:** `aceita`
- **Data:** `24-10-2026`

## Contexto

A #49 pré-renderiza as rotas públicas nos três idiomas para que o HTML tenha conteúdo legível sem JavaScript (NF-IA-01, NF-IA-03) e hidrate sem erro (NF-TE-04), com data-limite em 08/11/2026 (`roadmap.md`, M4). A opção 1 de NF-IA (script próprio: build SSR do Vite, `createStaticHandler`, `createStaticRouter`, `StaticRouterProvider` e `prerender` de `react-dom/static`) estava só recomendada no papel. Faltava saber se ela funciona com o `base` do Pages da Fatec (`/ra2581392423047/`), com o idioma no caminho (ADR 0002), com as páginas `lazy`, com a instância global do i18next e com a hidratação sem erro. O spike #64 testou isso sobre o código real.

O código do spike **não foi mergeado**: vive na branch `spike/64-prerender` (último commit `6c99f34`), que nunca vira PR e serve de ponto de partida para a #49 (`git switch -c feat/49-... spike/64-prerender` ou `git cherry-pick`). Ambiente do teste: Node 22, React 19.3, React Router 7.18, Vite 8.3, build de produção com `BASE_PATH=/ra2581392423047/`, navegador Chrome.

## Decisão

Seguir a **opção 1** (script próprio, sem biblioteca nova). Funcionou sem bloqueio, então o plano B (`vite-react-ssg`, opção 3) e o plano B da v1 (opção 5) não foram necessários nem testados. A #49 parte do código do spike.

O que a #49 herda do spike, em resumo:

- Duas entradas, `src/entry-server.tsx` (`render(url, lang)`) e `src/entry-client.tsx` (`hydrateRoot`), mais `scripts/prerender.ts`, que faz o `prerender` de cada alvo e escreve os arquivos a partir do `index.html` buildado.
- O `index.html` buildado é o molde: a página gerada troca `lang`, injeta o `<title>`/`<meta name="description">` que o React emite e coloca o corpo em `#root`, mais um `<script>` com `prerenderedPath`, `preloadedState` (store) e `routerData` (`loaderData`/`errors`), com `<` escapado como `<`.
- `i18n.ts` ganhou guarda `typeof window`/`typeof document`; o resto de `src/` ficou intacto.

## Evidência

HTML gerado, lido sem executar JavaScript, servido em `http://localhost:4173/ra2581392423047/` (servidor local que imita o Pages, ver "Limites"):

```
$ curl -s http://localhost:4173/ra2581392423047/pt-BR | grep -o "<h1[^>]*>[^<]*"
<h1>Desenvolvedor full stack em TypeScript
$ curl -s http://localhost:4173/ra2581392423047/en | grep -o "<h1[^>]*>[^<]*"
<h1>Full stack developer in TypeScript
$ curl -s http://localhost:4173/ra2581392423047/es | grep -o "<h1[^>]*>[^<]*"
<h1>Desarrollador full stack en TypeScript
$ curl -s http://localhost:4173/ra2581392423047/nao-existe | grep -o "<h1[^>]*>[^<]*"
<h1>Page not found
```

O último é o conteúdo de `404.html` (gerado em inglês, o idioma da não encontrada sem prefixo). Cada arquivo tem `<html lang>` correto, um único `<title>` e um único `<meta name="description">` no `<head>` e o rodapé com o perfil (e-mail, localização) já no HTML.

Hidratação (Chrome, build de produção, `base` do Pages): em `/pt-BR`, `/en`, `/es` e no `404.html` aberto no próprio caminho, console sem erro nem aviso, e o `<h1>` do servidor não é substituído (conferido por `MutationObserver`: nenhuma remoção do `<h1>`). O mesmo resultado com tema escuro salvo e movimento reduzido ligados (NF-TE-04). Só foi conferido o build de produção, que não imprime o detalhe de mismatch do modo dev: um mismatch aparece como erro recuperável (`Minified React error #418`), que não ocorreu nesses casos.

## O que foi testado

| #   | Ponto do roteiro                                                    | Resultado              | Nota                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Build SSR do Vite com entrada de servidor e de cliente              | funciona com ajuste    | `vite build --ssr src/entry-server.tsx`; `define`, `import.meta.env.BASE_URL` e CSS Modules são resolvidos; o único ajuste foi o `i18n.ts` (ponto 5)                                 |
| 2   | `createStaticHandler`, `createStaticRouter`, `StaticRouterProvider` | funciona               | `basename` `/ra2581392423047/` com barra final, URL completa no `Request`; o `createLanguageLoader` roda no servidor e deixa o i18next no idioma da URL                              |
| 3   | `prerender` de `react-dom/static`                                   | funciona com ajuste    | espera as páginas `lazy`; precisa de `progressiveChunkSize: Infinity` (ver "Limites")                                                                                                |
| 4   | Estado global e `queryFn` do `profileApi`                           | funciona com ajuste    | hook de RTK Query não dispara no servidor; é preciso `store.dispatch(endpoint.initiate(args))` e aguardar `api.util.getRunningQueriesThunk()`; `readText` usa `fetch` relativo       |
| 5   | `window`, `document`, `App.tsx`, `createBrowserRouter`, `define`    | funciona com ajuste    | só `i18n.ts` quebrava no Node; a entrada de servidor não usa `App.tsx` (`useTheme`, `useMotion`, `global.css`) nem `Router.tsx`; `__BUILD_YEAR__`/`__APP_VERSION__` saem do `define` |
| 6   | Hidratação com `createBrowserRouter` e `hydrationData`              | funciona com ajuste    | ver "Evidência" e o limite do `404.html`; `routes.tsx` usa `React.lazy` dentro do `Suspense` do layout, não a propriedade `lazy` da rota                                             |
| 7   | `<title>`/`<meta>` nativos do React 19                              | funciona com ajuste    | sem `<html>` na raiz, o React emite as tags no começo do HTML do corpo; o script as move para o `<head>` e remove as do `index.html`, senão ficam duplicadas                         |
| 8a  | Um arquivo por rota e idioma (`en.html`) e ativos sob o `base`      | funciona (só local)    | no servidor que imita o Pages: `/en` serve `en.html`, `/en/` com pasta sem `index.html` cai no 404, ativos em `/ra2581392423047/assets/` resolvem; **Pages real pendente**           |
| 8b  | `404.html` pré-renderizado                                          | funciona com ajuste    | ver "Limites"; o Pages real devolver 404 com o `404.html` em URL inexistente está **pendente**                                                                                       |
| 9   | URL de documento com extensão (`docs/SETUP.md`)                     | funciona só local      | `SETUP.md.html` responde 200 `text/html` no servidor local, `SETUP.md/index.html` responde 301 para `SETUP.md/`; **Pages real pendente** (ver "URL de documento com extensão")       |
| 10  | Plano B com `vite-react-ssg`                                        | não necessário         | opção 1 sem bloqueio                                                                                                                                                                 |
| 11  | Custo                                                               | ver "Plano para a #49" | estimativa revista abaixo                                                                                                                                                            |

Também verificado: a raiz `/` não é pré-renderizável, porque `redirectRootLoader` devolve uma `Response` 302 (o `handler.query` a devolve em vez do contexto). Ela continua sendo o `index.html` com o script de redirecionamento por idioma, que funcionou no navegador (`pt-BR`, `en-US` e `es-ES` vão para `/pt-BR`, `/en`, `/es` e hidratam sem erro). A decisão de `x-default` fica na #49, como no ADR 0002.

## Limites encontrados e contornos

1. **`i18n.ts` lê `window` e `document` ao ser importado.** Quebra no Node. Contorno: guarda `typeof window === "undefined"` (sem `lng`, o loader da rota define o idioma) e `typeof document` no listener de `languageChanged`. A entrada de servidor não importa `App.tsx`.
2. **Instância global do i18next.** O idioma é global e trocado pelo loader a cada `query`, então renders concorrentes misturariam idiomas. Contorno: renderizar uma URL por vez, em sequência. Trocar para `createInstance` por render só se a #49 quiser paralelizar.
3. **RTK Query não carrega dados no servidor.** Os hooks disparam em efeito. Contorno: antes do `prerender`, despachar `endpoint.initiate({ lang })` de cada consulta que a rota usa (Rodapé: `getProfile`; as demais telas, as suas) e aguardar `getRunningQueriesThunk()`; depois `unsubscribe()`. O `queryFn` lê JSON por `fetch` com URL relativa (`readText`), que o Node recusa: no spike, o script troca `globalThis.fetch` por uma leitura de `public/`. Para a #49, o mais limpo é o `readText` ler do disco quando `typeof window === "undefined"`, sem stub global.
4. **Bloco de Suspense fora de linha.** Sem `progressiveChunkSize: Infinity`, a página não encontrada em inglês saiu com o `<h1>` dentro de `<div hidden id="S:0">` e o `$RC` no final: o fallback "Loading..." aparece no HTML e o conteúdo só entra com JavaScript. Com `Infinity`, todo o conteúdo sai inline nos sete arquivos. Obrigatório na #49; conferir `grep -c 'id="S:'` igual a zero em cada arquivo gerado.
5. **`404.html` é servido em qualquer URL desconhecida.** Gerado para `/nao-existe` (inglês), ele chega ao navegador também em `/pt-BR/xyz`, `/es/xyz` e `/en/xyz`. Hidratar ali dá mismatch: com `hydrateRoot` em `/pt-BR/xyz` houve `Minified React error #418` e dois `<title>`. Contorno do spike: o script grava `prerenderedPath` no HTML e o cliente só chama `hydrateRoot` quando `location.pathname` é igual a ele; senão remove `<title>`/`<meta name="description">` do `<head>` e usa `createRoot` (sem `hydrationData` nem `preloadedState`), com um único título no fim e sem erro. O custo é que a não encontrada em outra URL pisca o HTML em inglês antes do cliente renderizar no idioma certo. A mesma regra serve para qualquer rota não pré-renderizada que caia no `404.html` (por exemplo, um documento novo).
6. **Status 404.** O `context.statusCode` da rota `*` é 200 no `handler.query`; o status real vem do nome do arquivo (`404.html`) no Pages, não do HTML.
7. **Servidor que imita o Pages não é o Pages.** Foi escrito para o spike (arquivo exato, depois `<caminho>.html`, depois pasta com `index.html` com 301 para a barra final, senão `404.html` com status 404). O comportamento real dessas regras no Pages, em especial `en.html` convivendo com uma pasta `en/` e o `.md.html`, continua **pendente de teste no Pages real**: o PO precisa ligar o Pages num repositório de teste, e isso não foi feito neste spike (ver "Pendências").
8. **Lint e tipos.** `typecheck` e `oxlint` em `src/` e `scripts/` passam na branch do spike; globais da página precisam de nome sem `_` inicial (`no-underscore-dangle`), por isso `prerenderedPath`, `preloadedState` e `routerData`.

## URL de documento com extensão

Resposta provisória, no servidor local que imita o Pages: `/<idioma>/projects/<id>/docs/SETUP.md` responde **200 `text/html`** quando existe `SETUP.md.html`, e responde **301 para `SETUP.md/`** quando existe `SETUP.md/index.html`. A primeira forma preserva a URL do D55 sem barra final, **se** o Pages aceitar `.md.html`, o que ainda não foi confirmado no Pages real. Enquanto isso não for confirmado, a #49 não depende disso: o plano B do roadmap (tirar a extensão só na URL, `/docs/setup`) fica como contorno e afetaria o `D55` e o `buildPath` (o nome do arquivo continua sendo o identificador do documento, só a URL perde `.md`). Atualizar este ADR com o resultado do Pages real antes de a #49 implementar a emissão dos documentos.

## Plano para a #49

Ordem das tarefas e estimativa revista (era 4 a 6 dias; ficaria em torno de 5):

1. Partir da `spike/64-prerender` e trazer `entry-server.tsx`, `entry-client.tsx`, `scripts/prerender.ts` e a guarda de `i18n.ts` com testes (0,5 dia). Ajustar o `index.html` (`/src/entry-client.tsx`) e a saída `dist/` no lugar de `dist-spike/`.
2. Enumerar os alvos: Início, Projetos, Informações, Contato e Projeto/documentos (lendo `public/content/<idioma>/projects.json` e a lista de documentos de cada projeto), nos três idiomas, mais o `404.html` (1 dia).
3. Dados por rota: para cada tela, despachar as consultas dela antes do `prerender`, serializar `preloadedState` e fazer o `readText` ler do disco no Node em vez do stub global (1 a 1,5 dia).
4. Emissão dos arquivos: `pt-BR.html`, `en.html`, `es.html` (e `<rota>.html`) e pastas por idioma, o `404.html` com a regra de `prerenderedPath`/`createRoot`, e a decisão do layout `en.html` x `en/index.html` e do documento com extensão conforme o teste no Pages real (0,5 dia).
5. Integração com `build:fatec`, `prepareFatecArtifact` (que hoje copia `index.html` para `404.html`; passa a emitir o `404.html` pré-renderizado) e o workflow de #63 (0,5 dia).
6. Testes: unitários do script e da regra de hidratação, e o teste ponta a ponta de #55 contra o build (1 dia).
7. Validação no Pages real e ajustes (0,5 dia).

Soma de 4 a 5,5 dias. A #49 só começa com o ADR mergeado (28/10): do dia 28 ao dia 06/11 são cerca de 8 dias úteis (11 corridos, com o feriado de 02/11), então cabe antes de 08/11 com folga de 2 a 3 dias.

Riscos que restam: Pages real divergir do servidor local (`en.html` com pasta `en/`, `.md.html`), cada nova tela exigir consultas próprias no passo 3, mismatch de hidratação em telas com estado de cliente na primeira renderização (filtros de Projetos, formulário de Contato), páginas `lazy` novas voltarem a sair como bloco de Suspense se alguém tirar `progressiveChunkSize`, e a piscada do `404.html` em outro idioma.

## Consequências

- A pré-renderização usa só o que o projeto já tem (Vite, React, React Router, Redux Toolkit), sem dependência nova nem mudança de convenção; `src/` muda pouco (`i18n.ts` e o ponto de entrada).
- O build passa a ter duas entradas e um passo de pós-processamento; `build:fatec` e `prepareFatecArtifact` precisam ser ajustados (#49, #63).
- O `404.html` deixa de ser cópia do `index.html` e passa a ser a não encontrada em inglês pré-renderizada; qualquer rota fora da pré-renderização cai nele e é renderizada no cliente.
- Conteúdo e metadados nativos (`<title>`, `<meta>`) seguem escritos pelas páginas; nada muda para quem escreve página nova, exceto declarar as consultas dela para o servidor.
- O ADR não altera `docs/product/`, `roadmap.md` nem o `CLAUDE.md`: se o Pages real obrigar a tirar a extensão dos documentos, o D55 e o `roadmap.md` são ajustados pela #49.

## Pendências

- Teste no Pages real (pontos 8 e 9): publicar o conteúdo de `dist/` do spike numa branch órfã do repositório, com Pages em "Deploy from a branch", e conferir com `curl -sI` `/en` (com `en.html` e pasta `en/`), uma URL inexistente (status 404 e corpo do `404.html`) e `docs/SETUP.md` (`SETUP.md.html`). Aguarda o PO ligar o Pages; o resultado atualiza as linhas 8 e 9 da tabela.

## Alternativas

- **Opção 3, `vite-react-ssg`:** não foi necessária, porque a opção 1 não teve bloqueio. Continua sendo o plano B se o Pages real exigir algo que o script próprio não cubra.
- **Opção 5, plano B da v1 (rotas pelo `404.html`, sem HTML legível sem JavaScript):** descartada enquanto a opção 1 funciona. Só volta se a #49 estourar 08/11/2026.
- **Renderizar no cliente com `createRoot` em tudo:** descartada, perde o HTML legível sem JavaScript (NF-IA-01, NF-IA-03). É o comportamento só do `404.html` em URL diferente da pré-renderizada.
- **Trocar `i18n` por `createInstance` por render:** não é necessário enquanto os renders forem sequenciais, e mexeria em todo o consumo global do `react-i18next`.
