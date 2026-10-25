# canonical-og-jsonld

> Status: `implementada`
> Encerrada em: `2026-10-24`
> Commits: `staging..feat/52-canonical-og-jsonld` · PR: `—` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/52`

## O que foi pedido

Dar a cada página pública canônica, `hreflang`, Open Graph, `twitter:card` e JSON-LD, com a URL pública do site como configuração de build, e aplicar o mecanismo à Início.

## O que foi feito

- `VITE_SITE_URL` (só a origem) validada no `npm run build` por `scripts/resolveSiteUrl.ts` e lida só em `getSiteUrl`; `buildAbsoluteUrl` junta origem, `base` e caminho com idioma. Workflows definem o valor de cada ambiente e `build:fatec` força a origem da Fatec (`scripts/fatecSiteUrl.ts`).
- `PageMeta` (recebe `path` e `params?` e monta as URLs por `buildAbsoluteUrl`, em vez de ler `useLocation`) e `JsonLd` (`serializeJsonLd` escapa `<`). `og:image:width` e `og:image:height` são fixos em 1200 e 630.
- Início usa `useHome` (perfil por `profileApi`, consulta adicionada à rota `""` do prerender) e `buildHomeJsonLd` (`WebSite` e `Person`); `buildProjectsJsonLd` pronto e testado para a tela #35.
- Imagem `public/images/og-site.png` gerada por `npm run og:image` (Playwright, fonte Bricolage em base64, gato lido de `CatLogo.tsx`).
- O `<script>` do JSON-LD fica no corpo do HTML pré-renderizado (React 19 não o leva ao `<head>`); `composePage` não mudou.

## Notas

- Validação manual pendente: Post Inspector, Schema Markup Validator e `curl` dos quatro `alternate` na URL publicada.
- `image` de `PageMeta` é caminho de `public/`; captura do projeto (D26) pode exigir tratar URL absoluta e dimensões próprias.
