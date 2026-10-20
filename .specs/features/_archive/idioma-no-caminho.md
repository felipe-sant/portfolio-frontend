# idioma-no-caminho

> Status: `implementada`
> Encerrada em: `2026-10-13`
> Commits: `1f3525c..75826bb` · PR: [#75](https://github.com/felipe-sant/portfolio-frontend/pull/75) · Issue: [#53](https://github.com/felipe-sant/portfolio-frontend/issues/53)

## O que foi pedido

O idioma era decidido por `?lng=`, escolha salva, idioma do navegador e `en`, com `i18next-browser-languagedetector`. A mesma URL abria em idiomas diferentes conforme quem pedia, o que impedia URL própria, HTML pré-renderizado e `hreflang` por idioma.

## O que foi feito

O idioma passou a ser o primeiro segmento do caminho: `/pt-BR`, `/en` e `/es`, com os mesmos caminhos em inglês nos três. Todo idioma tem prefixo, nenhum caminho termina em barra, `?lng=` não tem efeito, e prefixo desconhecido ou ausente cai em não encontrada. A raiz `/` só redireciona (idioma salvo, depois navegador, depois `en`). Um `loader` por rota-pai troca o idioma antes do render; `buildPath` e `useLocalizedPath` montam os links; `setLanguage` é a única via que salva a escolha. Decisões de D31, D32 e NF-IN-05 a NF-IN-13 foram atualizadas.

## Notas

Descartados: `:lang?` opcional, detector customizado do i18next, `useParams` com `changeLanguage` em efeito (o primeiro render sairia no idioma errado) e `/pt` redirecionando para `/pt-BR`. Fora do escopo: seletor de idioma (#33), pré-renderização e `hreflang` (#49).
