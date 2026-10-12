## Contexto

Projeto de hobby, feito só por diversão num único dia: um site de "pedido de namoro impossível de recusar", onde o botão de recusa foge do cursor sempre que o usuário tenta se aproximar dele.

## Mi rol

Desenvolvi sozinho, do zero ao deploy.

## Solución

Ao passar o mouse perto do botão "Não", a posição dele é recalculada aleatoriamente dentro da tela, tornando praticamente impossível clicar nele. O botão "Sim" aceita o convite e redireciona para uma música.

## Decisiones técnicas

A lógica de "fuga" é simples e direta: no evento de mouseover (e no clique, como segurança extra), o botão recebe uma nova posição absoluta gerada aleatoriamente dentro de uma faixa segura da tela, via uma função utilitária de geração de posição.

## Resultado

Projeto pequeno e funcional, public

## Aprendizajes

Às vezes um projeto não precisa resolver um problema sério pra ser um bom exercício de front-end — foi uma forma leve de praticar manipulação de DOM e posicionamento dinâmico de elementos.
