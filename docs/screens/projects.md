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

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Estrutura

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Fonte                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `RF-PROJECTS-01` | Ordem da tela dentro do `main` do layout (a página não renderiza o próprio `main`; item ativo "Projetos", RF-LAY-04): `h1` "Projetos"; introdução "Tudo o que construí e posso mostrar: trabalho profissional, projetos da faculdade e o que fiz por conta própria."; linha com busca e ordenação; linha de filtros; linha com a contagem e "Limpar filtros"; erro, sem resultado ou grade; "Carregar mais". Nenhum outro heading entre o `h1` e os títulos dos cards | Protótipo, `accessibility.md` (headings) |

### Busca

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Fonte                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `RF-PROJECTS-02` | Campo `type="search"` de 44px de altura, com rótulo "Buscar projeto" em texto visualmente oculto ligado por `label`, placeholder "Busque por nome ou tecnologia" e `maxLength` 100. Sem texto, mostra a lupa decorativa (`aria-hidden`); com texto, no lugar da lupa aparece o botão "Limpar busca" (ícone ×, 44px), que esvazia o campo, aplica na hora e devolve o foco ao campo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Protótipo, A11Y-PS01, D15                                          |
| `RF-PROJECTS-03` | Busca da v1 (a busca inteligente é a issue Z, fora da v1). Considera o título e todas as tecnologias do projeto (não só as do card), no idioma ativo; não considera o resumo. Ignora caixa e acento: o termo e o texto são decompostos em NFD, perdem as marcas diacríticas e vão para minúsculas no idioma ativo. O termo é aparado e dividido por espaços; cada palavra precisa aparecer, como trecho, no título ou em alguma tecnologia, e palavras diferentes podem casar em campos diferentes. Entrada → resultado com os dados do protótipo: "maps" → Maps; "REACT" → os quatro com React ou React Native (Maps, Plataforma de cursos, Check-in de eventos, Rastreio de entregas); "react native" → Check-in de eventos e Rastreio de entregas; "react postgis" → Maps (React e PostGIS); "catalogo" → Catálogo de componentes; "blockchain" → sem resultado | D16 ("a busca já filtra por tecnologia"), placeholder do protótipo |
| `RF-PROJECTS-04` | O termo é aplicado 300 ms depois da última tecla (lista, contagem, "Limpar filtros" e URL juntos), para a contagem ser anunciada uma vez, quando a digitação para. "Limpar busca" e "Limpar filtros" aplicam na hora. Enter não envia nada nem recarrega a página                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `accessibility.md` (Anúncios dinâmicos), NF-DE-03                  |

### Filtros

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Fonte                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `RF-PROJECTS-05` | Tipo: grupo com nome "Tipo" (`role="group"`, `aria-label`), botão "Todos" e um botão por valor do enum de tipo, escolha única no filtro, `aria-pressed` no ativo. Sem tipo escolhido, "Todos" está ativo. Clicar no tipo ativo não muda nada; clicar em outro troca. O enum tem 12 tipos, nesta ordem: Web, Mobile, API, Desktop, CLI, Biblioteca, Extensão, Bot / automação, Dados / IA, Jogo, IoT / embarcado, Infraestrutura. O filtro mostra só os tipos presentes em pelo menos um projeto publicado (derivado do conteúdo do idioma ativo), na ordem do enum, para a linha rolável do celular não crescer à toa (D16). O projeto tem um ou mais tipos e aparece se **algum** deles for o escolhido: um projeto `["web", "api"]` aparece em Web e em API. Entrada → resultado: conteúdo só com projetos Web e API → botões Todos, Web, API; projeto `["web", "api"]` com filtro API → aparece. Os exemplos com dados do protótipo usam Web, Mobile e API, um tipo por projeto | PO (11-10-2026), protótipo, A11Y-PS02, `accessibility.md` (`group`, não `toolbar`) |
| `RF-PROJECTS-06` | Categoria: grupo com nome "Categoria", botões "Acadêmicos", "Pessoais" e "Profissionais", escolha única opcional, `aria-pressed`. Clicar na categoria ativa a desmarca; clicar em outra troca                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Protótipo, A11Y-PS02                                                               |
| `RF-PROJECTS-07` | Combinação: um projeto aparece se casar a busca **e** o tipo **e** a categoria; grupo sem escolha não restringe. Entrada → resultado (dados e tipos do protótipo): tipo Web → 5; Web + Acadêmicos → 2 (Plataforma de cursos, Controle de estoque); Web + Acadêmicos + "prisma" → 1 (Controle de estoque); Mobile + Profissionais → sem resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Issue #4                                                                           |
| `RF-PROJECTS-08` | Aparência dos filtros: botão de 44px, `--radius`; ativo com `--bg-highlight`, borda `--brand-variant` e peso 600; inativo transparente com `--border-subtle` e peso 500. Um separador vertical em `aria-hidden` entre os dois grupos. A partir de 640px a linha quebra; abaixo de 640px é uma linha só com rolagem horizontal que encosta nas bordas da tela, sem barra visível, alcançável por Tab, com folga interna para o contorno de foco não ser cortado (D27). Sem modal de filtros, sem filtro por tecnologia ou ano em controle próprio                                                                                                                                                                                                                                                                                                                                                                                                                                   | D11, D16, D27, A11Y-PS07                                                           |

