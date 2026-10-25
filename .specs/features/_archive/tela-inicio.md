# tela-inicio

> Status: `implementada`
> Encerrada em: `2026-10-25`
> Commits: `1d6a01d^..HEAD` da branch `feat/34-tela-inicio` · PR: — · Issue: [#34](https://github.com/felipe-sant/portfolio-frontend/issues/34)

## O que foi pedido

A rota `/pt-BR`, `/en` e `/es` era um esqueleto com `h1` e uma frase. A issue pedia a tela Início de `docs/screens/home.md`: hero com selo de disponibilidade e saídas, status atual, faixa de stack com pausa, projetos em destaque e saídas finais, nos três idiomas e com dados do mock por RTK Query.

## O que foi feito

Cinco componentes novos (`AvailabilityBadge`, `LoadError`, `StatusCard`, `StackMarquee`, `FeaturedProject`), a forma `card` do `Skeleton`, os ícones `arrowRight`, `pause` e `play` e quatro funções puras (`pickCurrentStatus`, `flattenStack`, `formatProjectMeta`, `formatSinceDate`). `useHome` junta as três consultas (perfil, `getCurrentTimeline`, `getProjects` com `buildFeaturedProjectsParams`, que a pré-renderização também usa para a chave do cache) e cuida do foco ao tentar de novo, por `id` (o lint `react/refs` barra passar ref de hook para componente). `meta.title` virou "Portfolio · Luiz Felipe dos Santos" nos três idiomas (`home.md` e `layout.md` atualizados) e `home:intro` saiu. A pré-renderização da Início pede as três consultas e o E2E ganhou `en`, `es` e `e2e/home.spec.ts`.

Decisões que valem guardar:

- `formatSinceDate` fixa `timeZone: "UTC"` e monta `MM/AAAA` com `formatToParts` (o `es` devolveria `1/2026`), para o servidor e o navegador concordarem em qualquer fuso.
- "Baixar CV" usa `to="/cv/cv-<idioma>.pdf"` com `reloadDocument`: o roteador já soma o `basename`, então `publicUrl` duplicaria a base. O link dá 404 até a #54 gerar os PDFs.
- `useReveal` renderiza `data-reveal` diferente no servidor (sem `IntersectionObserver`) e no navegador; `FeaturedProject` usa `suppressHydrationWarning` e um teste de hidratação com `IntersectionObserver` simulado cobre o caso.
- O Playwright roda com `reducedMotion: "reduce"`, que esconde o botão de pausa; o roteiro da faixa usa `test.use({ reducedMotion: "no-preference" })`.
- Um único `role="status"` fica no nível da página (enquanto algum bloco carrega) e os skeletons não anunciam.

## Notas

- `src/prerender/test/mountClient.test.tsx` ("renderiza no cliente usando o BASE_URL como basename") já oscilava na `staging` sob carga; não foi tratado aqui.
- `index.html` ainda traz o `<title>` estático antigo (só vale até o JS rodar).
- Lighthouse e regressão visual contra o protótipo ficam com o PO.
