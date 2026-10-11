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

| Arquivo                                                                            | O que vai nele                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`product/overview.md`](product/overview.md)                                       | Propósito, público e jornadas, papéis, objetivos e sinais de sucesso, escopo e fora de escopo com fonte, requisitos R1–R3, decisões de design e decisões de produto DP01–DP03                                           |
| [`product/glossary.md`](product/glossary.md)                                       | Termos do domínio, definição e onde aparecem                                                                                                                                                                            |
| [`product/roadmap.md`](product/roadmap.md)                                         | Versões, ordem das entregas em marcos, dependências, bloqueios e a definição da v1                                                                                                                                      |
| [`product/non-functional-requirements.md`](product/non-functional-requirements.md) | Requisitos que valem para todas as telas, com verificação: idioma, conteúdo local, metas de desempenho, responsividade, temas, movimento, legibilidade por IA e buscadores, privacidade, navegadores, CI e GitHub Pages |
| [`product/accessibility.md`](product/accessibility.md)                             | Requisito de acessibilidade: meta WCAG 2.2 AA com cinco critérios AAA, método de verificação, estado atual, regras por tema (inclusive HTML semântico) e checklist por tela                                             |
| [`design/design-system.md`](design/design-system.md)                               | Resumo do design system do handoff: cores, tipografia, forma, movimento, voz, acessibilidade e divergências do repositório                                                                                              |
| [`design/prototype/README.md`](design/prototype/README.md)                         | Protótipo navegável validado pelo PO: como abrir pelo `npm run dev`, telas, estados e temas                                                                                                                             |
| [`design/decisions.md`](design/decisions.md)                                       | Decisões de design D01–D42 e pendências de implementação PI1–PI5, com opções, fonte, data e issues                                                                                                                      |
| [`design/assets/logo/`](design/assets/logo/)                                       | SVGs-fonte do logo (o gato), sem metadado                                                                                                                                                                               |
| [`screens/_template.md`](screens/_template.md)                                     | Molde para documentar uma tela: objetivo, estados, validações, permissões, regras e navegação                                                                                                                           |
| [`screens/layout.md`](screens/layout.md)                                           | Layout compartilhado: cabeçalho, menu mobile, rodapé, tema, idioma, páginas de erro, metadados por rota e idioma, chaves de tradução e critérios de aceite da C                                                         |
| [`screens/about.md`](screens/about.md)                                             | Tela Informações: apresentação e CV, stack, complementos, trajetória com modal, estados por seção, pedidos ao contrato, metadados e JSON-LD e critérios de aceite da G                                                  |
| [`screens/contact.md`](screens/contact.md)                                         | Tela Contato: canais, flag do formulário, validações, estados de envio, chaves, pedidos ao contrato, metadados e JSON-LD e critérios de aceite da H                                                                     |
| [`architecture/frontend.md`](architecture/frontend.md)                             | Camadas, roteamento, estado, estilo, internacionalização e testes                                                                                                                                                       |
| [`adr/README.md`](adr/README.md)                                                   | Quando escrever um ADR, numeração e índice das decisões                                                                                                                                                                 |
| [`adr/0000-template.md`](adr/0000-template.md)                                     | Molde de ADR                                                                                                                                                                                                            |
| [`adr/0001-state-management.md`](adr/0001-state-management.md)                     | Gerenciamento de estado                                                                                                                                                                                                 |
| [`diagrams/flow.md`](diagrams/flow.md)                                             | Fluxograma de navegação entre as telas do portfólio                                                                                                                                                                     |
| [`diagrams/entity.md`](diagrams/entity.md)                                         | Entidades de conteúdo do handoff (Projeto, Experiência, Formação, Link)                                                                                                                                                 |
| [`setup/environments.md`](setup/environments.md)                                   | Ambientes, variáveis `VITE_*` e como subir o ambiente local                                                                                                                                                             |

## Convenções

- Os diagramas usam Mermaid, que o GitHub renderiza direto de um bloco de código `mermaid`, sem imagem binária.
- Placeholders ficam entre crases (`<nome>`) para não virarem tag HTML.
- Nomes de arquivo e pasta em inglês; conteúdo em português.
