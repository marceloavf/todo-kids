# Aparelho do filho com login anônimo vinculado a um perfil

O filho que tem o próprio celular ou tablet usa um aparelho do filho, que abre direto no perfil dele. O aparelho não recebe o login da família. Ele entra com um login anônimo do Supabase, e um responsável o vincula a um filho com um código de vínculo. O servidor guarda qual família e qual filho cada login anônimo representa. Escolhemos esse desenho porque, num aparelho que ninguém vigia, o login da família deixaria o filho ver os irmãos, agir no perfil deles e bloquear o PIN do responsável. Também não haveria como desvincular um único aparelho sem trocar a senha da família.

Com isso, o login deixa de ser a família. Uma função do servidor resolve a família do login atual, seja ele o login da família ou um aparelho do filho, e substitui `auth.uid()` em todas as funções e na segurança por linha. As funções do filho conferem que o filho pedido é o do aparelho. As funções de responsável e `create_family` recusam o aparelho do filho. A leitura também se estreita. O aparelho do filho lê os dados da família que valem para todos, como rotinas, tarefas, recompensas e os perfis dos responsáveis, e só o perfil, as conclusões, os resgates e o extrato do próprio filho.

## Considered options

- Um QR que entra no login da família sem digitar a senha. Não muda o banco, mas o aparelho continua mostrando os perfis, os irmãos e o PIN do responsável, e só se desvincula trocando a senha. Exigiria também uma Edge Function com a chave de serviço.

## Consequences

- O código tem 6 caracteres sem os que se confundem, vale uma vez e vence em 10 minutos. O QR leva o mesmo código num link. No iPhone, o QR abre o Safari, que não divide o login com o app da tela inicial. Se o link resgatasse o código no Safari, o código acabaria gasto e o app instalado abriria sem vínculo. Por isso, no Safari do iPhone, o link não resgata o código. Ele mostra como instalar o app e o código para digitar dentro dele. No Android, o navegador e o app instalado dividem o login, e o link resgata o código direto.
- Cinco códigos errados descartam o login anônimo. O Supabase limita 30 logins anônimos por hora por IP. A versão 1 não tem CAPTCHA, que entra junto com a publicação para outras famílias.
- O aparelho fica vinculado até um responsável desvinculá-lo na tela Família ou arquivar o filho. Desvincular apaga o login anônimo.
- O login da família e os perfis continuam valendo nos aparelhos dos responsáveis e num tablet compartilhado, com os riscos aceitos no [ADR 0001](0001-login-unico-por-familia-com-pin-verificado-no-servidor.md).
