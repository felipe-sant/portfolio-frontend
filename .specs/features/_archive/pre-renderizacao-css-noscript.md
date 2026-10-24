# pre-renderizacao-css-noscript

> Status: `resolvida`
> Encerrada em: `2026-10-24`
> Commits: `origin/staging..fix/prerender-css-por-rota-e-noscript` · PR: `—` · Issue: `—`

## O que foi pedido

Duas correções da pré-renderização (#49): a página não encontrada saía sem o CSS da tela quando o JavaScript estava desligado, e o aviso do `<noscript>` precisava virar uma faixa com o amarelo do tema.

## O que foi feito

Causa confirmada: as telas são `lazy` e o CSS do chunk só era injetado pelo JS, então `dist/404.html` e `dist/pt-BR.html` linkavam apenas o CSS do bundle principal. O prerender agora lê `dist/assets/*.css`, escolhe por rota os arquivos cujas classes de CSS Module aparecem no HTML renderizado (sem repetir o que o `index.html` já linka) e `composePage` os acrescenta ao `<head>` com o `base`. Sem lista por tela. O manifest do Vite não foi usado: a seleção por classe dispensa o mapa rota para chunk. O Vite não duplica o link na hidratação porque reconhece o stylesheet já presente.

O aviso do `<noscript>` é estilizado por `body > noscript` em `global.css` com `--danger-surface` e `--danger-ink` (vermelho de aviso, faixa baixa), dentro de `@media (scripting: none)` para não aparecer faixa vazia com JavaScript.

O skip link espiava na tela sem JavaScript: o `.skipLink` era `absolute` e seu bloco de posicionamento é o layout, que começa abaixo da faixa do `<noscript>`, então o `top` e o `-200%` partiam de cerca de 50px mais baixo (medido: `bottom` em +4,7px). Passou a `position: fixed`, ancorado à viewport (`bottom` em -42px em todos os casos, e `top: 8px` ao receber foco por Tab como primeiro foco).

## Notas

Sem `modulepreload` do JS da tela. Navegador sem suporte a `scripting: none` não mostra a faixa estilizada (o texto continua visível).
