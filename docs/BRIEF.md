# Briefing do Todo Kids, versão 1

O Todo Kids é um aplicativo em que os responsáveis montam as tarefas do dia de cada filho, os filhos marcam o que cumpriram e ganham pontos, e os responsáveis aprovam, ajustam os pontos e definem as recompensas. A primeira versão atende uma família. Os termos em destaque seguem o [glossário](../GLOSSARY.md).

## Escopo da versão 1

A versão 1 inclui os itens abaixo.

- Login único da família e perfis de responsável e de filho.
- Aparelho do filho, vinculado a um filho por código de vínculo ou QR.
- Rotinas por dia da semana, atribuídas a um ou mais filhos, e tarefas avulsas.
- Conclusão de tarefas pelo filho, com pontos na hora ou depois da aprovação.
- Cartão da tarefa, com explicação em passos, leitura em voz alta e confirmação antes de marcar.
- Animações, partículas e sons na tela do filho, com opções por filho.
- Lista de pendências do responsável, com aprovação em lote.
- Extrato e saldo por filho, com ajuste manual e estorno.
- Recompensas cadastradas pela família e resgate confirmado pelo responsável.
- Interface em português do Brasil, em Android e iPhone, como app web instalável.

Estes itens ficam fora da versão 1.

- Comprovação por foto. A aprovação existe sem foto, e a foto entra depois no mesmo fluxo.
- Notificações e lembretes.
- Uso sem internet. O app instalado não abre sem conexão. Se a conexão cair com ele aberto, ele mostra um aviso de "sem internet" e bloqueia as marcações. A leitura do último dia carregado exige um service worker e fica para depois.
- Sequência de dias, bônus por rotina completa, mascote e sorteios.
- Níveis, álbum de coleções e metas da família em conjunto. As duas pesquisas de 2026 desaconselham.
- Recompensa favorita como objetivo do filho. Fica para depois que a família usar o app.
- Publicação nas lojas e cadastro aberto para outras famílias.

## Perfis e acesso

- A família entra uma vez por aparelho com e-mail e senha.
- No aparelho com o login da família, a pessoa escolhe um perfil ao abrir o app. O filho toca no avatar. O responsável digita o PIN dele.
- Todos os responsáveis têm os mesmos poderes. O extrato registra qual responsável aprovou, ajustou ou estornou.
- O servidor confere o PIN e limita as tentativas. A decisão está no [ADR 0001](adr/0001-login-unico-por-familia-com-pin-verificado-no-servidor.md).
- O filho com aparelho próprio usa um aparelho do filho, que abre direto no perfil dele, sem os perfis e sem o login da família. A decisão está no [ADR 0004](adr/0004-aparelho-do-filho-com-login-anonimo.md).
- Na tela Família, o responsável toca em "Vincular aparelho" no perfil do filho e vê o QR, o código de vínculo e quanto falta para ele vencer. O cartão mostra "Vinculado!" quando o aparelho usa o código.
- O código tem 6 caracteres sem os que se confundem, vale uma vez e vence em 10 minutos. Gerar outro cancela o anterior. No app instalado, o filho digita o código em "Tenho um código", na Entrada. O QR leva o código num link. No Android, o link vincula o aparelho direto. No Safari do iPhone, o link não gasta o código. Ele mostra como adicionar o app à tela inicial e o código para digitar no app.
- Cinco códigos errados descartam o login anônimo do aparelho, que começa de novo. A versão 1 não tem CAPTCHA.
- O aparelho do filho só lê os dados da família que valem para todos e os dados do próprio filho. Ele não vê saldo, conclusões, resgates nem extrato dos irmãos.
- Um filho pode ter vários aparelhos. A tela Família lista cada um com quem vinculou e quando, e um botão "Desvincular". O aparelho do filho não tem botão de sair.
- O aparelho fica vinculado até um responsável desvinculá-lo ou arquivar o filho. Desvinculado, ele volta para a Entrada.

## Regras

### Tarefas e o dia

- Uma rotina vale nos dias da semana que o responsável escolher. Ela não tem horário. A ordem das tarefas é a que o responsável definir.
- Em uma rotina atribuída a dois filhos, cada filho tem as próprias conclusões e os próprios pontos.
- A família tem um fuso horário. O servidor calcula qual dia é "hoje" a partir dele, e não do relógio do aparelho.
- A tarefa não cumprida até meia-noite fica "não feita". Não há desconto nem conclusão atrasada.
- A edição de uma rotina vale na hora para o que ainda não foi concluído. As conclusões já feitas não mudam.

