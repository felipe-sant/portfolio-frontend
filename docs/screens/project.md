# Projeto

A tela Projeto (`/projects/:id`, também `/en/projects/:id` e `/es/projects/:id`, D32) é o estudo de
caso de um projeto: cabeçalho, galeria com lightbox, ficha técnica, stack, links, documentos em
markdown com endereço próprio (`README.md`, `ARCHITECTURE.md`, `SETUP.md` e `CHANGELOG.md`, D33) e
projetos relacionados. Quem a implementa é a issue F, com C (layout), E (card de projeto,
reaproveitado nos relacionados), W (idioma no caminho e função de URL com prefixo), S
(pré-renderização), V (canônica, Open Graph e o mecanismo do JSON-LD), T e Y (axe e ponta a
ponta). Este documento diz o comportamento; não escolhe nome de componente nem de arquivo, além do
namespace e da chave de tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-projeto.dc.html`, em
[`prototype/`](../design/prototype/README.md)), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md),
[`layout.md`](layout.md), dono de tudo que a tela divide com as outras (cabeçalho, rodapé, "Pular
para o conteúdo", foco no `h1` na troca de rota, restauração de rolagem, página não encontrada e
metadados comuns), e [`projects.md`](projects.md), dono do card de projeto e do estado da lista na
URL (D45).

Cada requisito funcional tem um ID `RF-PROJECT-nn`, estável e nunca reaproveitado: item que deixa
de valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O protótipo usa os
caminhos antigos (`/projetos`), o arquivo `ARQUITETURA.md`, abas de documento com `tablist`, a
legenda no nome das miniaturas e conteúdo provisório (PI5); valem D32, D33, `accessibility.md` e
este documento. O handoff não estava acessível na escrita; onde ele é citado, a referência vem da
issue #5 e de `decisions.md`.

## Objetivo

Contar como um problema foi resolvido, como estudo de caso: o que é o projeto, como ele aparece
(galeria), os fatos (ficha técnica e stack), onde vê-lo funcionando ou ler o código, a documentação
escrita pelo autor e para onde seguir (relacionados). Para o professor, é onde termina a jornada da
v1, em "Ver código no GitHub" ([`overview.md`](../product/overview.md)); para recrutador e cliente,
é o projeto em profundidade.

## Estados

| Estado                             | O que aparece                                                                                                                                                                                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sucesso, a partir de 980px         | "← Voltar para Projetos"; cabeçalho do projeto (badges, rótulo, `h1`, resumo); grade de duas colunas: à esquerda galeria e, abaixo, documentação (navegação fixa entre documentos, título do documento e markdown); à direita, coluna de 18rem fixa ao rolar com ficha técnica, stack e links. Abaixo da grade, relacionados |
| Sucesso, abaixo de 980px           | Uma coluna: galeria, ficha técnica (grade de pares, sem sticky), stack e links, depois documentação e relacionados (D19). Abaixo de 640px, miniaturas em linha rolável (D18)                                                                                                                                                 |
| Lightbox aberta                    | Diálogo sobre fundo `--overlay`: legenda e contador, botão Fechar, imagem ampliada, "Imagem anterior" e "Próxima imagem"; resto da página `inert` e rolagem travada                                                                                                                                                          |
| Carregando o projeto               | "← Voltar para Projetos" visível; skeleton `aria-hidden` do título, do resumo e da imagem 16:9; "Carregando..." visualmente oculto em `role="status"`. Não aparece na primeira carga de uma página pré-renderizada, que já traz o conteúdo                                                                                   |
| Carregando o documento             | Tudo da tela montado; na área do documento, título do documento e skeleton de linhas `aria-hidden` com "Carregando..." oculto em `role="status"`                                                                                                                                                                             |
| Erro do projeto                    | "← Voltar para Projetos"; bloco em `role="alert"` com ícone, `h1` "Não consegui carregar este projeto", texto, "Tentar novamente" e "Ver outros projetos"                                                                                                                                                                    |
| Parcial: documento não chegou      | Tudo da tela montado; na área do documento, depois do título, bloco em `role="alert"` com "Não consegui carregar este documento", texto e "Tentar novamente"; a navegação entre documentos continua                                                                                                                          |
| Parcial: imagem não chegou         | A imagem dá lugar ao placeholder neutro 16:9 com o `alt` como nome; legenda, contador e miniaturas continuam; sem mensagem                                                                                                                                                                                                   |
| Parcial: relacionados não chegaram | A seção de relacionados não aparece; sem mensagem                                                                                                                                                                                                                                                                            |
| Projeto sem captura                | Placeholder neutro 16:9 decorativo no lugar da galeria, sem miniaturas, legenda, contador nem ampliar (D26, D48)                                                                                                                                                                                                             |
| Não encontrado                     | Id inexistente, id fora do formato, documento opcional que o projeto não tem ou subcaminho desconhecido: página não encontrada do layout (RF-LAY-28)                                                                                                                                                                         |
| Sem JavaScript                     | O HTML pré-renderizado de cada documento e idioma tem cabeçalho do projeto, imagem principal, ficha, stack, links, navegação entre documentos (links reais), o documento renderizado e os relacionados. Ampliar, trocar de imagem e a lightbox precisam de JavaScript (NF-CO-03)                                             |

O estado "Vazio" do molde vira "Projeto sem captura" e "sem relacionados" (seção ausente): a tela
não tem lista que possa ficar vazia por busca.

## Validações

Não há formulário. Entradas e o que acontece quando falham:

| Entrada                                   | Regra                                                                               | Quando falha                                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `:id` no caminho                          | UUID v7 de um projeto do conteúdo (D32, NF-DA-07)                                   | Fora do formato: página não encontrada sem buscar dado. No formato, mas sem projeto: página não encontrada |
| Subcaminho do documento                   | Só `architecture`, `setup` e `changelog`, e só se o projeto tiver o documento (D33) | Página não encontrada                                                                                      |
| Prefixo de idioma                         | Sem prefixo, `/en/`, `/es/` (RF-LAY-11)                                             | Página não encontrada (RF-LAY-28)                                                                          |
| Âncora (`#...`) na URL                    | Id de um título do documento aberto                                                 | Ignorada: a tela abre no topo, sem erro                                                                    |
| Link `project:<id>` no markdown           | Id de projeto existente; documento, se citado, existente (teste de conteúdo da #13) | Em runtime, o texto do link aparece sem link                                                               |
| URL de link no markdown                   | Só `https:`, `http:`, `mailto:`, `project:` e `#âncora`                             | O texto aparece sem link                                                                                   |
| HTML, imagem e nota de rodapé no markdown | Proibidos (D06, D33, D50), barrados pelo teste de conteúdo                          | Em runtime, descartados: nada é renderizado nem executado                                                  |
| Imagens do projeto                        | De zero a cinco, todas 16:9, cada uma com `alt` nos três idiomas (D48)              | Teste de conteúdo falha                                                                                    |

## Permissões

Site público, sem login (DP03): qualquer visitante vê tudo e usa galeria, lightbox, documentos e
links. Não há ação restrita nem conteúdo oculto por perfil.
