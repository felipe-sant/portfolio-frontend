# Início

A tela Início (`/`, também sob `/en/` e `/es/`, D32) é a primeira impressão do portfólio e o fim da
jornada do recrutador ("Baixar CV" no hero). Quem a implementa é a issue D, com A (tokens, tema e
foco), B (componentes base e ícones, inclusive pausa e play de D28), C (layout), W (idioma no
caminho), V (canônica, Open Graph e o mecanismo do JSON-LD), S (pré-renderização) e I (botões de CV
ligados aos PDFs). Este documento diz o comportamento; não escolhe nome de componente nem de
arquivo, além do namespace e da chave de tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-inicio`, em
[`prototype/`](../design/prototype/README.md)), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md),
[`glossary.md`](../product/glossary.md) e [`layout.md`](layout.md), dono de tudo que a tela divide
com as outras (cabeçalho, rodapé, "Pular para o conteúdo", foco no `h1` na troca de rota,
canônica, `hreflang` e Open Graph).

Cada requisito funcional tem um ID `RF-HOME-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O protótipo usa caminhos
antigos (`prototipo-*.dc.html`) e três destaques de exemplo, e o texto dele é provisório (PI5):
vale o que este documento diz, com a tabela de divergências no fim de "Regras de negócio".

## Objetivo

Mostrar em poucos segundos quem é o autor e o que faz agora, provar com até quatro projetos
escolhidos e levar cada público ao próximo passo: o recrutador ao CV ou a Informações, o cliente e
o professor à lista de projetos ou a um estudo de caso.

## Estados

Na primeira carga de cada idioma o HTML pré-renderizado (S) já traz os dados (NF-IA-01, NF-IA-03),
então "carregando" só aparece em navegação interna, antes de o conteúdo estar no cache da store.
Cada bloco de dados (perfil, status atual, stack e destaques) tem estado próprio. No hero, `h1` e
botões nunca esperam dado; selo e parágrafo vêm do perfil.

| Estado                                 | O que aparece                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal                                 | Hero (selo de disponibilidade com a frase do perfil, se `isAvailable`, `h1` "Desenvolvedor full stack em TypeScript", parágrafo, "Ver projetos" e "Baixar CV"); status atual com os cards "Trabalhando como" e "Cursando"; faixa escura de stack com o botão de pausa; "Projetos em destaque" com "Ver todos →" e até quatro projetos em ritmo alternado; "Ver todos os projetos" e "Ler sobre mim"                                                                                                      |
| Carregando                             | Hero com `h1` e botões prontos; skeleton do tamanho do selo no lugar dele e três linhas de skeleton no lugar do parágrafo (largura até `--measure`); dois skeletons de card (6.5rem) no status; a faixa de stack com altura reservada e sem itens; dois skeletons de destaque (imagem 16:9, título e duas linhas) em ritmo alternado. Skeletons `aria-hidden`, shimmer `--dur-shimmer` (sem animação com movimento reduzido) e um único "Carregando..." visualmente oculto em `role="status"` (A11Y-G13) |
| Vazio: perfil com `isAvailable: false` | Sem selo; o resto igual                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Vazio: nada em curso                   | Card sem item em curso some; os dois sem item, a seção de status some inteira (heading inclusive)                                                                                                                                                                                                                                                                                                                                                                                                        |
| Vazio: stack sem itens                 | A faixa some inteira                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Vazio: nenhum projeto em destaque      | Heading "Projetos em destaque" e "Ver todos →" ficam; no lugar da lista, bloco de borda tracejada ("tracejado marca o que não é conteúdo real", [`design-system.md`](../design/design-system.md)) com "Nenhum projeto em destaque no momento"; as saídas continuam                                                                                                                                                                                                                                       |
| Erro: perfil                           | Sem selo e sem parágrafo, sem mensagem: `h1` e botões ficam e bastam para seguir (a falha do perfil já é visível pelo rodapé sem contato, RF-LAY-21)                                                                                                                                                                                                                                                                                                                                                     |
| Erro: status atual                     | No lugar dos cards, alerta (`role="alert"`, `--danger-surface`/`--danger-ink`, ícone de alerta) "Não consegui carregar o que faço agora", "Verifique sua conexão e tente de novo." e botão "Tentar novamente"                                                                                                                                                                                                                                                                                            |
| Erro: stack                            | A faixa some, sem mensagem (a stack também está em Informações)                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Erro: destaques                        | No lugar da lista, o alerta do protótipo: "Não consegui carregar os projetos", "Verifique sua conexão e tente de novo." e "Tentar novamente"; heading e saídas ficam                                                                                                                                                                                                                                                                                                                                     |
| Tentando de novo                       | O bloco volta a "carregando" só ali; o foco vai para o heading do bloco quando o conteúdo chega ou para o alerta quando falha de novo                                                                                                                                                                                                                                                                                                                                                                    |
| Faixa pausada                          | Itens parados na posição em que estavam; o botão mostra o ícone de play e `aria-pressed="true"`                                                                                                                                                                                                                                                                                                                                                                                                          |
| Movimento reduzido                     | Faixa estática que quebra linha, com a lista uma vez e sem cópia, sem botão de pausa (nada se move); sem shimmer e sem deslocamento no hover                                                                                                                                                                                                                                                                                                                                                             |
| Sem JavaScript                         | HTML pré-renderizado com todos os blocos no estado normal, legíveis (NF-CO-03); a faixa anima por CSS; pausar, "Tentar novamente" e salvar idioma precisam de JavaScript                                                                                                                                                                                                                                                                                                                                 |

## Validações

Não há campo de formulário. Regras sobre o dado que a tela recebe, verificadas pelo teste de
conteúdo da #13, com o comportamento da tela se algo passar:

| Dado                         | Regra                                                                                        | Quando falha                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Projetos em destaque         | No máximo quatro com a marcação de destaque no conteúdo (D-NOVA-3a); `date` em `AAAA-MM`     | O teste de conteúdo da #13 falha; se mesmo assim chegarem mais de quatro, a tela mostra os quatro primeiros pela ordem de D-NOVA-3a |
| Id do projeto                | UUID v7 (NF-DA-07), usado no link `/projects/:id`                                            | Teste de conteúdo da #13; a tela não valida                                                                                         |
| Imagem do destaque           | Primeira captura 16:9 do projeto (D26), com largura e altura                                 | Projeto sem captura mostra o placeholder neutro 16:9 (`--bg-placeholder`, borda de 1px, `aria-hidden`)                              |
| Datas do status              | Início em `AAAA-MM`, exibido "desde `MM/AAAA`" por `Intl` dentro de `<time>` (NF-IN-04, D39) | Teste de conteúdo da #13                                                                                                            |
| Texto do conteúdo por idioma | Presente no idioma ativo (NF-IN-02)                                                          | Teste de conteúdo da #13; a tela não cai para outro idioma                                                                          |
| CV                           | Caminho `cv/cv-<idioma>.pdf` com `import.meta.env.BASE_URL` (D14, NF-DA-03)                  | Antes de X gerar os PDFs o link quebra (aceito até I, roadmap M6)                                                                   |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê e usa tudo. Não há ação restrita.
