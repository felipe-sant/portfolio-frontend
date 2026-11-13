# portfolio-frontend

## 1.4.0

### Minor Changes

- [#242](https://github.com/felipe-sant/portfolio-frontend/pull/242) [`38b049c`](https://github.com/felipe-sant/portfolio-frontend/commit/38b049c7f2fb0b0c5f8c704778df4602eef07fe2) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Publica os arquivos para IA (llms.txt) também em inglês e espanhol, troca o e-mail desses arquivos por um link para a página de Contato e declara no robots.txt a política de uso por IA com Content-Signal.

- [#259](https://github.com/felipe-sant/portfolio-frontend/pull/259) [`a0fcd41`](https://github.com/felipe-sant/portfolio-frontend/commit/a0fcd413937d1c779aaf27d83dfabcd98b21f1c2) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Mostra a data da última atualização na página Informações, preenche a data de atualização de todas as páginas no sitemap, tira as páginas de licença do sitemap com marcação para não indexar e dá a cada página de documentação uma descrição própria.

- [#251](https://github.com/felipe-sant/portfolio-frontend/pull/251) [`2d7281d`](https://github.com/felipe-sant/portfolio-frontend/commit/2d7281d99017ed7c9d7226da09d79e2b8688eace) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Acrescenta o caminho de navegação (Início, Projetos, projeto e documento) aos dados estruturados das páginas de Projetos, Projeto e documento, e passa a provar com teste cada campo dos dados estruturados do projeto nos três idiomas e nos seis projetos reais.

### Patch Changes

- [#262](https://github.com/felipe-sant/portfolio-frontend/pull/262) [`d999338`](https://github.com/felipe-sant/portfolio-frontend/commit/d99933821e7e82df14223999b560953bd6b091d0) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Extrai AsyncSection e Section e divide a página Informações em partes, sem mudança visual.

- [#271](https://github.com/felipe-sant/portfolio-frontend/pull/271) [`ececcf4`](https://github.com/felipe-sant/portfolio-frontend/commit/ececcf41ede5fce47507b5ea511443089d18d52c) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Evita o salto de layout da tela Contato no celular ao carregar as fontes, com uma fonte reserva de métricas ajustadas para a IBM Plex Sans.

- [#243](https://github.com/felipe-sant/portfolio-frontend/pull/243) [`1e98766`](https://github.com/felipe-sant/portfolio-frontend/commit/1e9876687d56220a989cf09244ca802e37d89c85) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Inclui o cargo e a stack no título da página inicial nos três idiomas e completa as tags de compartilhamento do Twitter (título, descrição, imagem e texto alternativo da imagem) com os mesmos valores do Open Graph.

- [#270](https://github.com/felipe-sant/portfolio-frontend/pull/270) [`b2ea025`](https://github.com/felipe-sant/portfolio-frontend/commit/b2ea02592a777417f4fd6fbcab305d765523733d) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Impede que o cabeçalho (a 768 px) e o título da Início (a 360 px) passem da largura da tela quando o leitor aumenta o espaçamento do texto, nos três idiomas.

- [#245](https://github.com/felipe-sant/portfolio-frontend/pull/245) [`164c1d0`](https://github.com/felipe-sant/portfolio-frontend/commit/164c1d0fa53941b62e1ab656bf3e59ad070683bb) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Aumenta para 44 px o alvo do link de título dos projetos em destaque da página inicial no celular, acerta a proporção 16:9 das capas e adiciona o esmaecimento na borda da linha de filtros de Projetos no celular.

- [#244](https://github.com/felipe-sant/portfolio-frontend/pull/244) [`f81fea3`](https://github.com/felipe-sant/portfolio-frontend/commit/f81fea3d5ef7f7ef8f385b53bdfb83d5fb67e985) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Divide o JavaScript por página e carrega os textos de cada idioma sob demanda, reduzindo o pacote de entrada e o tempo de bloqueio na abertura das páginas.

- [#272](https://github.com/felipe-sant/portfolio-frontend/pull/272) [`456c4db`](https://github.com/felipe-sant/portfolio-frontend/commit/456c4db62fa15332ff6ac406f606b132297156cf) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Reduz as fontes da primeira carga para menos de 160 KB, sem tirar peso nem família e sem mudar a aparência.

- [#257](https://github.com/felipe-sant/portfolio-frontend/pull/257) [`13e116d`](https://github.com/felipe-sant/portfolio-frontend/commit/13e116da620dd1bd139fb08b8f557814b3ae5116) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Dá conteúdo à página inicial sem idioma: ela passa a trazer, sem JavaScript, links para os três idiomas, endereço canônico e versões por idioma, e o redirecionamento com JavaScript continua igual.

- [#252](https://github.com/felipe-sant/portfolio-frontend/pull/252) [`968b648`](https://github.com/felipe-sant/portfolio-frontend/commit/968b648e84dc375f76337d97faae38c3050cacda) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Gera uma imagem de compartilhamento própria para Início, Projetos, Informações e Contato em cada idioma, com texto alternativo traduzido, e usa a imagem de Projetos como reserva na tela de um projeto sem captura.

- [#269](https://github.com/felipe-sant/portfolio-frontend/pull/269) [`1a61132`](https://github.com/felipe-sant/portfolio-frontend/commit/1a61132d470ce0d7ea71bd74a236f9849ec7ac86) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Reorganiza o código das páginas Informações e Projetos em partes menores, sem mudar o que aparece na tela nem o comportamento de foco e navegação por teclado.

- [#260](https://github.com/felipe-sant/portfolio-frontend/pull/260) [`56dc92c`](https://github.com/felipe-sant/portfolio-frontend/commit/56dc92c8379055ff778bafaa4948015a1dd14574) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Valida o formato dos arquivos de conteúdo antes de usá-los: um arquivo fora do formato esperado passa a gerar erro claro em vez de dados quebrados na tela.

- [#255](https://github.com/felipe-sant/portfolio-frontend/pull/255) [`10b4376`](https://github.com/felipe-sant/portfolio-frontend/commit/10b4376c6f5eef2ec71e09207fd49a4137f90891) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Centraliza a leitura do idioma ativo em um hook `useLanguage`, que substitui a expressão repetida em páginas, hooks e componentes, sem mudar o comportamento.

- [#263](https://github.com/felipe-sant/portfolio-frontend/pull/263) [`cfd6d4e`](https://github.com/felipe-sant/portfolio-frontend/commit/cfd6d4ead3dd1faf761fc7096673e745cbd3c42f) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Extrai o try/catch repetido dos endpoints de conteúdo em um helper runQueryFn, sem mudar o comportamento.

## 1.3.1

### Patch Changes

- [#240](https://github.com/felipe-sant/portfolio-frontend/pull/240) [`3cbb9d5`](https://github.com/felipe-sant/portfolio-frontend/commit/3cbb9d5c5584eb111df3e961cb088f033a409582) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Guarda em cache por mais tempo os scripts, estilos, fontes e imagens na Vercel, acrescenta headers de segurança e uma política de conteúdo em modo de relatório, e passa os dados das páginas pré-renderizadas para um bloco JSON que a política não precisa liberar.

- [#236](https://github.com/felipe-sant/portfolio-frontend/pull/236) [`cfc37dc`](https://github.com/felipe-sant/portfolio-frontend/commit/cfc37dc7a97027689a943b700b8cf1f7f2ca34f5) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Unifica o id da pessoa nos dados estruturados de todas as páginas e idiomas, tira o prefixo mailto: do e-mail de Contato, evita repetir linguagens entre as palavras-chave e as linguagens de programação das páginas de projeto e confere que o cargo é o mesmo em Início e Informações.

## 1.3.0

### Minor Changes

- [#231](https://github.com/felipe-sant/portfolio-frontend/pull/231) [`2fc7290`](https://github.com/felipe-sant/portfolio-frontend/commit/2fc7290aeafe8c6c510987444052ecbc584a5a54) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Separa os projetos pequenos numa seção "Experimentos" em Projetos, depois dos principais, com o campo `experiment` no conteúdo. O resumo do card aparece inteiro, sem corte em duas linhas, e as capturas de Maps, MNIST Classifier, Pedido de Namoro Irrecusável, Conversor de Unidades e Controle de Despesas são recortadas na parte útil pelo script `content:crop-captures`.

### Patch Changes

- [#232](https://github.com/felipe-sant/portfolio-frontend/pull/232) [`f0bb67d`](https://github.com/felipe-sant/portfolio-frontend/commit/f0bb67deb98aad11872d21a9109c58819933fdd6) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Declara na Início o cargo de desenvolvedor full stack Júnior com React, TypeScript e Node.js, troca estagiário por Júnior no site e no currículo e deixa o cartão da Fatec mais baixo no celular, para os projetos em destaque aparecerem mais cedo.

- [#229](https://github.com/felipe-sant/portfolio-frontend/pull/229) [`f43fb6e`](https://github.com/felipe-sant/portfolio-frontend/commit/f43fb6e174379dbd17f7db2dff15101cd0d72e21) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Informações mostra a Trajetória antes da Stack e reduz "Sobre mim" a dois parágrafos nos três idiomas.

- [#228](https://github.com/felipe-sant/portfolio-frontend/pull/228) [`d5f5976`](https://github.com/felipe-sant/portfolio-frontend/commit/d5f59760d8663d4298e56f50616d383ee2798ed2) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Recomprime as capturas do Maps (a grande cai de 164 KB para 96 KB) e reserva a altura do bloco de canais de Contato enquanto o perfil carrega, para a tela não saltar quando o conteúdo chega.

## 1.2.2

### Patch Changes

- [#213](https://github.com/felipe-sant/portfolio-frontend/pull/213) [`2155d85`](https://github.com/felipe-sant/portfolio-frontend/commit/2155d85952afd0ad42fbb852c5248d4f4af1dbf6) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Troca a foto de perfil pela foto real, gerada pelo script `profile:photo`, e passa a reprovar EXIF e XMP nas imagens publicadas. O conteúdo exige ao menos uma captura por projeto e a foto do perfil nos três idiomas.

## 1.2.1

### Patch Changes

- [#186](https://github.com/felipe-sant/portfolio-frontend/pull/186) [`11cf220`](https://github.com/felipe-sant/portfolio-frontend/commit/11cf220a72809a9e69c5270c9f66a24c40614731) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Corrige a rolagem horizontal do cabeçalho entre 640px e 720px: o botão de menu passa a valer até 719px.

- [#185](https://github.com/felipe-sant/portfolio-frontend/pull/185) [`9b4c76c`](https://github.com/felipe-sant/portfolio-frontend/commit/9b4c76cff90774f208ffe30130dfce3373fae175) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Corrige a busca de Projetos que perdia o termo ou um filtro quando o visitante clicava em filtros logo depois da pausa da digitação.

- [#180](https://github.com/felipe-sant/portfolio-frontend/pull/180) [`c6117f9`](https://github.com/felipe-sant/portfolio-frontend/commit/c6117f982096a0447215763f6dd4afa1e9e3fc25) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Corrige a troca de idioma por clique no seletor, que rolava a página no desktop em vez de preservar a posição.

- [#184](https://github.com/felipe-sant/portfolio-frontend/pull/184) [`f28578c`](https://github.com/felipe-sant/portfolio-frontend/commit/f28578c2d796aabca7d14d1a9c12f4461138f117) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Reserva a calha da barra de rolagem para o cabeçalho não deslocar na troca de página

- [#181](https://github.com/felipe-sant/portfolio-frontend/pull/181) [`3e04c3c`](https://github.com/felipe-sant/portfolio-frontend/commit/3e04c3cd3a5b56c75a2e594d5d4871f98c4b2e8d) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Amplia o link de título dos cartões de Projetos para 44px de altura sem mudar o visual do cartão.

- [#188](https://github.com/felipe-sant/portfolio-frontend/pull/188) [`b6ec437`](https://github.com/felipe-sant/portfolio-frontend/commit/b6ec43752979d7d78c919ae5e77ee12109fa834e) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Faixa de tecnologias da Início: pausa com o mouse sobre ela, o foco do teclado dentro dela ou um toque (o toque seguinte retoma), anda em laço também no celular e só rola na horizontal com "Reduzir movimento" ligado, em qualquer dispositivo (WCAG 2.2.2, D68 substitui a D28)

- [#187](https://github.com/felipe-sant/portfolio-frontend/pull/187) [`fee1c9b`](https://github.com/felipe-sant/portfolio-frontend/commit/fee1c9b848d5ff7db101e73c3e8a969fe6f24e63) Thanks [@felipe-sant](https://github.com/felipe-sant)! - Sobe o tamanho do texto das etiquetas para 12 px, de períodos, anos e cargos para 14 px, e usa a fonte do corpo nos itens de "Como eu trabalho".

## 1.2.0

### Minor Changes

- c399b00: O build passa a gerar na raiz do site o `robots.txt`, o `sitemap.xml`, o `llms.txt` e os `llms-full.txt` em português, inglês e espanhol, com o texto completo do portfólio e do currículo para buscadores e IAs.

### Patch Changes

- ff87ae6: Atualiza o perfil e a trajetória com testes automatizados, fluxo com agentes de IA, CI e novas disciplinas da Fatec, nos três idiomas. O corpo dos modais passa a receber foco pelo teclado, para que conteúdo longo possa ser rolado sem mouse.
- ff2cfd0: Poda os pesos de fonte: a faixa da Bricolage Grotesque passa a 600–800, o item ativo do menu mobile e a aba ativa de documentos usam pesos que têm arquivo, e um teste automatizado impede que fontes, `@font-face`, `preload` e tokens de peso voltem a divergir.

## 1.1.0

### Minor Changes

- 0dc73c4: Currículo em PDF por idioma com pré-visualização em modal nos quatro pontos de CV (Início, Informações, Contato e rodapé de Contato) e script manual `npm run cv:pdf` para gerar os PDFs a partir do Markdown.

### Patch Changes

- 8f79ed2: O modal do currículo mostra o PDF em celular e em navegadores sem visualizador de PDF, desenhando as páginas em canvas com o `pdfjs-dist` carregado só ao abrir o modal.

## 1.0.1

### Patch Changes

- 10374d9: Primeira versão publicada pelo fluxo automático de release.
