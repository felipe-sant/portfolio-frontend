# Portfólio — Luiz Felipe dos Santos

Repositório do aluno **LUIZ FELIPE DOS SANTOS** (RA 2581392423047), do curso de Desenvolvimento de
Software Multiplataforma da Fatec Jacareí, para a entrega do portfólio.

**Acesse o portfólio:** <https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/home-dark.png">
  <img src="docs/readme/home-light.png" alt="Tela Início do portfólio: status atual, título com a função e os botões Ver projetos e Baixar CV" width="100%">
</picture>

## Versão publicada

A versão publicada é a **{{TAG}}**, gerada a partir do commit
[`{{SHA}}`](https://github.com/felipe-sant/portfolio-frontend/commit/{{SHA}}) do repositório de origem
([release {{TAG}}](https://github.com/felipe-sant/portfolio-frontend/releases/tag/{{TAG}})). O mesmo
dado está na mensagem do último commit deste repositório, na linha `Origem:`.

## Sobre o projeto

Portfólio pessoal de desenvolvedor full stack. Apresenta quem eu sou, o que faço hoje, os projetos
que desenvolvi (com galeria, documentação e ficha técnica de cada um), minha stack e minha
trajetória, além de canais de contato.

O site tem tema claro e escuro e está disponível em três idiomas, escolhidos pelo endereço:

| Idioma    | Endereço                                                              |
| --------- | --------------------------------------------------------------------- |
| Português | <https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/pt-BR> |
| English   | <https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/en>    |
| Español   | <https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/es>    |

### Telas

| Tela        | Caminho         | O que mostra                                                           |
| ----------- | --------------- | ---------------------------------------------------------------------- |
| Início      | `/`             | Apresentação, projetos em destaque e faixa de tecnologias              |
| Projetos    | `/projects`     | Lista de projetos com busca e filtros por tipo, categoria e tecnologia |
| Projeto     | `/projects/:id` | Estudo de caso: galeria, documentação e ficha técnica                  |
| Informações | `/about`        | Sobre mim, stack, complementos e trajetória                            |
| Contato     | `/contact`      | Canais diretos de contato                                              |

## Tecnologias

- React 19 e TypeScript
- Vite
- React Router
- Redux Toolkit e RTK Query
- i18next e react-i18next
- CSS Modules
- Vitest, Testing Library e Playwright

## Onde fica o código

O código-fonte e o histórico de desenvolvimento ficam em
[felipe-sant/portfolio-frontend](https://github.com/felipe-sant/portfolio-frontend). Este
repositório recebe apenas o resultado do build, na pasta `docs/`, publicado no GitHub Pages.

A cada versão nova do portfólio, o workflow
[`fatec-pages.yml`](https://github.com/felipe-sant/portfolio-frontend/blob/{{TAG}}/.github/workflows/fatec-pages.yml)
do repositório de origem gera o build e atualiza a pasta `docs/` e este `README.md` aqui. Por isso,
**alterações feitas diretamente em `docs/` ou neste arquivo são sobrescritas** na próxima publicação.

## Versão

A entrega da Fatec é a v1: dados reais do conteúdo em arquivos locais, sem backend. A versão
publicada aparece no rodapé do site.

## Licença

[MIT](https://github.com/felipe-sant/portfolio-frontend/blob/main/LICENSE)
