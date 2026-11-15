# App web estático instalável em vez de app nativo

A primeira versão é um site estático feito com Vite, React e TypeScript, que a família adiciona à tela inicial do Android e do iPhone. Não usamos Expo nem React Native. A decisão veio de duas restrições. Instalar um app nativo no iPhone fora da loja custa US$ 99 por ano, e a primeira versão não usa câmera, notificações nem modo offline, que eram os motivos para ir ao nativo.

A alternativa séria era o Expo com exportação para a web. Ele ficou em segundo lugar porque a primeira versão só entrega a web, e a documentação do próprio Expo trata a web como alvo secundário e desaconselha service workers. Pagaríamos o custo do React Native sem usar nada nativo. A comparação completa está em [framework-do-app.md](../research/framework-do-app.md).

## Consequences

- A ida às lojas passa a ser um invólucro do mesmo site com Capacitor, e não um app nativo de verdade. A diretriz 4.2 da App Store pede mais do que um site reempacotado, então a Apple pode recusar um invólucro sem nada nativo.
- Se as lojas virarem prioridade antes de o app crescer, reescrever a interface em Expo volta a ser uma opção. As regras ficam no servidor e não mudam.
- Notificações, quando voltarem, usam Web Push no app web e outra interface de programação no app de loja.
- No iPhone, o app instalado guarda o login separado do Safari. Quem instalar entra uma vez de novo com o e-mail e a senha da família.