### Ordenação

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                               | Fonte                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `RF-PROJECTS-09` | `select` nativo com rótulo visível "Ordenar" (`label` envolvendo), 44px: "Mais recente" (padrão), "Mais antigo" e "A–Z". Mais recente: `date` decrescente; Mais antigo: crescente; A–Z: título pelo `Intl.Collator` do idioma ativo (`sensitivity: "base"`, `numeric: true`). Desempate: nas duas por data, título A–Z; em A–Z, data decrescente; por fim, o id. A ordenação não conta como filtro: não liga "Limpar filtros" e não é limpa por ele | Protótipo, A11Y-PS03 |

### Resultado

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Fonte                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `RF-PROJECTS-10` | Contagem em `role="status"` presente e vazia desde a primeira renderização; o texto entra depois de a região montar, inclusive "Carregando projetos…" na navegação interna sem cache, para o primeiro anúncio não se perder. Textos: "`<mostrados>` de `<total>` projetos" (`total` depois de busca e filtros), "1 de 1 projeto" no singular, "Nenhum projeto encontrado" sem resultado, "Carregando projetos…" carregando, vazia no erro. Atualiza junto com a lista, então é anunciada uma vez por mudança de filtro, de ordenação, de busca (depois da pausa de RF-PROJECTS-04) e por "Carregar mais" | A11Y-PS04, `accessibility.md` (Anúncios dinâmicos) |
| `RF-PROJECTS-11` | "Limpar filtros" (botão de texto, 44px de altura) aparece quando há termo de busca, tipo ou categoria; zera os três, mantém a ordenação, volta ao primeiro lote e põe o foco no campo de busca (o botão some). O botão do estado sem resultado faz o mesmo                                                                                                                                                                                                                                                                                                                                               | Protótipo                                          |

### Carregamento incremental

Decisão `D46`.

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                 | Fonte                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `RF-PROJECTS-12` | Lote de 9: a grade mostra os nove primeiros da lista filtrada e ordenada. "Carregar mais" aparece enquanto houver projeto não mostrado; cada clique mostra mais nove (ou o que faltar) e o botão some quando todos estão na tela. Nunca páginas numeradas, nunca rolagem infinita. Entrada → resultado: 10 projetos → "9 de 10 projetos" → clique → "10 de 10 projetos", sem botão; 20 projetos → "9 de 20" → "18 de 20" → "20 de 20" | PO (11-10-2026; o protótipo usa 6), `overview.md` (fora de escopo), `D46` |
| `RF-PROJECTS-13` | Ao clicar em "Carregar mais", o foco vai para o link do primeiro card novo e a contagem nova é anunciada. Com a lista inteira já carregada do conteúdo local (RF-PROJECTS-26), revelar o lote é imediato: não há estado de carregamento nem skeleton no botão (o atraso de 900 ms e os três skeletons do protótipo são simulação). Mudar busca, filtro ou ordenação volta ao primeiro lote                                            | A11Y-PS05, PI5, `D46`                                                     |

