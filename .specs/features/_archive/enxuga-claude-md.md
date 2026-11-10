# enxuga-claude-md

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `origin/staging..docs/166-enxuga-claude-md` · PR: `—` · Issue: `#166`

## O que foi pedido

Enxugar o `.claude/CLAUDE.md` (792 linhas, 76 KB) para só regras e convenções que o agente aplica ao escrever código, movendo a descrição de componentes, telas, rotas e mecanismos para `docs/`, sem perder informação.

## O que foi feito

O `CLAUDE.md` caiu para 250 linhas, sem nenhuma acima de 400 caracteres, mantendo os títulos que agentes e skills citam, R1 a R3 literais, a tabela de tipos (exigida por `contributingTypesTable.test.ts`) e uma tabela "Onde ler mais". O texto saiu quase literal, em etapas atômicas: convenção e mecânica de teste para o novo `docs/setup/testing.md`; lista de comandos, CI e hooks para `development.md`; variáveis de build para `environments.md`; catálogo de componentes para o novo `docs/architecture/components.md`; implementação por tela para uma seção "Implementação" no fim de cada `docs/screens/<tela>.md`; módulos (`i18n`, `routers`, `store`, pré-renderização, SEO, tema, movimento, services) para `frontend.md`; páginas e hooks, alias, enum, utils e as convenções de código completas para `code-structure.md`; resumo de produto e rotas para `overview.md`; agentes, skills e specs para `.claude/README.md`; o comando de "blocked by" para o `CONTRIBUTING.md`. A tabela de rotas de `frontend.md` foi corrigida (Projeto, Documentos e Informações existem). As seis skills de scaffold, teste e E2E passaram a mandar ler o destino antes de agir. A prova de que nada se perdeu é o `inventario.md` (local) mais um script que confere 1100 tokens da linha de base e uma verificação por frase.

## Notas

A meta de 150 a 200 linhas não coube: ficou em 250, no teto que o PO aceitou. O texto foi movido sem reescrever, então `components.md` e `frontend.md` são cópias fiéis dos parágrafos e podem ser reorganizados por grupo numa issue futura. O teste de tamanho do `CLAUDE.md` (T11) ficou fora do escopo por decisão do PO. O roteiro de 10 perguntas (CA10) fica para o `reviewer` em sessão nova.
