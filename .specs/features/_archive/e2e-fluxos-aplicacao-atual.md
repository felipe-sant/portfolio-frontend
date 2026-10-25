# e2e-fluxos-aplicacao-atual

> Status: `implementada`
> Encerrada em: `2026-10-25`
> Commits: `1299ffc..3108bc1` · PR: `—` · Issue: `#98`

## O que foi pedido

Cobrir com Playwright, em `e2e/`, os fluxos de clique e navegação da aplicação atual (layout compartilhado, Início e não encontrada): tema, movimento, idioma, cabeçalho, rodapé, saídas da Início, estados de carregamento e erro, página não encontrada e de erro, e o HTML sem JavaScript, nos quatro projetos.

## O que foi feito

Oito arquivos novos (`theme`, `motion`, `language`, `navigation`, `footer`, `home-flows`, `not-found`, `no-javascript`) e helpers em `e2e/support/` (`readContent`, `readProfile`, `readFeaturedProjects`, `readAppVersion`, `readStackOffset`, `openPreferences`, `uiTexts`). O requisito vai no título de cada teste. Como o produto já existia, o teste nasceu verde e o vermelho foi provado por mutação por tarefa (quebrar `src/` ou `index.html` no working tree, `npm run build:fatec`, ver falhar, desfazer); nenhuma mutação válida sobrevive. `npm run test:e2e` passa duas vezes seguidas (540 passed, 12 skipped com motivo). `.claude/CLAUDE.md` e a skill `playwright-e2e` registram que toda tela nova entrega os E2E dos próprios fluxos.

Decisões que valem guardar:

- A primeira carga vem hidratada e não faz `fetch` dos JSON. O erro (e o retry) é provado pela troca de idioma, como o PO decidiu. A troca não mostra esqueleto nem perfil ausente (o RTK Query mantém o dado do idioma anterior), então o carregando e o perfil ausente são provados abrindo `pt-BR/rota-inexistente` e indo à Início pelo cabeçalho, com `page.route` retendo ou derrubando a resposta.
- A página de erro é provada abortando o chunk `Home.page-*.js` (nome estável) e clicando em "Início".
- Posição de rolagem na troca de idioma: o teste afirma só que a página não volta ao topo (ver Notas).

## Notas

- Achado de produto, não corrigido (fora do escopo): na Início do desktop, trocar o idioma reduz o `scrollY` (a página encolhe enquanto o conteúdo do idioma novo carrega e o rodapé sai da tela se o usuário estava no fim); no mobile a posição se mantém. RF-LAY-14 pede preservar a posição: decisão do PO.
- A consulta da trajetória lê também `projects.json`: bloquear só ele derruba o "O que faço agora" junto dos destaques.
- O `<title>` da Início é igual nos três idiomas; só a description é distinta (a spec previa os dois distintos).
- `src/prerender/test/mountClient.test.tsx` ("renderiza no cliente usando o BASE_URL como basename") falha na suíte inteira do Vitest e passa isolado; reproduzido em `origin/staging` limpa, anterior a esta issue.
- Ficam para as telas futuras: asserções de destino de Projetos, Informações e Contato (hoje levam à não encontrada), "Currículo em PDF" do rodapé e o download do CV (#54).