### Card

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Fonte                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `RF-PROJECTS-14` | A grade é uma lista (`ul`, um `li` por card). Cada card, de cima para baixo: imagem 16:9 (captura de D26 com `alt=""`, ou placeholder neutro `--bg-placeholder` com borda, `aria-hidden`); linha com o título e, à direita, o ano em `time` (`datetime="AAAA-MM"`, texto `AAAA`, `--font-mono`); linha "`<tipos>` · `<categoria>`" no singular, com todos os `types` do projeto na ordem do conteúdo, cada um por `common:projectType.<código>`, e a categoria por `common:projectCategory.<código>`, separados por `·` (`common:symbols.separator`, `aria-hidden`), caixa alta por CSS (ex.: "Web · API · Pessoal"); resumo com no máximo duas linhas visíveis (corte por CSS, o texto inteiro no DOM); tecnologias principais (até três) como chips em lista | Protótipo, D11, D26, `accessibility.md` (Imagens)                   |
| `RF-PROJECTS-15` | O título é `h2` e contém o único link do card, para `/projects/<id>` com o prefixo do idioma (NF-IN-11, D36: mesma aba). O nome acessível do link é exatamente o título. O card inteiro é clicável por extensão da área do link no CSS, sem nada interativo aninhado. Hover: `translateY(-3px)`, sem movimento com `prefers-reduced-motion`                                                                                                                                                                                                                                                                                                                                                                                                                    | A11Y-PS06, `accessibility.md` (título do card era `span`), A11Y-G12 |
| `RF-PROJECTS-16` | Projeto em destaque: estrela de 14px em `--brand-variant` depois do título, `aria-hidden`, com "Em destaque" (`common:projectCard.featured`) em texto visualmente oculto dentro do `h2` e fora do link (o heading diz o destaque, o link continua só com o título)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Protótipo, NF-IA-16                                                 |
| `RF-PROJECTS-17` | Grade de colunas com largura mínima de 18rem preenchendo o espaço: 1 coluna em 360 e 390px, 2 em 768px, 3 em 1280px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | D17, NF-RE-04                                                       |
| `RF-PROJECTS-18` | Imagens dos cards reservam a proporção 16:9 (`width`/`height` ou `aspect-ratio`), com `srcset`/`sizes`; as três primeiras sem `loading="lazy"` e a primeira com `fetchpriority="high"` quando for a imagem do LCP, as demais com `loading="lazy"` e `decoding="async"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | NF-DE-14, NF-DE-16, NF-DE-17                                        |

### Estados

| ID               | Regra                                                                                                                                                                                                                                                                                                | Fonte                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `RF-PROJECTS-19` | Carregando: conforme a tabela de Estados; os controles aceitam mudança e a aplicam quando a lista chega                                                                                                                                                                                              | Protótipo (`?estado=carregando`), A11Y-G13                                   |
| `RF-PROJECTS-20` | Sem resultado: texto "Nenhum resultado para “`<termo>`”. Tente outro termo ou remova os filtros." quando há termo, e "Nenhum projeto com essa combinação de filtros." quando não há; o termo aparece como texto, nunca como HTML                                                                     | Protótipo (`?estado=vazio`)                                                  |
| `RF-PROJECTS-21` | Vazio: conforme a tabela de Estados, texto "Os projetos aparecem aqui assim que eu publicar o primeiro."                                                                                                                                                                                             | `design-system.md` (Voz e copy: "estado vazio e erro dizem o que aconteceu") |
| `RF-PROJECTS-22` | Erro: conforme a tabela de Estados; "Tentar novamente" refaz o pedido sem recarregar a página (`refetch` do RTK Query), mostra o estado carregando e põe o foco no `h1`; busca, filtros e ordenação escolhidos continuam valendo. O texto não fala em servidor (R1) e mensagem técnica nunca aparece | Protótipo (`?estado=erro`), A11Y-G14, RF-LAY-30 (mesmo motivo)               |

### Estado na URL

Decisão `D45`.

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Fonte                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `RF-PROJECTS-23` | Busca, tipo, categoria e ordenação ficam na query: `q`, `type`, `category`, `sort`, com os valores em inglês de "Validações"; valor padrão não aparece (sem busca, "Todos", sem categoria, `recent`), e `/projects` sem query é a lista padrão. A URL muda por substituição (`replace`), nunca criando entrada no histórico por tecla ou clique; a ordem dos parâmetros é sempre `q`, `type`, `category`, `sort`. Entrada → resultado: abrir `/projects?type=web&sort=title` mostra a lista já filtrada e ordenada. A canônica não leva query (NF-IA-11) | Issue #4, `D45`                       |
| `RF-PROJECTS-24` | A primeira renderização do cliente é igual ao HTML pré-renderizado de `/projects` (lista padrão, sem query); a query é aplicada logo depois de hidratar, sem erro de hidratação. Sem pré-renderização (plano B de S), a query é aplicada já na primeira renderização                                                                                                                                                                                                                                                                                     | NF-IA-03, NF-TE-04, `D45`             |
| `RF-PROJECTS-25` | Voltar do detalhe pelo navegador restaura busca, filtros e ordenação (pela query), a quantidade de cards mostrada (guardada no estado da entrada do histórico, não na URL) e a posição de rolagem (RF-LAY-32), com os dados do cache, sem estado de carregamento. Um link compartilhado restaura busca, filtros e ordenação e abre no primeiro lote. A troca de idioma mantém a query (RF-LAY-12) e volta ao primeiro lote                                                                                                                               | Issue #4, RF-LAY-12, RF-LAY-32, `D45` |

### Dados

| ID               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                       | Fonte                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `RF-PROJECTS-26` | A lista vem de um endpoint do RTK Query em `src/store/api/` (`queryFn` local, NF-DA-02) que devolve todos os projetos do idioma ativo num pedido só (NF-DA-05); a página não importa JSON. Busca, filtros, ordenação e lote são feitos no cliente por funções puras testáveis, fora do JSX (no hook da página ou em função pura). Na troca para a API (M), o contrato pode ganhar paginação no servidor sem mudar esta tela | R1, NF-DA-02, NF-DA-05, `.claude/CLAUDE.md` (lógica fora do JSX) |

### Metadados

| ID               | Regra                                                                                                                                                                                                                         | Fonte                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `RF-PROJECTS-27` | `<title>` "Projetos · Luiz Felipe dos Santos" e descrição "Projetos de Luiz Felipe dos Santos, com busca por tipo, categoria e tecnologia." (de `layout.md`), iguais com ou sem query; JSON-LD conforme "Metadados e JSON-LD" | `layout.md`, NF-IA-08, NF-IA-10 |

## Navegação

Caminhos de D32, sempre com o prefixo do idioma atual (NF-IN-11).

| De onde                       | Ação                                                       | Para onde                                                                    |
| ----------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Cabeçalho, menu               | "Projetos"                                                 | `/projects` sem query (RF-LAY-03)                                            |
| Início                        | "Ver projetos", "Ver todos →", "Ver todos os projetos"     | `/projects` sem query ([`home.md`](home.md))                                 |
| Página não encontrada         | "Ver projetos"                                             | `/projects` sem query (RF-LAY-28)                                            |
| Projeto                       | "← Voltar para Projetos"                                   | `/projects` (comportamento da #5; ver "Notas")                               |
| Projetos                      | Card (título ou área do card)                              | `/projects/<id>` do idioma atual, mesma aba                                  |
| Projetos                      | Busca, filtro, ordenação, "Limpar busca", "Limpar filtros" | Mesma tela, query atualizada por `replace`                                   |
| Projetos                      | "Carregar mais"                                            | Mesma tela e URL                                                             |
| Projetos                      | "Tentar novamente"                                         | Mesma tela, novo pedido, sem recarregar                                      |
| Projeto (voltar do navegador) | Voltar                                                     | `/projects` com a query, a quantidade e a rolagem de antes (RF-PROJECTS-25)  |
| Seletor de idioma             | `PT`, `EN`, `ES`                                           | `/projects` no outro idioma, com a mesma query, no primeiro lote (RF-LAY-12) |

### Notas

- **"← Voltar para Projetos" na tela do projeto:** recomendação para a #5, que decide. Se a entrada
  anterior do histórico for a lista, voltar pelo histórico (restaura tudo, RF-PROJECTS-25); senão,
  ir para `/projects` sem query.

## Textos fixos e chaves

Todo texto fixo vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e `es`
são escritos na implementação (E), com as mesmas chaves (R2). Os rótulos de tipo e "A–Z" podem ser
iguais nos três JSON; nomes de tecnologia não são chave (vêm do conteúdo e não se traduzem).

O namespace `projects` guarda o que só a tela usa. `common` guarda o que o card mostra, porque o
card é componente de `src/components/` reutilizado nos relacionados do Projeto (#5), e os rótulos
de tipo e categoria, que também aparecem no Início ([`home.md`](home.md)) e na ficha técnica do
Projeto (#5). Os rótulos de filtro no plural ("Acadêmicos") ficam em `projects`; os do card no
singular ("Acadêmico") em `common`.

| Namespace  | Chave                           | Valor em `pt-BR`                                                                                                 | Onde                                                              |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `projects` | `meta.title`                    | Projetos · Luiz Felipe dos Santos (de `layout.md`)                                                               | `<title>`, `og:title`, `name` do JSON-LD                          |
| `projects` | `meta.description`              | Projetos de Luiz Felipe dos Santos, com busca por tipo, categoria e tecnologia. (de `layout.md`)                 | Descrição, `og:description`, `description` do JSON-LD             |
| `projects` | `heading`                       | Projetos                                                                                                         | `h1`                                                              |
| `projects` | `intro`                         | Tudo o que construí e posso mostrar: trabalho profissional, projetos da faculdade e o que fiz por conta própria. | Introdução                                                        |
| `projects` | `search.label`                  | Buscar projeto                                                                                                   | Rótulo oculto do campo                                            |
| `projects` | `search.placeholder`            | Busque por nome ou tecnologia                                                                                    | Placeholder                                                       |
| `projects` | `search.clear`                  | Limpar busca                                                                                                     | Nome do botão ×                                                   |
| `projects` | `sort.label`                    | Ordenar                                                                                                          | Rótulo do `select`                                                |
| `projects` | `sort.recent`                   | Mais recente                                                                                                     | Opção                                                             |
| `projects` | `sort.oldest`                   | Mais antigo                                                                                                      | Opção                                                             |
| `projects` | `sort.title`                    | A–Z                                                                                                              | Opção                                                             |
| `projects` | `filters.type.label`            | Tipo                                                                                                             | Nome do grupo                                                     |
| `projects` | `filters.type.all`              | Todos                                                                                                            | Botão                                                             |
| `projects` | `filters.category.label`        | Categoria                                                                                                        | Nome do grupo                                                     |
| `projects` | `filters.category.academic`     | Acadêmicos                                                                                                       | Botão                                                             |
| `projects` | `filters.category.personal`     | Pessoais                                                                                                         | Botão                                                             |
| `projects` | `filters.category.professional` | Profissionais                                                                                                    | Botão                                                             |
| `projects` | `results.count_one`             | `{{shown}}` de `{{count}}` projeto                                                                               | Contagem (plural do i18next)                                      |
| `projects` | `results.count_other`           | `{{shown}}` de `{{count}}` projetos                                                                              | Contagem                                                          |
| `projects` | `results.loading`               | Carregando projetos…                                                                                             | Contagem carregando                                               |
| `projects` | `results.clearFilters`          | Limpar filtros                                                                                                   | Linha da contagem e estado sem resultado                          |
| `projects` | `noResults.heading`             | Nenhum projeto encontrado                                                                                        | `h2` e contagem                                                   |
| `projects` | `noResults.withSearch`          | Nenhum resultado para “`{{query}}`”. Tente outro termo ou remova os filtros.                                     | Texto com termo                                                   |
| `projects` | `noResults.withoutSearch`       | Nenhum projeto com essa combinação de filtros.                                                                   | Texto sem termo                                                   |
| `projects` | `empty.heading`                 | Nenhum projeto publicado                                                                                         | `h2` do vazio                                                     |
| `projects` | `empty.description`             | Os projetos aparecem aqui assim que eu publicar o primeiro.                                                      | Texto do vazio                                                    |
| `projects` | `error.heading`                 | Não consegui carregar a lista de projetos                                                                        | Título do alerta                                                  |
| `projects` | `error.description`             | Verifique sua conexão e tente de novo. Seus filtros foram mantidos.                                              | Texto do alerta                                                   |
| `projects` | `error.retry`                   | Tentar novamente                                                                                                 | Botão do alerta                                                   |
| `projects` | `loadMore`                      | Carregar mais                                                                                                    | Botão                                                             |
| `common`   | `projectType.web`               | Web (de `home.md`)                                                                                               | Filtro, linha do card, Início, ficha                              |
| `common`   | `projectType.mobile`            | Mobile (de `home.md`)                                                                                            | Idem                                                              |
| `common`   | `projectType.api`               | API (de `home.md`)                                                                                               | Idem                                                              |
| `common`   | `projectType.desktop`           | Desktop (de `home.md`)                                                                                           | Idem                                                              |
| `common`   | `projectType.cli`               | CLI (de `home.md`)                                                                                               | Idem                                                              |
| `common`   | `projectType.library`           | Biblioteca (de `home.md`)                                                                                        | Idem                                                              |
| `common`   | `projectType.extension`         | Extensão (de `home.md`)                                                                                          | Idem                                                              |
| `common`   | `projectType.bot`               | Bot / automação (de `home.md`)                                                                                   | Idem                                                              |
| `common`   | `projectType.data`              | Dados / IA (de `home.md`)                                                                                        | Idem                                                              |
| `common`   | `projectType.game`              | Jogo (de `home.md`)                                                                                              | Idem                                                              |
| `common`   | `projectType.iot`               | IoT / embarcado (de `home.md`)                                                                                   | Idem                                                              |
| `common`   | `projectType.infra`             | Infraestrutura (de `home.md`)                                                                                    | Idem                                                              |
| `common`   | `projectCategory.academic`      | Acadêmico (de `home.md`)                                                                                         | Linha do card, Início, ficha                                      |
| `common`   | `projectCategory.personal`      | Pessoal (de `home.md`)                                                                                           | Idem                                                              |
| `common`   | `projectCategory.professional`  | Profissional (de `home.md`)                                                                                      | Idem                                                              |
| `common`   | `projectCard.featured`          | Em destaque                                                                                                      | Texto oculto da estrela                                           |
| `common`   | `symbols.separator`             | · (de `layout.md`)                                                                                               | Separador da linha de tipos e categoria do card, em `aria-hidden` |

A linha de tipos e categoria do card é montada na tela com os rótulos de `common` e o
`symbols.separator` entre eles, sem chave de frase única, porque cada separador fica em
`aria-hidden` (RF-PROJECTS-14), como o rótulo de metadados do Início. O plural usa as regras do
i18next (`_one`, `_other`); em `pt-BR` o 0 cairia em `_one`, mas a contagem nunca mostra 0 (vira
"Nenhum projeto encontrado"). `common:projectType.<código>`, `common:projectCategory.*`,
`common:projectCard.featured` e `common:symbols.separator` são os nomes compartilhados decididos
pelo PO para as cinco telas (decisão transversal de 11-10-2026): os de tipo, categoria e separador
já estão em [`home.md`](home.md) e [`layout.md`](layout.md) e são reaproveitados com o mesmo nome;
`projectCard.featured` aparece pela primeira vez aqui. Não usar outro nome.

**Vem do conteúdo, não de chave** (campo da #10, valor da #13, por idioma quando é texto): título,
resumo, data (`date`), tipos, categoria, destaque, tecnologias (todas e as principais do card),
captura e as variantes dela.

## Conteúdo e contrato de dados

O que a tela pede à #10 (nomes sugeridos em inglês; a #10 decide os finais e atualiza
[`entity.md`](../diagrams/entity.md), que ainda tem `slug`, `ano` e tipo em português):

- **Endpoint de lista**, por idioma: devolve todos os projetos publicados, só com os campos do card
  (o detalhe, a galeria e os documentos ficam no endpoint do projeto, da #5), sem ordem garantida.
- **Item da lista:**

    | Campo              | Tipo                                                        | Uso                                                           |
    | ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
    | `id`               | UUID v7 (D32, NF-DA-07)                                     | Link do card, desempate final, `key`                          |
    | `title`            | Texto traduzido                                             | Card, busca, A–Z, JSON-LD                                     |
    | `summary`          | Texto traduzido, até ~160 caracteres                        | Card (duas linhas); também descrição do projeto (#5)          |
    | `date`             | `AAAA-MM` (mês e ano, decisão do PO)                        | Ano no card, ordenação                                        |
    | `types`            | Lista de 1 ou mais códigos do enum de tipo, sem repetição   | Filtro (casa se algum bate), linha do card, botões do filtro  |
    | `category`         | Enum `academic` \| `personal` \| `professional`             | Filtro, linha do card                                         |
    | `featured`         | Booleano                                                    | Estrela; também os destaques do Início ([`home.md`](home.md)) |
    | `technologies`     | Lista de nomes, não traduzidos                              | Busca (todas)                                                 |
    | `cardTechnologies` | 1 a 3 nomes, subconjunto de `technologies`                  | Chips do card, na ordem dada                                  |
    | `cover`            | Opcional: `src`, `width`, `height`, variantes para `srcset` | Imagem do card (D26); ausente → placeholder                   |

- **Enums** em código inglês minúsculo, nunca o rótulo: o rótulo vem de chave
  (`common:projectType.*`, `common:projectCategory.*`), e o mesmo código é o valor da query
  (`?type=<código>`). Tipo: `web`, `mobile`, `api`, `desktop`, `cli`, `library`, `extension`,
  `bot`, `data`, `game`, `iot`, `infra`, nessa ordem; não existe `fullstack` (web com backend é
  `["web", "api"]`). Categoria é um valor só por projeto; `types` é uma lista com pelo menos um
  código, sem repetição, na ordem do conteúdo. Valor novo de enum exige chave nova nos três idiomas
  e decisão do PO. A situação do projeto (`status`: `inDevelopment`, `completed`, `discontinued`,
  decisão transversal) não aparece no card nem filtra a lista, então não precisa estar no item da
  lista.
- **Data:** `date` em `AAAA-MM` (mês e ano, decisão do PO e transversal às telas); a lista ordena
  por `date` e o card mostra só o ano.
- A captura do card usa `alt=""`, então o item da lista não precisa de `alt`; o `alt` da captura na
  galeria é da #5.
- Erro de carga chega como falha de rede comum, sem mensagem do servidor na tela.

## Metadados e JSON-LD

- `<title>` e descrição de RF-PROJECTS-27, das chaves de `projects`, com as tags nativas do React 19. Canônica, `hreflang`, Open Graph (`og:type` `website`, `og:image` a do site) e
  `twitter:card` pelo mecanismo de V, como em [`layout.md`](layout.md) ("Metadados por rota e
  idioma"). A canônica nunca leva a query, e URL com query não ganha `noindex` (a canônica já
  aponta a lista padrão, NF-IA-11).
- JSON-LD (NF-IA-08, NF-IA-09), num `<script type="application/ld+json">` com `<` escapado, gerado
  do mesmo dado da tela, um por idioma: `CollectionPage` com `name` igual ao `<title>`,
  `description` igual à descrição, `url` igual à canônica, `inLanguage` do idioma e `mainEntity`
  um `ItemList` com todos os projetos (não só o primeiro lote, e sem aplicar a query), na ordem
  padrão "Mais recente", cada um `ListItem` com `position` (a partir de 1), `url` absoluta de
  `/projects/<id>` no mesmo idioma e `name` igual ao título. A página referencia o autor por
  `author` com o `@id` único da `Person` (`<URL canônica de />#person`, o mesmo em todas as telas,
  decisão transversal do PO de 11-10-2026), sem repetir a `Person` inteira.
