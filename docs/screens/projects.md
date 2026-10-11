# Projetos

A tela Projetos (`/projects`, também `/en/projects` e `/es/projects`, D32) é o passo do meio da
jornada do cliente (Início → Projetos → Projeto, [`overview.md`](../product/overview.md)): a lista
completa de projetos, com busca, filtros de tipo e categoria, ordenação e carregamento incremental.
Quem a implementa é a issue E, com B (componentes base, inclusive chip, campo de busca e skeleton),
C (layout), W (idioma no caminho), S (pré-renderização) e V (canônica e o mecanismo do JSON-LD).
Este documento diz o comportamento; não escolhe nome de componente nem de arquivo, além do
namespace e da chave de tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-projetos`, em
[`prototype/`](../design/prototype/README.md), com os estados `?estado=carregando`, `vazio` e
`erro`), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md) e
[`layout.md`](layout.md), dono de tudo que a tela divide com as outras (cabeçalho, rodapé, "Pular
para o conteúdo", foco no `h1` na troca de rota, restauração de rolagem e metadados comuns), que
não se repete aqui.

Cada requisito funcional tem um ID `RF-PROJECTS-nn`, estável e nunca reaproveitado: item que deixa
de valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). Os exemplos de busca e
de filtro usam os dez projetos fictícios do protótipo, que não são conteúdo (PI5); os testes da E
usam um fixture próprio no formato da #10.

## Objetivo

Deixar quem visita, principalmente o cliente, achar em poucos segundos um projeto parecido com o
problema dele, por nome, tecnologia, tipo ou categoria, e abrir o estudo de caso.

## Estados

| Estado                       | O que aparece                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Carregando                   | `h1`, introdução, busca, ordenação e filtros visíveis e usáveis; contagem "Carregando projetos…" em `role="status"`; nove skeletons na forma do card, em `aria-hidden`; sem "Limpar filtros" nem "Carregar mais" (A11Y-G13). Só na navegação no cliente sem cache: o HTML pré-renderizado já vem com a lista |
| Sucesso                      | Contagem "`<mostrados>` de `<total>` projetos", "Limpar filtros" se houver busca, tipo ou categoria, a grade com até nove cards a mais por lote e "Carregar mais" enquanto houver projeto não mostrado                                                                                                       |
| Sem resultado                | Contagem "Nenhum projeto encontrado"; bloco tracejado com `h2` "Nenhum projeto encontrado", texto conforme haja termo de busca ou não, e botão "Limpar filtros"; sem grade e sem "Carregar mais"                                                                                                             |
| Vazio (conteúdo sem projeto) | `h1` e introdução; sem busca, filtros, ordenação e contagem; bloco tracejado com `h2` "Nenhum projeto publicado" e texto. Não deve acontecer na v1 (o conteúdo tem projetos), mas a tela não quebra                                                                                                          |
| Erro                         | Busca, filtros e ordenação continuam com o que estava escolhido; contagem vazia; bloco `role="alert"` em `--danger-surface`/`--danger-ink` com ícone de alerta, "Não consegui carregar a lista de projetos", "Verifique sua conexão e tente de novo. Seus filtros foram mantidos." e "Tentar novamente"      |
| Sem JavaScript               | O HTML pré-renderizado (S) mostra `h1`, introdução, os controles e os nove primeiros cards na ordem padrão, com os links funcionando; busca, filtros, ordenação e "Carregar mais" precisam de JavaScript (NF-CO-03, NF-IA-17); os demais projetos estão em `llms-full*.txt` e no `sitemap.xml` (NF-IA-02)    |

## Validações

Não há formulário enviado; a busca e a URL são entradas.

| Entrada                          | Regra                                                                                                                                                                                                       | Quando falha                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Termo de busca                   | Até 100 caracteres (`maxLength`); espaços nas pontas não contam                                                                                                                                             | O campo não aceita mais que 100; termo só com espaços vale como sem busca |
| Caracteres especiais na busca    | Comparados como texto literal (`.`, `+`, `#`, `(` não são padrão)                                                                                                                                           | Nunca falha: "c#" e "node.js" casam o texto como escrito                  |
| `?q=`                            | Mesmo tratamento do campo                                                                                                                                                                                   | Mais de 100 caracteres: usa os 100 primeiros                              |
| `?type=`                         | Um dos 12 códigos do enum (`web`, `mobile`, `api`, `desktop`, `cli`, `library`, `extension`, `bot`, `data`, `game`, `iot`, `infra`); código válido sem projeto no conteúdo também vale e dá "sem resultado" | Valor desconhecido ou vazio: ignorado (vale "Todos")                      |
| `?category=`                     | `academic`, `personal` ou `professional`                                                                                                                                                                    | Valor desconhecido ou vazio: ignorado (sem categoria)                     |
| `?sort=`                         | `recent`, `oldest` ou `title`                                                                                                                                                                               | Valor desconhecido: ignorado (vale `recent`)                              |
| Parâmetro repetido               | Vale o primeiro (`?type=web&type=api` é `web`)                                                                                                                                                              | —                                                                         |
| Parâmetro desconhecido (`?foo=`) | Ignorado; não muda a tela                                                                                                                                                                                   | —                                                                         |
| `?lng=`, `?tema=`                | Ignorados (NF-IN-08, D35)                                                                                                                                                                                   | —                                                                         |

Valor ignorado some da URL na próxima mudança de busca, filtro ou ordenação (a URL é reescrita a
partir do estado válido).

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê a lista, busca, filtra, ordena e
abre qualquer projeto. Não há projeto oculto por perfil; projeto que não deve aparecer não está no
conteúdo.
