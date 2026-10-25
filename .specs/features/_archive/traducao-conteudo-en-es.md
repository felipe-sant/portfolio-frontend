# traducao-conteudo-en-es

> Status: `implementada`
> Encerrada em: `2026-10-24`
> Commits: `origin/staging..feat/59-traducao-conteudo-en-es` · PR: `—` · Issue: `#59`

## O que foi pedido

Traduzir para `en` e `es` todo o conteúdo real entregue em `pt-BR` pela #58 (perfil, trajetória, projetos, documentos e CV) e impedir que a tradução volte a ficar pela metade sem ninguém notar.

## O que foi feito

Os três JSON de `en` e `es` foram traduzidos campo a campo sobre a cópia do `pt-BR`, preservando campos neutros; os 12 documentos `.md` por idioma e o CV (`public/cv/cv-en.md`, `cv-es.md`) foram traduzidos mantendo estrutura, blocos de código e links. Os títulos dos projetos 4 e 5 perderam o subtítulo em português nos três idiomas, e o do projeto Pedido de Namoro Irrecusável foi traduzido. `validateTranslation` (ligada em `validateContent`) reprova campo traduzível ou documento igual ao `pt-BR`, com exceções por caminho em `translationExceptions.ts`; a fixture de `buildContentSnapshot` passou a ter o `SETUP.md` diferente por idioma.

## Notas

A lista de exceções inclui, além de nomes próprios, termos idênticos em espanhol por natureza (`Híbrido`, `Ética`, `Informática`, `Full stack`, `Frontend`, `200 horas`, durações como `2 semanas`). A revisão da tradução pelo PO continua pendente, em especial cargo "Jovem Aprendiz", nome do curso e "Control de Gastos".
