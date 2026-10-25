---
name: nfr-verification
description: Como verificar os requisitos não funcionais deste projeto (NF-* de docs/product/non-functional-requirements.md): desempenho, pré-renderização, SEO e legibilidade por IA, idioma na URL, temas, movimento, compatibilidade, qualidade e CI, e hospedagem no GitHub Pages. Use ao fechar uma tela, antes de uma release ou ao investigar regressão de desempenho ou SEO.
---

# Verificação de requisitos não funcionais

A fonte é `docs/product/non-functional-requirements.md`, cada requisito com ID `NF-*` e "como é verificado". Esta skill organiza o que o QA verifica no navegador e por comando, e o que fica com o PO.

## 1. Onde medir

Sempre no build do Pages: `npm run build:fatec` e `npm run preview:fatec` (`http://localhost:4173/ra2581392423047/`). Dev server não vale para desempenho nem para pré-renderização.

## 2. Por grupo

| Grupo (ID)                   | Como verificar                                                                                                                                                                        | Automatizável                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Idioma na URL (NF-IN, NF-IA) | cada rota nos três idiomas responde 200, `<html lang>` certo, `<title>`, `meta description`, canônica autorreferente, quatro `hreflang` com `x-default` em `en`, raiz `/` redireciona | sim (E2E e `curl`)              |
| Pré-renderização (NF-IA)     | com `javaScriptEnabled: false` o `h1` e o conteúdo principal estão no HTML; `dist/<idioma>.html` e `dist/<idioma>/<rota>.html` existem; `404.html` é a não encontrada em inglês       | sim                             |
| Dados estruturados           | `<script type="application/ld+json">` válido, `@id` da `Person` = `<URL canônica de />#person`                                                                                        | sim (parse do JSON no E2E)      |
| Arquivos para máquinas       | quando existirem (#51), `sitemap.xml`, `llms.txt` e `robots.txt` usam a URL pública do build                                                                                          | sim (`curl`)                    |
| Temas (NF-TE)                | claro e escuro sem flash na carga (script inline aplica `data-theme` antes da pintura), escolha salva, primeira renderização igual ao HTML pré-renderizado                            | parcial                         |
| Movimento (NF-MO)            | `reducedMotion` do sistema, escolha da engrenagem vale mais, nada anima em reduzido, animação nova usa `--dur-*`                                                                      | sim (E2E)                       |
| Responsividade (NF-RE)       | 320 a 1920px sem rolagem horizontal                                                                                                                                                   | sim (E2E)                       |
| Desempenho (NF-DE)           | Lighthouse mobile (LCP <= 2,5 s, CLS <= 0,1), INP <= 200 ms com CPU 4x, peso e domínios no Network                                                                                    | manual (PO) ou Lighthouse local |
| Privacidade (NF-PR)          | nenhuma requisição a domínio de terceiros, sem cookie, sem analytics, fonte self-hospedada                                                                                            | sim (`page.on("request")`)      |
| Compatibilidade (NF-CO)      | fumaça em Chrome e Firefox desktop, Safari iOS e Chrome Android; sem JavaScript o conteúdo é legível                                                                                  | Chromium sim; resto manual      |
| Qualidade e CI (NF-QA)       | `npm run build`, `lint`, `test:cov` (>= 80%), `content:check` passam                                                                                                                  | sim (comandos)                  |
| Hospedagem (NF-HO)           | tudo sob `/ra2581392423047/`: recarregar cada rota, fontes, imagens, JSONs; `.nojekyll`; nada depende de cabeçalho HTTP                                                               | sim (E2E e `curl`)              |

## 3. Receitas

Rota responde e tem `h1` no HTML cru (sem JS):

```bash
curl -s "http://localhost:4173/ra2581392423047/pt-BR" | grep -o "<h1[^>]*>[^<]*"
```

Cabeçalho do documento nos três idiomas:

```bash
for lang in pt-BR en es; do curl -s "http://localhost:4173/ra2581392423047/$lang" | grep -o '<html lang="[^"]*"'; done
```

Nenhuma requisição externa:

```ts
const external: string[] = []
page.on("request", (request) => {
    if (!request.url().startsWith("http://localhost:4173")) {
        external.push(request.url())
    }
})
await page.goto("pt-BR")
await page.getByRole("heading", { level: 1 }).waitFor()
expect(external).toEqual([])
```

## 4. O que fica manual (liste no relatório)

Lighthouse mobile em cada rota e INP com CPU 4x; Schema Markup Validator e Teste de pesquisa aprimorada; LinkedIn Post Inspector; fumaça em Safari iOS, Firefox e Chrome Android; checagem qualitativa de legibilidade por IA (NF-IA); o roteiro da URL publicada (`curl` contra o site real), que a #41 roda e registra.

## 5. Armadilhas

- Resultado de desempenho em máquina de desenvolvimento não vale como meta: reporte como indício e deixe a medição oficial para o PO.
- `trailingSlash: false` e `cleanUrls` valem na Vercel; o Pages serve `<caminho>.html` e redireciona pasta com 301: o `preview:fatec` imita o Pages, use-o.
- A URL pública vem de `VITE_SITE_URL` no build; em localhost o canônico aponta para localhost, o que é esperado no E2E.
