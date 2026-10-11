# Informações

A tela Informações (`/about`, também sob `/en/about` e `/es/about`, D32) junta o que o recrutador
procura antes de chamar alguém para conversar: quem é o autor, o que ele domina, por onde passou e
o CV para baixar. Quem a implementa é a issue G, com C (layout), S (pré-renderização), V
(canônica, Open Graph e JSON-LD), I (botões de CV), L (foto) e #13 (conteúdo). Este documento diz o
comportamento; não escolhe nome de componente nem de arquivo, além do namespace e da chave de
tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-informacoes`, em
[`prototype/`](../design/prototype/README.md)), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md) e
[`layout.md`](layout.md) (cabeçalho, rodapé, foco na troca de rota e abertura de links).

Cada requisito funcional tem um ID `RF-ABOUT-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O texto do protótipo é
provisório (PI5): nenhum valor dele vira dado, e o conteúdo real vem da #13.

## Objetivo

Mostrar quem é o autor, o que ele domina e por onde passou, com a saída que o recrutador procura
("Baixar CV") à vista na primeira dobra, e deixar o detalhe de cada experiência, formação e curso a
um clique, sem sair da tela.

## Estados

| Estado                                  | O que aparece                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal, a partir de 640px               | Apresentação com a foto à esquerda (localização e disponibilidade abaixo dela) e, à direita, rótulo "Informações", `h1` com o nome, parágrafo de apresentação, "Baixar CV" e "Entrar em contato". Depois: Sobre mim (duas colunas quando cabem), Stack (três grupos), Complementos (faixa escura, duas colunas) e Trajetória (três grupos)                                                                   |
| Normal, abaixo de 640px                 | Mesma ordem em uma coluna: foto em cima do texto; complementos empilhados (a partir de 900–980px já empilham, [`design-system.md`](../design/design-system.md)); no item de trajetória, o período quebra para baixo do título (D20)                                                                                                                                                                          |
| Carregando                              | `h1`, títulos de seção, "Baixar CV" e "Entrar em contato" visíveis (não dependem do conteúdo); skeleton `aria-hidden` no lugar da foto (1:1), do parágrafo de apresentação, de localização e disponibilidade, dos parágrafos de Sobre mim, dos chips de Stack e Complementos e dos itens de trajetória (altura de um item); um único status "Carregando..." visualmente oculto em `role="status"` (A11Y-G13) |
| Erro ao carregar o perfil               | Nas partes que dependem do perfil (parágrafo de apresentação, localização e disponibilidade, Sobre mim, Stack, "Como eu trabalho"): mensagem "Não foi possível carregar esta parte da página." e o botão "Tentar novamente", que refaz só essa carga; o anúncio em `role="alert"` acontece uma vez, na primeira parte afetada (A11Y-G14). O resto da tela segue normal                                       |
| Erro ao carregar a trajetória           | O mesmo, em Trajetória e na coluna "Certificados" (derivada da trajetória, D38)                                                                                                                                                                                                                                                                                                                              |
| Erro ao carregar os projetos            | Só o bloco "Projetos relacionados" do modal deixa de aparecer; sem mensagem (o resto do detalhe é útil sozinho)                                                                                                                                                                                                                                                                                              |
| Vazio                                   | Parte sem dado não aparece, com o título junto (nunca título sem conteúdo): grupo de stack ou de trajetória sem itens, coluna de complementos sem itens, faixa de complementos com as duas colunas vazias, seção Stack ou Trajetória sem nenhum item. Apresentação e Sobre mim são obrigatórios no contrato e nunca ficam vazios                                                                             |
| Foto ainda não entregue (D26 bloqueada) | Placeholder neutro 1:1 (`--bg-placeholder`, borda `--border-subtle`), decorativo (`aria-hidden`, sem `role="img"`, achado de `accessibility.md`)                                                                                                                                                                                                                                                             |
| Modal aberto, a partir de 640px         | Fundo `--overlay` sobre a página; caixa centralizada de até 34rem, `--radius`, `--shadow-modal`, com cabeçalho fixo dentro dela (título, linha de metadados e "Fechar") e o corpo rolando; rolagem da página travada                                                                                                                                                                                         |
| Modal aberto, abaixo de 640px (D20)     | Tela cheia, sem raio nem margem, mesmo conteúdo                                                                                                                                                                                                                                                                                                                                                              |
| Sem JavaScript                          | HTML pré-renderizado (S) com todas as seções e o detalhe de cada item no HTML, fechado (D37); "Baixar CV", "Entrar em contato" e os links do layout funcionam; os itens de trajetória não abrem o modal (NF-CO-03)                                                                                                                                                                                           |

## Validações

Não há campo de formulário. As regras abaixo são do conteúdo, verificadas pelo teste de conteúdo
da #13 (o build falha), com o comportamento da tela se algo passar:

| Entrada                                 | Regra                                                                              | Na tela, se falhar                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Início e fim de item de trajetória      | `AAAA-MM` (ISO 8601); fim opcional (ausente = em curso) e maior ou igual ao início | Não se aplica: o teste de conteúdo barra                                    |
| Tipo de item de trajetória              | `experience`, `education` ou `course`                                              | Item com tipo desconhecido não aparece                                      |
| Categoria de stack                      | `frontend`, `backend` ou `tooling`                                                 | Grupo com categoria desconhecida não aparece                                |
| Projeto relacionado                     | id (UUID v7, NF-DA-07) de um projeto existente no conteúdo do mesmo idioma         | O link não aparece; se nenhum sobrar, o bloco não aparece                   |
| Resumo do item, apresentação, Sobre mim | Obrigatórios, não vazios                                                           | Não se aplica: o teste de conteúdo barra                                    |
| Arquivo do CV                           | `cv/cv-<idioma>.pdf` sob `import.meta.env.BASE_URL`, gerado por X                  | Até X existir, o link quebra (aceito em M5, como em `layout.md`, RF-LAY-27) |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê tudo e usa todas as ações. Não há
ação restrita.
