# Layout compartilhado

O layout é tudo que aparece em mais de uma tela: cabeçalho, menu mobile, seletor de idioma,
alternador de tema, rodapé (padrão e a variação de navegação em `/contact`), página não
encontrada, página de erro e metadados por rota e idioma. Quem o implementa é a issue C, com A
(tokens, tema e foco), B (componentes e ícones), W (idioma no caminho, função de URL equivalente e
redirecionamento da raiz) e V (canônica, Open Graph e JSON-LD). Este documento diz o
comportamento; não escolhe nome de componente nem de arquivo, além do namespace e da chave de
tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`ProtoHeader`, `ProtoFooter`,
`prototipo-404` e `prototipo-erro`, em [`prototype/`](../design/prototype/README.md)),
[`accessibility.md`](../product/accessibility.md) e
[`non-functional-requirements.md`](../product/non-functional-requirements.md).

Cada requisito funcional tem um ID `RF-LAY-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `accessibility.md`). O protótipo usa os
caminhos antigos (`/projetos`, `/contato`); valem os caminhos em inglês de `D32`.

## Objetivo

Dar a todas as telas a mesma moldura: quem é o autor (gato e nome, que levam ao início), para onde
ir (navegação com a tela atual marcada), em que idioma e tema ler e como falar com o autor
(rodapé), e dizer o que aparece quando a página não existe ou quebra.

## Estados

| Estado                                 | O que aparece                                                                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal, a partir de 640px              | Cabeçalho fixo no topo: gato e nome à esquerda; à direita, navegação (Início, Projetos, Informações, Contato), seletor `PT · EN · ES` e alternador de tema. Conteúdo da tela no `main`. Rodapé padrão (ou de navegação em `/contact`)                        |
| Normal, abaixo de 640px, menu fechado  | Cabeçalho com gato e nome e o botão de menu de 44px (ícone hambúrguer); navegação, seletor e alternador ficam no painel                                                                                                                                      |
| Menu aberto (abaixo de 640px)          | Painel em largura total abaixo do cabeçalho até o fim da tela, rolável por dentro: links em coluna de 52px, depois "Idioma" com três botões de 44px e "Tema" com o alternador. Botão mostra o ícone ×. Rolagem da página travada e o resto da página `inert` |
| Carregando a tela (código da rota)     | Cabeçalho e rodapé visíveis; no lugar do conteúdo, só o status "Carregando..." visualmente oculto em `role="status"` (A11Y-G13). O carregamento de dados de cada tela é da spec dela                                                                         |
| Carregando o conteúdo do rodapé        | O rodapé mostra só o que não depende do conteúdo: rótulo "Contato", link "Entrar em contato", barra inferior. Disponibilidade, localização, e-mail, "Copiar e-mail" e redes aparecem quando o conteúdo chega, sem skeleton (o rodapé fica abaixo da dobra)   |
| Conteúdo do rodapé indisponível (erro) | Igual a "carregando", sem mensagem de erro no rodapé: o erro de carregamento é anunciado pela tela (A11Y-G14), não pelo rodapé                                                                                                                               |
| E-mail copiado                         | O botão "Copiar e-mail" passa a "E-mail copiado" por 2,2 s e o resultado é anunciado em `role="status"` (A11Y-L11)                                                                                                                                           |
| Falha ao copiar                        | O botão passa a "Não foi possível copiar" por 2,2 s, anunciado no mesmo `role="status"`. O e-mail continua visível ao lado para cópia manual                                                                                                                 |
| `/contact` (D04, D21)                  | Rodapé de navegação: colunas "Navegação" (Início, Projetos, Informações) e "Redes" (GitHub, LinkedIn, "Currículo em PDF"), sem a chamada para contato, sem e-mail e sem "Copiar e-mail"; barra inferior igual                                                |
| Página não encontrada                  | Cabeçalho sem item ativo, rótulo "Erro 404", `h1` "Página não encontrada", texto, "Ver projetos" (primário) e "Voltar para o início"; rodapé padrão                                                                                                          |
| Página de erro                         | Cabeçalho sem item ativo, ícone de alerta, `h1` "Erro inesperado", texto, "Tentar novamente" (primário) e "Voltar para o início"; rodapé padrão. Nunca mostra a mensagem técnica do erro                                                                     |
| Sem JavaScript                         | O HTML pré-renderizado (S) tem cabeçalho, navegação, seletor de idioma (links reais, funcionam sem JS) e rodapé legíveis. Menu mobile, alternador de tema, "Copiar e-mail" e salvar a escolha de idioma precisam de JavaScript (NF-CO-03)                    |

O estado "Vazio" do molde não se aplica ao layout, que não tem lista própria.

## Validações

Não há campo de formulário no layout. Regras de entrada e o que acontece quando falham:

| Entrada                                 | Regra                                                                                                            | Quando falha                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Prefixo de idioma no caminho            | Só sem prefixo (`pt-BR`), `/en/` e `/es/` (NF-IN-06)                                                             | Prefixo desconhecido (`/fr/projects`) cai na página não encontrada, em `pt-BR` |
| `?lng=` na URL                          | Ignorado (NF-IN-08)                                                                                              | Nada muda; o caminho decide                                                    |
| Tema salvo no navegador                 | Só `light` ou `dark`                                                                                             | Valor ausente ou inválido é ignorado: vale `prefers-color-scheme` (NF-TE-02)   |
| Idioma salvo no navegador               | Só `pt-BR`, `en` ou `es`; só redireciona a raiz `/` (NF-IN-09, W)                                                | Valor inválido é ignorado                                                      |
| `?tema=` na URL                         | Não é recurso do produto (D35, RF-LAY-19)                                                                        | Ignorado                                                                       |
| Área de transferência ("Copiar e-mail") | `navigator.clipboard.writeText` precisa existir e resolver                                                       | "Não foi possível copiar" (ver Estados)                                        |
| Rota de tela, id de projeto, documento  | Só os caminhos de D32; id inexistente, documento opcional que o projeto não tem ou subcaminho desconhecido (D33) | Página não encontrada                                                          |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê e usa tudo do layout. Não há ação
restrita. A flag do formulário de contato (D05) não muda o layout: o link do rodapé leva a
`/contact` com a flag ligada ou desligada.
