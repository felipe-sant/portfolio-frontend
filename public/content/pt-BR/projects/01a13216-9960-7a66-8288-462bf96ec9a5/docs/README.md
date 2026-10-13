## Contexto

Projeto acadêmico para praticar operações CRUD completas (criar, listar, editar, excluir) com um banco NoSQL, construindo tanto o frontend quanto a API.

## Meu papel

Desenvolvi sozinho o frontend e o backend.

## Solução

A aplicação permite cadastrar despesas (descrição, data e valor), listar todas as despesas cadastradas, editar e excluir cada uma. O frontend consome uma API REST própria, que persiste os dados no MongoDB via Mongoose.

## Decisões técnicas

Separação clara entre frontend e backend em repositórios próprios, unidos por um repositório wrapper com git submodules. O backend expõe uma API REST simples em Express, e o frontend usa React puro (sem bibliotecas de estado), com chamadas diretas à API.

## Resultado

O CRUD funciona de ponta a ponta — testado criando, listando e confirmando a persistência de uma despesa. A interface, porém, ainda está em nível de protótipo (sem estilização real, com textos de placeholder como "Hello world"), por isso o projeto está marcado para retrabalho visual futuro.

## Aprendizados

A ideia e a base funcional do projeto são sólidas — a maior lacuna hoje é só de acabamento de interface, não de lógica ou arquitetura.