### Aprovação

- O responsável marca em cada tarefa se ela exige aprovação.
- Sem aprovação, os pontos entram no saldo quando o filho marca a tarefa.
- Com aprovação, a conclusão vira uma pendência. Os pontos entram quando um responsável aprova.
- A reprovação devolve a tarefa para "a fazer" no mesmo dia e não tira pontos. O bloco ganha um selo 🔁, e o cartão diz "{Responsável} pediu para fazer de novo", com a dica, se houver. O selo some quando o filho marca de novo.
- A dica é opcional, tem até 120 caracteres e só existe na reprovação.
- O responsável pode decidir depois da meia-noite. A aprovação tardia credita os pontos normalmente. A reprovação tardia deixa a tarefa daquele dia como "não feita", porque o dia já fechou.
- O filho não desmarca uma tarefa. Só o responsável desfaz uma conclusão, e o extrato registra o estorno.

### Pontos

- Os pontos são números inteiros e não expiram.
- O servidor guarda o saldo de cada filho e o atualiza na mesma transação de cada lançamento do extrato. O saldo é sempre igual à soma do extrato.
- O banco recusa saldo negativo. Um desconto ou estorno maior que o saldo tira o que houver e para em zero. O extrato registra o valor pedido e o valor que saiu de fato.
- A conclusão guarda o valor que a tarefa tinha naquele dia.
- Todo ajuste tem um motivo escrito.
- Uma tarefa pode valer 0 pontos. Ela não mostra estrela nem "+0" e continua comemorada. Serve para tirar os pontos aos poucos de um hábito já formado.

### Recompensas

- O responsável cadastra cada recompensa com um custo em pontos.
- O filho pede o resgate. O app bloqueia o pedido se o saldo não cobre o custo.
- O débito acontece quando um responsável confirma o resgate.
- Cada filho tem no máximo um resgate pendente por vez. Assim dois pedidos nunca somam mais que o saldo.
- Um ajuste ou um estorno pode baixar o saldo depois do pedido. Nesse caso o app bloqueia a confirmação e o responsável só pode recusar o resgate.

## Telas

| Tela | Quem usa | O que faz |
| --- | --- | --- |
| Entrada | Família, filho | Login com e-mail e senha, uma vez por aparelho, ou o código de vínculo do aparelho do filho. |
| Perfis | Todos | Escolha do perfil. Pede o PIN para responsável. |
| Hoje | Filho | Tarefas do dia, saldo e progresso ("6 feitas · 2 esperando"), em um quadro de figuras de três colunas (modelo C do protótipo). Com mais tarefas do que cabem, a tela rola e os blocos mantêm o tamanho. O toque em um bloco abre o cartão da tarefa. |
| Recompensas | Filho | Recompensas com custo, quanto falta e pedido de resgate, confirmado em um cartão igual ao da tarefa. |
| Início | Responsável | Pendências no topo, com "aprovar tudo" e a reprovação com dica. Abaixo, o progresso e o saldo de cada filho. |
| Rotinas | Responsável | Criar e editar rotinas, tarefas e tarefas avulsas. |
| Recompensas | Responsável | Criar e editar recompensas. |
| Extrato | Responsável | Histórico de pontos de um filho, ajuste e estorno. |
| Família | Responsável | Perfis, cores, avatares, PIN, fuso horário, as opções de cada filho e os aparelhos de cada filho. |

A tela do filho segue estas regras, tiradas da [pesquisa de interface](research/ui-e-bibliotecas.md).

- Cada alvo de toque tem cerca de 2 cm, perto de 105 pixels.
- O toque simples basta para tudo. Não há arrastar nem toque longo.
- Marcar uma tarefa pede dois toques. O bloco abre o cartão da tarefa, e o botão "Fiz!" confirma. Tocar fora fecha o cartão sem marcar. Não há opção para desligar a confirmação.
- Nada depende de leitura. Cada tarefa tem um ícone grande e duas ou três palavras.
- O estado da tarefa muda a forma e o ícone, e não só a cor.
- Depois de uma conclusão, o app ignora toques repetidos por um instante.
- Não há contagem regressiva, perda de sequência nem recompensa por tempo de uso.

