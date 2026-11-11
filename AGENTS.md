# Portfólio: guia para ferramentas de IA

Este arquivo é só um ponto de entrada. Ele diz onde ler cada coisa e não repete regra nenhuma.

## Fonte da verdade

- [`.claude/CLAUDE.md`](.claude/CLAUDE.md): regras e convenções de código, teste, rotas, i18n, estado e estilo. Em caso de divergência vale o `.claude/CLAUDE.md`.
- [`.claude/README.md`](.claude/README.md): agentes, skills e o fluxo de trabalho com IA.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): branches, commits, issues e pull requests.
- [`README.md`](README.md): visão geral do projeto para pessoas.
- [`docs/README.md`](docs/README.md): índice da documentação.

## O que é

Frontend do portfólio pessoal de Luiz Felipe dos Santos, desenvolvedor full stack. A aplicação funciona sozinha, com dados mock, enquanto o backend não existe. O texto da interface existe em português do Brasil, inglês e espanhol. Visão, público e escopo em [`docs/product/overview.md`](docs/product/overview.md).

## Stack

React 19, TypeScript, Vite, Redux Toolkit com RTK Query, i18next, CSS Modules e Vitest com Testing Library. Detalhe em [`docs/architecture/frontend.md`](docs/architecture/frontend.md).

## Comandos

- `npm run dev`: servidor de desenvolvimento do Vite.
- `npm run typecheck`: checagem de tipos.
- `npm run lint`: lint com oxlint.
- `npm test -- --run`: testes de unidade, uma execução.
- `npm run build`: build de produção.
- `npm run test:e2e`: testes E2E com Playwright.

A lista completa está em [`docs/setup/development.md`](docs/setup/development.md) e a mecânica de teste em [`docs/setup/testing.md`](docs/setup/testing.md).

## Mapa de pastas

- `src/`: código da aplicação.
- `public/`: arquivos estáticos e dados de conteúdo.
- `content/`: conteúdo de origem do site.
- `e2e/`: testes E2E.
- `scripts/`: scripts de apoio e seus testes.
- `docs/`: documentação do produto, da arquitetura e das telas.
- `.specs/`: specs de features e bugs, com só o resumo versionado.
- `.claude/`: agentes, skills e o guia do Claude Code.

Estrutura e convenções de pastas em [`docs/architecture/code-structure.md`](docs/architecture/code-structure.md).

## Onde ler mais

- Arquitetura, rotas, estado e i18n: [`docs/architecture/frontend.md`](docs/architecture/frontend.md).
- Componentes: [`docs/architecture/components.md`](docs/architecture/components.md).
- Telas: [`docs/screens/`](docs/screens/).
- Produto e roadmap: [`docs/product/roadmap.md`](docs/product/roadmap.md).
- Design e decisões: [`docs/design/decisions.md`](docs/design/decisions.md).
- Contrato da API e modelo de dados: [`docs/architecture/api-contract.md`](docs/architecture/api-contract.md).

## Fluxo de trabalho

O trabalho segue TDD com agentes, descrito em [`.claude/README.md`](.claude/README.md). Branch, commit e pull request seguem o [`CONTRIBUTING.md`](CONTRIBUTING.md).
