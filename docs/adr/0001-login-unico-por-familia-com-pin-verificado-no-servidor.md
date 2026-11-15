# Login único por família, com perfis e PIN verificado no servidor

Cada família tem um único login de e-mail e senha, usado nos aparelhos dos responsáveis e nos aparelhos compartilhados. Dentro dele vivem os perfis de responsáveis e de filhos. O filho entra tocando no avatar e o responsável entra com um PIN próprio. Escolhemos esse desenho porque crianças de 4 a 12 anos não têm e-mail nem lembram senha, e porque o mesmo aparelho pode passar de mão em mão.

A sessão compartilhada tem um custo. O servidor não distingue um filho de um responsável pelo login, então o PIN não pode ser conferido só na tela. O servidor guarda o PIN em forma de hash, confere cada tentativa, limita as tentativas e devolve uma autorização curta de responsável. Toda ação de responsável e toda movimentação de pontos passa por uma função do servidor que exige essa autorização. O aplicativo nunca grava direto em nenhuma tabela.

A autorização é um código aleatório que o servidor devolve quando o PIN confere. O aplicativo o mantém só na memória e o envia em cada função de responsável. O servidor guarda apenas o hash do código e a validade, em uma tabela que o aplicativo não lê. O código vence depois de alguns minutos sem uso e quando o responsável sai do perfil.

## Considered options

- Uma conta por pessoa. Dá identidade real no servidor, mas exige e-mail ou senha para cada criança e complica o aparelho compartilhado.
- PIN conferido só no aplicativo. É menos código, mas qualquer pessoa com o login da família poderia aprovar tarefas e lançar pontos chamando o servidor direto.

## Consequences

- Um irmão pode entrar no perfil do outro, porque perfil de filho não tem PIN. A família aceitou esse risco na primeira versão. Ele vale só no aparelho com o login da família. O filho com aparelho próprio usa o aparelho do filho do [ADR 0004](0004-aparelho-do-filho-com-login-anonimo.md).
- Publicar para outras famílias mantém o desenho. O isolamento entre famílias vem do login, que é o da família ou o de um aparelho do filho, e o PIN só separa papéis dentro da família.
