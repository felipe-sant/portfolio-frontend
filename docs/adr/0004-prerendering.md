# 0004. Pré-renderização das rotas

- **Status:** `aceita`
- **Data:** `24-10-2026`
- **Issues:** [#64](https://github.com/felipe-sant/portfolio-frontend/issues/64), [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49)

## Contexto

A [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49) pré-renderiza as rotas públicas nos três idiomas para que o HTML tenha conteúdo legível sem JavaScript (NF-IA-01, NF-IA-03) e hidrate sem erro (NF-TE-04), com data-limite em 08/11/2026 (`roadmap.md`, M4). A opção 1 de NF-IA (script próprio: build SSR do Vite, `createStaticHandler`, `createStaticRouter`, `StaticRouterProvider` e `prerender` de `react-dom/static`) estava só recomendada no papel. Faltava saber se ela funciona com o `base` do Pages da Fatec (`/ra2581392423047/`), com o idioma no caminho (ADR 0002), com as páginas `lazy`, com a instância global do i18next e com a hidratação sem erro. O spike [#64](https://github.com/felipe-sant/portfolio-frontend/issues/64) testou isso sobre o código real.

O relatório do spike, com a evidência, a tabela do roteiro, os limites e o plano da [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49), está em [`reports/0004-prerendering-spike.md`](reports/0004-prerendering-spike.md).

## Decisão

Seguir a **opção 1** (script próprio, sem biblioteca nova). Funcionou sem bloqueio no spike, então o plano B (`vite-react-ssg`, opção 3) e o plano B da v1 (opção 5) não foram necessários nem testados.

- Duas entradas, `src/entry-server.tsx` e `src/entry-client.tsx`, e um script de build que pré-renderiza cada rota pública por idioma a partir do `index.html` buildado, com o estado da store e os dados do roteador serializados para a hidratação.
- As consultas do RTK Query de cada rota são despachadas antes do `prerender`, e o `prerender` usa `progressiveChunkSize: Infinity` para todo o conteúdo sair inline.
- O `404.html` é a página não encontrada em inglês pré-renderizada; o cliente só hidrata quando o caminho é o pré-renderizado e, em qualquer outra URL, renderiza do zero.
- Documento de projeto sai como `<nome>.md.html`, nunca em pasta, porque o GitHub Pages serve a URL com extensão sem redirect.

## Consequências

- A pré-renderização usa só o que o projeto já tem (Vite, React, React Router, Redux Toolkit), sem dependência nova nem mudança de convenção; `src/` muda pouco (`i18n.ts` e o ponto de entrada).
- O build passa a ter duas entradas e um passo de pós-processamento; `build:fatec` e `prepareFatecArtifact` precisam ser ajustados ([#49](https://github.com/felipe-sant/portfolio-frontend/issues/49), [#63](https://github.com/felipe-sant/portfolio-frontend/issues/63)).
- O `404.html` deixa de ser cópia do `index.html` e passa a ser a não encontrada em inglês pré-renderizada; qualquer rota fora da pré-renderização cai nele e é renderizada no cliente.
- Conteúdo e metadados nativos (`<title>`, `<meta>`) seguem escritos pelas páginas; nada muda para quem escreve página nova, exceto declarar as consultas dela para o servidor.
- O ADR não altera `docs/product/`, `roadmap.md` nem o `CLAUDE.md`: o Pages real aceita a URL com extensão (`.md.html`), então o D55 e o `roadmap.md` não mudam; a regra "nunca emitir documento em pasta" é registrada pela [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49).

## Alternativas

- **Opção 3, `vite-react-ssg`:** não foi necessária, porque a opção 1 não teve bloqueio. Continua sendo o plano B se o Pages real exigir algo que o script próprio não cubra.
- **Opção 5, plano B da v1 (rotas pelo `404.html`, sem HTML legível sem JavaScript):** descartada enquanto a opção 1 funciona. Só volta se a [#49](https://github.com/felipe-sant/portfolio-frontend/issues/49) estourar 08/11/2026.
- **Renderizar no cliente com `createRoot` em tudo:** descartada, perde o HTML legível sem JavaScript (NF-IA-01, NF-IA-03). É o comportamento só do `404.html` em URL diferente da pré-renderizada.
- **Trocar `i18n` por `createInstance` por render:** não é necessário enquanto os renders forem sequenciais, e mexeria em todo o consumo global do `react-i18next`.