### Cartão da tarefa

- O cartão mostra o ícone grande, o nome, a descrição curta e até cinco passos. Cada passo tem um texto curto e um emoji opcional.
- Os passos só informam. O filho não marca um por um.
- O botão "ouvir" lê o nome e os passos com a voz em português do aparelho.
- O filho não desfaz a conclusão. Só o responsável desfaz.

### Movimento e som

- O bloco afunda ao toque, e o cartão abre a partir dele.
- A comemoração cresce com a conquista, tirada da [pesquisa de gamificação](research/gamificacao-e-animacoes.md).
  - **Tarefa.** No "Fiz!", o selo carimba, 8 estrelas saem do bloco e os pontos voam até o saldo. Tudo termina em menos de 0,75 s.
  - **Aprovação.** Um aviso curto, sem tela cheia: "{Responsável} viu!" e "2 tarefas · +30".
  - **Dia completo.** A única tela cheia, com cerca de 32 partículas. Ela fecha só com um toque.
  - **Pedido de resgate.** Ampulheta parada e "Pedido enviado", sem festa.
  - **Resgate confirmado.** Festa média, na hora ou ao abrir o app.
- A tarefa que exige aprovação mostra uma ampulheta parada no lugar da festa.
- Cada ocasião comemora uma vez só. A aprovação que fecha o dia vira só a comemoração do dia.
- Confete, sons e voz param quando o filho sai da tela.
- Os sons são gravações de licença livre para toque, tarefa feita, pontos, dia completo e resgate. No Android o aparelho também vibra.
- O responsável ajusta três opções em cada perfil de filho: ler em voz alta ao abrir o cartão, sons ligados e animação reduzida. O app também respeita a opção de movimento reduzido do aparelho, e a animação reduzida vale para todas as transições.

### Textos para o filho

- O app elogia o que foi feito, e não a pessoa, segundo a [pesquisa de psicologia](research/boas-praticas-psicologia.md). Nunca "Campeão!" nem "Você é incrível!".
- O dia completo mostra uma de três frases, como "Você foi fazendo uma por uma e terminou tudo."
- O resgate recusado diz "{Responsável} não confirmou agora. Seus pontos continuam com você."
- Com a voz ligada, o app também fala a comemoração e o pedido para fazer de novo.

### Ajuda para o responsável

- O editor de tarefa lembra que, para filhos pequenos, a aprovação funciona em poucas tarefas e decidida no mesmo dia.
- O desconto lembra que funciona melhor quando foi combinado antes e contado pessoalmente.
- O cadastro de recompensa sugere tempo junto.
- Acima de "Aprovar tudo" fica "Conte para cada filho o que você viu."

## Modelo de dados

| Entidade | Campos principais |
| --- | --- |
| Família | nome, fuso horário |
| Perfil | família, tipo (responsável ou filho), nome, cor, avatar, saldo (só filho), opções do filho (voz alta, sons, animação reduzida), arquivado |
| Credencial do responsável | perfil, hash do PIN, tentativas erradas, bloqueio. O aplicativo não lê esta entidade. |
| Autorização do responsável | perfil, hash do código, validade. O aplicativo não lê esta entidade. |
| Rotina | família, nome, dias da semana, filhos atribuídos, ordem, arquivada |
| Tarefa | rotina ou data avulsa, filhos atribuídos (só avulsa), nome, ícone, descrição, passos, pontos, exige aprovação, ordem, arquivada |
| Conclusão | tarefa, filho, dia, estado (pendente, aprovada, reprovada, desfeita), pontos guardados, responsável que decidiu, dica (só reprovação). Só uma conclusão pendente ou aprovada por tarefa, filho e dia. |
| Lançamento do extrato | filho, tipo (conclusão, ajuste, estorno, resgate), valor pedido e valor aplicado com sinal, motivo, responsável |
| Recompensa | família, nome, ícone, custo, arquivada |
| Resgate | recompensa, filho, custo guardado, estado (pendente, confirmado, recusado), responsável que decidiu. Só um resgate pendente por filho. |
| Aparelho do filho | login anônimo, família, filho, responsável que vinculou, data |
| Código de vínculo | filho, hash do código, validade, responsável que gerou. O aplicativo não lê esta entidade. |