- Na pré-renderização (S), `/projects`, `/en/projects` e `/es/projects` têm cada um seu HTML com o
  primeiro lote na ordem padrão e o JSON-LD completo.

```json
{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "<projects:meta.title>",
    "description": "<projects:meta.description>",
    "url": "<canônica de /projects no idioma>",
    "inLanguage": "<pt-BR, en ou es>",
    "author": { "@id": "<URL canônica de />#person" },
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "url": "<URL absoluta de /projects/<id> no idioma>",
                "name": "<título do projeto>"
            }
        ]
    }
}
```

## Critérios de aceite

Copiáveis para a issue E. Verificação entre colchetes, com a legenda de
[`accessibility.md`](../product/accessibility.md#checklist-por-tela) (`[teste]`, `[axe]`, `[lint]`,
`[teclado]`, `[leitor]`, `[navegador]`, `[e2e]` e `[medição]`) e mais `[review]` para o que só a
revisão do PR confere. Nos itens funcionais, `[teste]` usa Testing Library com `renderWithStore` e
`preloadedState`, `user-event`, `createMemoryRouter` com `initialEntries` de query e timers falsos
do Vitest para os 300 ms; `[e2e]` cobre o que o `jsdom` não mede (rolagem da linha de filtros,
colunas da grade, restauração de rolagem ao voltar, hidratação) e `[medição]` tamanho e cor.

