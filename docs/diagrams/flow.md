# Fluxo de navegação

Caminhos entre as telas do portfólio, conforme a arquitetura de informação do handoff de design
(`README.md` e telas `*.dc.html`). O cabeçalho é o mesmo em todas as telas e leva às quatro
seções; o rodapé leva ao contato em todas as telas exceto em `/contact`, onde vira navegação.

Hoje só `/` (Início) e a rota `*` (Página não encontrada) existem no código. As rotas
`/projects`, `/projects/:id` (com os documentos em `/projects/:id/docs/<name>`, D55),
`/about` e `/contact` chegam com as specs de cada tela, com os caminhos em inglês de D32.

```mermaid
flowchart TD
    Header([Cabeçalho]) --> Home
    Header --> Projects
    Header --> Info
    Header --> Contact
    Footer([Rodapé]) -- Fale comigo --> Contact

    Home["Início<br/>/"] -- Ver projeto --> Project
    Home -- Ver todos os projetos --> Projects
    Home -- Mais sobre mim --> Info

    Projects["Projetos<br/>/projects"] -- card do projeto --> Project
    Project["Projeto<br/>/projects/:id"] -- projeto relacionado --> Project
    Project -- Voltar para Projetos --> Projects

    Info["Informações<br/>/about"]
    Contact["Contato<br/>/contact"]

    Unknown([Rota desconhecida]) --> NotFound["Página não encontrada<br/>*"]
    NotFound -- Voltar para o início --> Home
```
