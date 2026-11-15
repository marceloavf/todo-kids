# Supabase como backend

O login, o banco, as regras de pontos e a sincronização em tempo real ficam no Supabase, no plano gratuito hospedado. Escolhemos o Supabase porque é o único candidato de código aberto que cumpre todas as restrições a custo zero, e porque as regras do extrato ficam no próprio Postgres. O banco recusa saldo negativo com uma restrição, as funções rodam em transação e a segurança por linha isola cada família pelo login.

O Convex exigiria menos código, com tudo em TypeScript e tempo real automático. Ele ficou em segundo lugar porque o servidor dele usa a licença FSL, que não é de código aberto. Se essa preferência mudar, o Convex passa a ser a melhor escolha. A comparação completa está em [backend-e-sincronizacao.md](../research/backend-e-sincronizacao.md).

## Consequences

- O plano gratuito pausa o projeto depois de cerca de sete dias com pouca atividade. Uma semana de férias sem uso exige um clique no painel para reativar. O projeto pausado pode ser restaurado por até um ano.
- As regras são escritas em SQL e PL/pgSQL, uma segunda linguagem além do TypeScript.
- O desenvolvimento usa o Supabase local em Docker, para não gastar um dos dois projetos gratuitos.
- A saída é barata. Os dados são Postgres comum.
