# Documentação

Esta pasta guarda a documentação versionada **só do frontend do portfólio** de Luiz Felipe dos Santos: como ele é, por que foi feito assim e como rodá-lo. É revisada em Pull Request e tem vida longa.

## Fronteira

| Nível           | Onde vive       | O que documenta                                                                                   |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| Este frontend   | `docs/`         | Telas, arquitetura, decisões, diagramas e ambientes do frontend                                   |
| Sistema inteiro | Repositório pai | Containers e a relação entre backend e frontend, que entram nele como submódulos                  |
| Contrato da API | Backend         | O backend ainda não existe; até lá, o contrato esperado pelo frontend será documentado em `docs/` |

## `docs/` vs `.specs/`

|            | `docs/`                              | `.specs/`                          |
| ---------- | ------------------------------------ | ---------------------------------- |
| Descreve   | O frontend como ele é                | Uma mudança planejada              |
| Versionada | Sim, revisada em PR                  | Não, local e gitignored            |
| Vida       | Longa, atualizada junto com o código | Descartável depois de implementada |

Uma decisão que sobrevive à mudança que a motivou vira um ADR em [`adr/`](adr/README.md).

## Índice

| Arquivo                                                        | O que vai nele                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`product/overview.md`](product/overview.md)                   | Propósito, público, papéis, escopo, requisitos R1–R3, pendências e fora de escopo do produto                               |
| [`product/glossary.md`](product/glossary.md)                   | Termos do domínio, definição e onde aparecem                                                                               |
| [`design/design-system.md`](design/design-system.md)           | Resumo do design system do handoff: cores, tipografia, forma, movimento, voz, acessibilidade e divergências do repositório |
| [`screens/_template.md`](screens/_template.md)                 | Molde para documentar uma tela: objetivo, estados, validações, permissões, regras e navegação                              |
| [`architecture/frontend.md`](architecture/frontend.md)         | Camadas, roteamento, estado, estilo, internacionalização e testes                                                          |
| [`adr/README.md`](adr/README.md)                               | Quando escrever um ADR, numeração e índice das decisões                                                                    |
| [`adr/0000-template.md`](adr/0000-template.md)                 | Molde de ADR                                                                                                               |
| [`adr/0001-state-management.md`](adr/0001-state-management.md) | Gerenciamento de estado                                                                                                    |
| [`diagrams/flow.md`](diagrams/flow.md)                         | Fluxograma de navegação entre as telas do portfólio                                                                        |
| [`diagrams/entity.md`](diagrams/entity.md)                     | Entidades de conteúdo do handoff (Projeto, Experiência, Formação, Link)                                                    |
| [`setup/environments.md`](setup/environments.md)               | Ambientes, variáveis `VITE_*` e como subir o ambiente local                                                                |

## Convenções

- Os diagramas usam Mermaid, que o GitHub renderiza direto de um bloco de código `mermaid`, sem imagem binária.
- Placeholders ficam entre crases (`<nome>`) para não virarem tag HTML.
- Nomes de arquivo e pasta em inglês; conteúdo em português.