O aplicativo só lê os dados da própria família direto do banco, menos a credencial do responsável e o código de vínculo. O aparelho do filho lê só o que vale para todos e os dados do próprio filho. Toda gravação passa por uma função do servidor, que aplica as regras acima em uma transação. As funções de responsável exigem a autorização descrita no [ADR 0001](adr/0001-login-unico-por-familia-com-pin-verificado-no-servidor.md).

## Stack

| Parte | Escolha | Motivo |
| --- | --- | --- |
| Aplicativo | Vite, React e TypeScript, como site estático com manifesto de instalação | [ADR 0002](adr/0002-app-web-estatico-em-vez-de-app-nativo.md) |
| Backend | Supabase hospedado, plano gratuito | [ADR 0003](adr/0003-supabase-como-backend.md) |
| Dados no app | `@supabase/supabase-js` e TanStack Query | Leitura com cache e atualização em tempo real. |
| Estilo | Tailwind. A tela do filho é feita à mão. | Uma biblioteca de componentes atrapalha poucos botões enormes. |
| Ícones | Noto Emoji nas tarefas, copiados para o repositório. Lucide na área do responsável. | Licenças permissivas e cobertura das tarefas de casa. |
| Avatares | Bichos do Noto Emoji sobre a cor do filho | Nenhuma dependência nova. DiceBear com estilos CC0 fica como opção. |
| Fonte | Nunito, hospedada junto com o app | Arredondada, com acentos do português. |
| Movimento | Motion para molas e transições, `canvas-confetti` para partículas | A tela do filho pede movimento de aplicativo de primeira linha. Mascote e animação de personagem ficam fora. |
| Sons | Gravações de licença CC0 copiadas para o repositório | Som gravado soa melhor que som gerado por código. |
| QR | `uqr` na área do responsável | Licença MIT e nenhuma dependência. Gera o QR em SVG. |
| Voz | Síntese de fala do navegador | Lê a tarefa sem guardar arquivo. A qualidade varia por aparelho. |
| Testes | Vitest para as regras, contra o Supabase local. Playwright para os fluxos, com emulação de iPhone. | As regras de pontos são o risco principal. |

O servidor calcula o dia, então a versão 1 não precisa de biblioteca de datas. Os nomes dos dias da semana vêm do `Intl.DateTimeFormat` do navegador.

## Riscos e itens a verificar na construção

- O Supabase gratuito pausa após cerca de sete dias com pouca atividade. Um acesso diário agendado pode evitar a pausa. Ninguém verificou se ele basta.
- A hospedagem do site estático ainda não foi escolhida. Cloudflare Pages e GitHub Pages são gratuitos.
- Ninguém testou o toque, a rolagem e o teclado em um iPhone real. O protótipo serve para isso.
- O emoji mostra o objeto, e não a ação. Vale testar com um filho que não lê se "cama" basta para "arrumar a cama".
- Perfis, rotinas, tarefas e recompensas são arquivados, nunca apagados, para o extrato continuar legível.
- Cinco PINs errados bloqueiam o perfil do responsável por 5 minutos. A autorização vence após 15 minutos sem uso.
- O PIN esquecido pelo único responsável se resolve no painel do Supabase. A versão 1 não tem tela para isso.
- Dois toques por tarefa deixam a tela do filho mais lenta que a do protótipo aprovado.
- Ninguém testou o vínculo pelo QR e pelo código num iPhone e num Android reais.
- O login anônimo está desligado em `supabase/config.toml` e precisa ser ligado também no projeto hospedado.
- Ninguém verificou se uma função SQL consegue apagar o login anônimo ao desvincular, ou se isso exige a chave de serviço.
- A ECA Digital (Lei 15.211 de 2025) e a LGPD pedem revisão jurídica antes de publicar para outras famílias.

## Referências

- [Glossário](../GLOSSARY.md)
- [Pesquisa de framework](research/framework-do-app.md)
- [Pesquisa de backend](research/backend-e-sincronizacao.md)
- [Pesquisa de interface e bibliotecas](research/ui-e-bibliotecas.md)
- [Pesquisa de apps similares](research/apps-similares.md)
- [Pesquisa de gamificação e animações](research/gamificacao-e-animacoes.md)
- [Pesquisa de boas práticas de psicologia](research/boas-praticas-psicologia.md)
- [Protótipo descartável das telas](../prototype/index.html)