### Funcionais

- [ ] `RF-PROJECTS-01` — `h1` "Projetos", introdução, busca e ordenação, filtros, contagem, resultado e "Carregar mais" nessa ordem, sem heading entre o `h1` e os títulos dos cards, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-02` — Campo `type="search"` com rótulo oculto, placeholder, `maxLength` 100 e 44px; lupa `aria-hidden` sem texto e "Limpar busca" com texto, que esvazia, aplica e devolve o foco, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-PROJECTS-03` — Busca por título e todas as tecnologias, sem resumo, sem caixa e acento, cada palavra como trecho em qualquer campo; os exemplos do documento num teste da função pura com o fixture [teste]
- [ ] `RF-PROJECTS-04` — Termo aplicado 300 ms depois da última tecla; "Limpar busca" e "Limpar filtros" na hora; Enter não recarrega [teste]
- [ ] `RF-PROJECTS-05` — Grupo "Tipo" com "Todos" e só os tipos presentes no conteúdo, na ordem do enum, escolha única com `aria-pressed`; projeto com vários tipos aparece em cada um, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-06` — Grupo "Categoria" com três botões, escolha única opcional com `aria-pressed`; clicar na ativa desmarca, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-07` — Busca, tipo e categoria combinados por E; os exemplos do documento num teste da função pura [teste]
- [ ] `RF-PROJECTS-08` — Botões de 44px com os tokens de ativo e inativo, separador `aria-hidden`; abaixo de 640px linha única rolável, sem barra, alcançável por Tab, sem foco cortado [e2e] [medição] [teclado]
- [ ] `RF-PROJECTS-09` — `select` nativo "Ordenar" com "Mais recente", "Mais antigo" e "A–Z", desempate por título, data e id, sem ligar "Limpar filtros", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-10` — Contagem em `role="status"` desde a primeira renderização, com singular, plural, sem resultado, carregando e vazia no erro, atualizada uma vez por mudança, nos três idiomas, sem chave no lugar de texto [teste] [leitor]
- [ ] `RF-PROJECTS-11` — "Limpar filtros" só com busca, tipo ou categoria; zera os três, mantém a ordenação, volta ao primeiro lote e foca a busca [teste]
- [ ] `RF-PROJECTS-12` — Lote de 9 e "Carregar mais" até mostrar todos, sem paginação nem rolagem infinita; os exemplos de 10 e 20 projetos [teste]
- [ ] `RF-PROJECTS-13` — "Carregar mais" revela na hora, foca o link do primeiro card novo e anuncia a contagem; mudar busca, filtro ou ordenação volta ao primeiro lote [teste]
- [ ] `RF-PROJECTS-14` — Card em `li` de `ul` com imagem 16:9, título, ano em `time`, linha com todos os tipos e a categoria com separadores `aria-hidden`, resumo de duas linhas e até três chips, nos três idiomas, sem chave no lugar de texto [teste] [e2e]
- [ ] `RF-PROJECTS-15` — Título em `h2` com o único link, nome igual ao título, para `/projects/<id>` do idioma; card clicável inteiro por CSS; hover sem movimento com movimento reduzido [teste] [e2e] [navegador]
- [ ] `RF-PROJECTS-16` — Estrela `aria-hidden` e "Em destaque" oculto dentro do `h2`, fora do link, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-17` — 1 coluna em 360 e 390px, 2 em 768px, 3 em 1280px [e2e]
- [ ] `RF-PROJECTS-18` — Imagens com 16:9 reservado e `srcset`/`sizes`; as três primeiras sem `lazy` e a do LCP com `fetchpriority="high"`, as demais com `loading="lazy"` e `decoding="async"` [teste] [review]
- [ ] `RF-PROJECTS-19` — Carregando com nove skeletons `aria-hidden`, controles usáveis e aplicados quando a lista chega [teste]
- [ ] `RF-PROJECTS-20` — Sem resultado com o texto com ou sem termo, termo como texto e "Limpar filtros", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-21` — Vazio sem controles nem contagem, com "Nenhum projeto publicado", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-22` — Erro em `role="alert"` que mantém busca, filtros e ordenação; "Tentar novamente" refaz o pedido sem recarregar e foca o `h1`; sem mensagem técnica, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-PROJECTS-23` — Query `q`, `type`, `category`, `sort` nessa ordem, sem valor padrão, por `replace`; URL com query abre a lista filtrada; valor inválido ignorado [teste]
- [ ] `RF-PROJECTS-24` — Primeira renderização igual ao HTML de `/projects` e query aplicada depois de hidratar, sem erro de hidratação [teste] [e2e]
- [ ] `RF-PROJECTS-25` — Voltar do detalhe restaura query, quantidade e rolagem sem carregando; link compartilhado abre no primeiro lote; troca de idioma mantém a query [teste] [e2e]
- [ ] `RF-PROJECTS-26` — Lista por endpoint do RTK Query no idioma ativo, num pedido só; busca, filtros, ordenação e lote em funções puras com teste [teste] [review]
- [ ] `RF-PROJECTS-27` — `<title>` e descrição de `layout.md`, iguais com ou sem query, nos três idiomas, sem chave no lugar de texto [teste]

### Acessibilidade

Copiados de [`accessibility.md`](../product/accessibility.md#checklist-por-tela), sem renumerar.

- [ ] `A11Y-G01` — Um `main`, um `h1` e um `<title>` próprio e traduzido [teste]
- [ ] `A11Y-G02` — `<html lang>` igual ao idioma da URL (`/`, `/en/`, `/es/`) [teste]
- [ ] `A11Y-G03` — Nenhuma violação do axe em cada estado da tela [axe]
- [ ] `A11Y-G04` — Nenhuma violação do axe no navegador, nos dois temas [e2e]
- [ ] `A11Y-G05` — Ordem de foco igual à visual e foco visível em todo elemento focável [teclado]
- [ ] `A11Y-G06` — Contorno de foco de D27 com 2px, afastado, 3:1 em toda superfície e nunca cortado (2.4.13) [e2e] [medição]
- [ ] `A11Y-G07` — Todo link tem um nome que diz o destino sozinho (2.4.9) [teste]
- [ ] `A11Y-G08` — Controles e links isolados com alvo de 44px em todas as larguras (2.5.5) [e2e] [medição]
- [ ] `A11Y-G09` — Texto corrido com até 80 caracteres por linha, entrelinha de pelo menos 1,5 e sem justificar (1.4.8) [navegador]
- [ ] `A11Y-G10` — Contraste AA nos dois temas e em todos os estados [e2e] [medição]
- [ ] `A11Y-G11` — Sem rolagem horizontal a 320px e sem perda com texto a 200% [medição]
- [ ] `A11Y-G12` — Movimento reduzido respeitado, inclusive a animação disparada por interação (2.3.3) [navegador]
- [ ] `A11Y-G13` — Skeleton com `aria-hidden` e status "Carregando" visualmente oculto [teste]
- [ ] `A11Y-G14` — Erro de carregamento em `role="alert"`, com a saída [teste]
- [ ] `A11Y-G15` — Texto em `pt-BR`, `en` e `es`, inclusive os nomes acessíveis [teste]
- [ ] `A11Y-G16` — Nenhum erro de `jsx-a11y` [lint]

- [ ] `A11Y-PS01` — Busca com rótulo [teste]
- [ ] `A11Y-PS02` — Filtros em grupo nomeado, com `aria-pressed` [teste]
- [ ] `A11Y-PS03` — Ordenação em `select` nativo com rótulo [teste]
- [ ] `A11Y-PS04` — Contagem de resultados e lista vazia anunciadas em `aria-live` [teste] [leitor]
- [ ] `A11Y-PS05` — "Carregar mais" leva o foco ao primeiro card novo [teste]
- [ ] `A11Y-PS06` — Título do card é heading, e o link do card tem o nome do projeto (2.4.9) [teste]
- [ ] `A11Y-PS07` — Linha de filtros alcançável por Tab no mobile [teclado]

Em Projetos, o status "Carregando" de `A11Y-G13` é a própria contagem visível em `role="status"`
(RF-PROJECTS-10): o teste confere o texto na região e o skeleton em `aria-hidden`, não a ocultação
visual.

### Não funcionais

De [`non-functional-requirements.md`](../product/non-functional-requirements.md), com o momento de
verificação de lá.

- [ ] `NF-IN-03` — Nenhuma tela mostra chave no lugar de texto [CI; K]
- [ ] `NF-IN-11` — Todo link interno mantém o prefixo do idioma, montado por função única [CI; W]
- [ ] `NF-IN-13` — Caminhos em inglês: `/projects` e `/projects/:id` [CI; W; F]
- [ ] `NF-DA-02` — A tela não importa JSON de conteúdo: o acesso é por endpoint do RTK Query [Review; CI]
- [ ] `NF-DA-05` — A tela carrega só o conteúdo do idioma ativo [#10; K]
- [ ] `NF-DE-03` — INP até 200 ms na busca e no filtro [DevTools, painel Performance com CPU 4x]
- [ ] `NF-DE-08` — JS adicional de `/projects` até 40 KB gzip [DevTools Network, navegando pelo cabeçalho]
- [ ] `NF-DE-14` — Imagem 16:9 de card com no máximo 80 KB, servida por `srcset`/`sizes` [DevTools em 390px]
- [ ] `NF-DE-16` — Imagens e placeholders com `width` e `height` (ou `aspect-ratio`) reservados [Review; K]
- [ ] `NF-DE-17` — Imagens abaixo da dobra com `loading="lazy"` e `decoding="async"`; nenhuma imagem do LCP `lazy` [Review; K]
- [ ] `NF-RE-03` — Sem rolagem horizontal em 360, 390, 768 e 1280px, nos dois temas e nos estados sem resultado, vazio, carregando e erro [K]
- [ ] `NF-RE-04` — Linha de filtros rolável no mobile (D16) e grade de colunas de 18rem (D17) [C, D a H; K]
- [ ] `NF-MO-01` — `prefers-reduced-motion: reduce` desliga shimmer e `translateY` de hover [K]
- [ ] `NF-TE-04` — A query e as quebras não mudam a primeira renderização em relação ao HTML [S; K]
- [ ] `NF-IA-01` — `/projects`, `/en/projects` e `/es/projects` com HTML gerado no build, legível sem JavaScript [CI; S; K]
- [ ] `NF-IA-02` — Projetos depois de "Carregar mais" em `llms-full*.txt` e todo projeto no `sitemap.xml` [CI; S; U]
- [ ] `NF-IA-03` — Primeira renderização do cliente igual ao HTML, com os dados serializados na store [CI; S; K]
- [ ] `NF-IA-08` — JSON-LD `CollectionPage` com `ItemList` dos projetos [CI; V; D a H; K]
- [ ] `NF-IA-09` — JSON-LD gerado dos mesmos dados da tela, com `<` escapado [CI; V]
- [ ] `NF-IA-11` — Canônica absoluta por idioma, sem query string, e `hreflang` recíproco [CI; V; K]
- [ ] `NF-IA-16` — HTML semântico, com o conteúdo principal dentro do `main` e as tecnologias em texto [CI; C, D a H]
- [ ] `NF-CO-03` — Sem JavaScript, a lista inicial é legível; busca, filtros, ordenação e "Carregar mais" precisam de JavaScript [K]

### Gerais

- [ ] A rota abre e recarrega em `/projects`, `/en/projects` e `/es/projects` no build com o `base` do Pages
- [ ] `npm run build`, `npm run lint` e `npm test -- --run` passam
- [ ] Textos novos de `projects` e `common` em `pt-BR`, `en` e `es`, e chaves sem uso removidas (R2)
- [ ] `/projects` entra na suíte da Y
