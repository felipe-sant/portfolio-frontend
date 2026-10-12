## Contexto

Projeto pessoal para praticar cálculo geográfico e integração entre frontend e backend: simular uma rota de voo real entre dois pontos aleatórios do Brasil, levando em conta a curvatura da Terra em vez de uma linha reta num plano cartesiano.

## Meu papel

Desenvolvi sozinho tanto o frontend quanto o backend.

## Solução

O frontend renderiza o mapa com Leaflet, permite inserir coordenadas manualmente ou clicar diretamente no mapa, e simula o trajeto da aeronave em tempo real. O backend fornece coordenadas válidas dentro do território brasileiro e, a cada atualização de posição, retorna informações geográficas (país, estado, município, microrregião e mesorregião) a partir da API do IBGE.

## Decisões técnicas

O cálculo de posição ao longo da rota usa interpolação esférica (Slerp) sobre o arco de círculo máximo entre as duas coordenadas, em vez de interpolação linear — isso garante que o trajeto represente a curvatura real da Terra, não uma linha reta em um plano cartesiano. O backend foi reescrito em dezembro de 2025, estruturado em camadas de rotas, controllers e services, com testes unitários usando Jest.

## Resultado

O frontend está no ar e funcional isoladamente, mas aponta para uma versão anterior do backend (rotas antigas), já que o backend foi reescrito depois do último ajuste do frontend. Por isso o painel de localidade durante o voo sempre retorna "Desconhecido" — bug documentado em [issue #3](https://github.com/felipe-sant/maps-front/issues/3).

## Aprendizados

Entender a diferença entre interpolação linear e esférica para cálculos geográficos, e a importância de manter frontend e backend sincronizados quando são repositórios separados — a quebra de compatibilidade só foi percebida numa revisão posterior dos projetos.
