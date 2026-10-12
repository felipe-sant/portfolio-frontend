# Modelo de conteúdo

Este modelo é o ponto de partida para escrever o conteúdo real do portfólio (perfil, trajetória e
projetos). Os três arquivos de `pt-BR/` têm todos os campos do contrato, inclusive os opcionais, com
valores vazios. Eles são gerados a partir dos tipos do código: se o contrato mudar, o `typecheck`
falha até as funções do modelo serem atualizadas.

Esta pasta não é publicada: o que vai ao ar fica em `public/`.

## Como usar

1. Copie `pt-BR/profile.json`, `pt-BR/timeline.json` e `pt-BR/projects.json` para
   `public/content/pt-BR/` e preencha. O conteúdo de exemplo que já está lá é substituído por esses
   arquivos.
2. Gere um id para cada projeto, item de trajetória, certificado e documento com
   `npm run content:id`. Para vários de uma vez, use `npm run content:id -- 5`. O id é gerado uma
   vez e nunca muda, mesmo que o título mude.
3. Apague os campos opcionais que você não vai usar. Campo opcional sem valor não aparece no
   arquivo: texto vazio e `null` são inválidos. Os opcionais são `photo`, `location.detail`,
   `contact.responseTime`, `links.github`, `links.linkedin` (perfil), `organization`, `stage`,
   `end`, `issuer` (trajetória), `demoUrl`, `repositoryUrl`, `updatedAt`, `caption` e
   `contentLanguage` (projeto).
4. O modelo traz um item em cada lista só para mostrar a forma. Apague, repita ou deixe `[]` onde o
   contrato permite lista vazia.
5. Rode `npm run content:check`. Ele aponta o arquivo, o campo e a regra de cada problema.

## Valores aceitos

- Tipos de projeto (`types`, pelo menos um, sem repetir): `web`, `mobile`, `api`, `desktop`, `cli`,
  `library`, `extension`, `bot`, `data`, `game`, `iot`, `infra`.
- Categoria (`category`): `academic`, `personal`, `professional`.
- Situação (`status`): `inDevelopment`, `completed`, `discontinued`.
- Categoria da stack (`stack[].category`, na ordem, sem repetir): `frontend`, `backend`, `tooling`.
- Tipo de item da trajetória (`kind`): `experience`, `education`, `course`.
- Formato de documento (`format`): `markdown`, `text`.
- Datas: `date`, `start` e `end` em `AAAA-MM`; `updatedAt` em `AAAA-MM-DD`.

## Imagens

- Projeto: de zero a cinco imagens, todas 16:9, em `public/images/projects/<id>/<n>-large.webp`
  (1600 por 900, até 200 KB) e `<n>-small.webp` (640 por 360, até 80 KB). A primeira é a capa.
- Foto do perfil: 1:1, em `public/images/profile/photo-large.webp` (800 por 800) e
  `photo-small.webp` (320 por 320).
- `src` no JSON é relativo, sem barra inicial (`images/projects/<id>/1-large.webp`), e `width` e
  `height` precisam ser os do arquivo.

## Documentos do projeto

- Documento traduzido: um arquivo por idioma, em
  `public/content/pt-BR/projects/<id>/docs/<nome>`.
- Documento neutro (`translated: false`, como `LICENSE`): um arquivo só, em
  `public/content/shared/projects/<id>/docs/<nome>`.
- `README.md` é obrigatório, em `markdown` e traduzido, com as seções Contexto, Meu papel, Solução,
  Decisões técnicas, Resultado e, se quiser, Aprendizados, nessa ordem, em `##`.
- Markdown só aceita GFM sem HTML, sem imagem, sem nota de rodapé e sem título `#`; todo bloco de
  código tem linguagem; toda tabela tem linha de cabeçalho; links só `https:`, `http:`, `mailto:`,
  `project:<id>` (com `/docs/<nome>` opcional) e `#âncora`.
- `CHANGELOG.md`, quando existir, tem um `##` por versão no formato `vX.Y.Z · MM/AAAA`, da mais
  recente para a mais antiga.

## Inglês e espanhol

Escreva só em `pt-BR`. As versões `en` e `es` entram depois, copiando os arquivos de `pt-BR/` e
traduzindo os campos de cada idioma. Os campos neutros (ids, datas, enums, URLs, tecnologias,
imagens, lista de documentos) precisam ficar idênticos nos três idiomas, e o teste barra qualquer
diferença.

## Regras e regeneração

As regras completas estão em `docs/architecture/data-model.md`, na seção "Validação do conteúdo".
Quem mudar o contrato regera os arquivos deste modelo com `npm run content:template`.
