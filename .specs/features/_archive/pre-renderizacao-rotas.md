# pre-renderizacao-rotas

> Status: `em-andamento` (falta só a verificação real na Vercel)
> Encerrada em: `2026-10-24`
> Commits: `4121ad7..HEAD` da branch `feat/49-pre-renderizacao-rotas` · PR: a abrir após o merge do #88 (já na `staging`) · Issue: [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49)

## O que foi pedido

Gerar, no `npm run build`, um HTML por rota pública e idioma mais o `404.html`, legíveis sem JavaScript, e fazer o cliente hidratá-los sem erro, partindo do código-prova do ADR 0004 (opção 1, sem biblioteca nova).

## O que foi feito

Build SSR do Vite com três entradas (`entry-server`, `routes`, `prerenderRoutes`), lidas por `scripts/prerender.ts`, que enumera os alvos (`listTargets`), renderiza um por vez com `react-dom/static` e `progressiveChunkSize: Infinity` (`src/entry-server.tsx`) e compõe cada arquivo a partir do `index.html` buildado (`composePage`): `lang`, `<head>` do React sem duplicar `title`/`description`, `<noscript>` por idioma (`common:noscript`) e os globais `prerenderedPath`, `preloadedState` e `routerData` com `<` escapado. Um registro (`src/prerender/prerenderRoutes.ts`) descreve rota, parâmetros e consultas; rota do registro sem tela em `routes` é ignorada no log, e toda tela nova do M5 entrega a própria entrada. O cliente (`mountClient`, chamado por `entry-client.tsx`) hidrata só quando o caminho é o `prerenderedPath` e, senão, limpa o `<head>` e usa `createRoot` (o `404.html` em inglês servido em `/pt-BR/xyz` e a raiz). `App.tsx` passou a receber `store` e `router` por props, e `Router.tsx`, `store.ts` e `index.tsx` saíram. `prepareFatecArtifact` deixou de copiar o `index.html` (exige o `404.html` com o base), `preview:fatec` virou um servidor Node que imita o Pages (`resolvePagesFile`) e o `vercel.json` passou a `cleanUrls` e `trailingSlash: false`, sem o rewrite genérico.

Decisões que valem guardar: o `fetch` local de `installPublicFetch` lê `public/` só durante a pré-renderização (sem `node:fs` no cliente); o documento sai sempre como `<nome>.md.html`, nunca em pasta; o teste de hidratação usa HTML gerado por `globalSetup` do Vitest, porque o `react-dom/server` deixa os contextos do React sujos no mesmo processo e o cliente acusa "multiple renderers"; `PrerenderRouteDescriptor` fica separado de `PrerenderRoute` para o `tsconfig.node.json` não puxar tipos de `src/` com DOM.

## Notas

- A verificação real na Vercel (beta e produção) depende do deploy da `staging`; a lista de `curl` está na T15 do `tasks.md` e em `docs/setup/environments.md`. Antes do merge, confirmar que o projeto da Vercel usa o Build Command padrão `npm run build` e o Output Directory `dist`, senão a pré-renderização não roda.
- As consultas das rotas de M5 (Projetos, Projeto, Documento, Informações, Contato) no registro são provisórias: cada spec de tela as confirma ao entrar.
- O console do navegador foi conferido em Chrome headless (`--dump-dom` com log do console) no `preview:fatec`, sem mensagem; tema escuro e movimento reduzido ficaram cobertos no teste com jsdom.
- O critério "um HTML por rota pública, projeto e documento" só fecha de verdade na #41, quando as telas existirem.
