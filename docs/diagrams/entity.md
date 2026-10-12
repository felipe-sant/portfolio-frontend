# Entidades

Entidades de conteúdo que o frontend exibe, a partir da seção "Modelo de dados" do handoff de
design (`README.md`). Os nomes abaixo seguem o handoff, em português; no código, tipos e campos
serão escritos em inglês, conforme a convenção de identificadores do `.claude/CLAUDE.md`.

Hoje não existe backend: esses dados vêm de mock no frontend (requisito R1, ver
[`product/overview.md`](../product/overview.md)), e o mock em si é entregue numa issue própria.

Observações sobre o diagrama:

- `Link` não tem identidade própria: é um par `titulo`/`url` embutido em `Projeto.links` e em
  `projetos` de `Experiencia` e `Formacao`.
- `Projeto.relacionados` aponta para outros projetos pelo `slug`, com o `motivo` da relação.
- `stack` e `documentos` de `Projeto` são listas de objetos embutidos, descritas no comentário de
  cada campo.
- `fim` ausente em `Experiencia` e `Formacao` indica período em curso, exibido como
  `desde MM/AAAA`.

```mermaid
erDiagram
    Projeto ||--o{ Link : "links"
    Experiencia ||--o{ Link : "projetos"
    Formacao ||--o{ Link : "projetos"
    Projeto }o--o{ Projeto : "relacionados"

    Projeto {
        string slug PK
        string titulo
        string resumo
        number ano
        string tipo "Web, Mobile ou API"
        string categoria "Acadêmico, Pessoal ou Profissional"
        boolean destaque
        string papel
        string duracao
        string time
        string situacao
        object[] stack "categoria e itens"
        string[] imagens "sempre 16:9"
        string[] legendas
        object[] documentos "nome e conteudo em markdown"
        Link[] links
        object[] relacionados "slug e motivo"
    }

    Experiencia {
        date inicio
        date fim "opcional, ausente quando em curso"
        string titulo
        string[] detalhes
        string resumo
        string[] responsabilidades
        string[] tecnologias
        Link[] projetos
    }

    Formacao {
        date inicio
        date fim "opcional, ausente quando em curso"
        string titulo
        string[] detalhes
        string resumo
        string[] disciplinas
        string[] certificados
        Link[] projetos
    }

    Link {
        string titulo
        string url
    }
```
