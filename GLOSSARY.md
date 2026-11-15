# Todo Kids

Aplicativo em que responsáveis montam as tarefas do dia de cada filho, os filhos as cumprem para ganhar pontos e os responsáveis conferem e administram esses pontos. O nome entre parênteses é o termo usado no código.

## Language

### Pessoas

**Família** (`Family`):
O grupo de responsáveis e filhos que compartilham as mesmas rotinas, pontos e recompensas.
_Avoid_: Conta, casa, grupo

**Responsável** (`Guardian`):
Adulto da família que cria rotinas, aprova conclusões e administra pontos. Uma família pode ter vários, todos com os mesmos poderes.
_Avoid_: Pai, mãe, admin

**Filho** (`Child`):
Criança da família que cumpre tarefas e acumula pontos próprios.
_Avoid_: Criança, usuário, jogador

**Perfil** (`Profile`):
A identidade de um responsável ou de um filho dentro da família. No aparelho com o login da família, a pessoa escolhe o perfil ao abrir o aplicativo.
_Avoid_: Usuário, login

**Aparelho do filho** (`ChildDevice`):
Um aparelho vinculado a um único filho, que abre direto no perfil dele sem o login da família. Só um responsável vincula e desvincula o aparelho.
_Avoid_: Conta do filho, login do filho

**Código de vínculo** (`LinkCode`):
O código, mostrado também como QR, que um responsável gera para vincular um aparelho a um filho.
_Avoid_: Convite, senha, token

### Tarefas

**Rotina** (`Routine`):
Lista de tarefas que se repete em dias da semana e é atribuída a um ou mais filhos.
_Avoid_: Lista, checklist, agenda

**Tarefa** (`Task`):
Um item a cumprir, com um valor em pontos, uma explicação e a indicação de exigir ou não aprovação.
_Avoid_: Atividade, missão, item

**Explicação** (`Explanation`):
A descrição curta e os passos que mostram ao filho como cumprir uma tarefa.
_Avoid_: Instrução, ajuda, detalhe

**Passo** (`Step`):
Uma etapa da explicação, com um texto curto e um emoji opcional. O passo só informa e o filho não o marca.
_Avoid_: Subtarefa, etapa, item

**Cartão da tarefa** (`TaskCard`):
A tela que abre quando o filho toca em uma tarefa, com a explicação e o botão que confirma a conclusão.
_Avoid_: Modal, popup, cartões (a lista do modelo A do protótipo)

**Tarefa avulsa** (`OneOffTask`):
Tarefa de data única, fora de qualquer rotina.
_Avoid_: Tarefa extra, tarefa única

**Conclusão** (`Completion`):
O registro de que um filho cumpriu uma tarefa em um dia. Cada filho tem as próprias conclusões, mesmo em rotina compartilhada.
_Avoid_: Check, entrega, execução

**Comprovação** (`Proof`):
A foto que o filho anexa a uma conclusão para o responsável conferir.
_Avoid_: Evidência, anexo, prova

**Aprovação** (`Approval`):
A decisão do responsável de aceitar uma conclusão de tarefa que a exige, liberando os pontos.
_Avoid_: Validação, confirmação

**Reprovação** (`Rejection`):
A decisão do responsável de recusar uma conclusão, sem tirar pontos. No mesmo dia a tarefa volta para "a fazer", e o filho vê quem pediu para fazer de novo. Depois da meia-noite ela fica "não feita".
_Avoid_: Recusa, rejeição

**Dica** (`Hint`):
Uma frase curta e opcional que o responsável escreve ao reprovar uma conclusão, para o filho saber o que mudar.
_Avoid_: Comentário, motivo, observação

**Pendência** (`PendingItem`):
Uma conclusão aguardando aprovação ou um resgate aguardando confirmação de um responsável.
_Avoid_: Notificação, aviso, fila

### Pontos

**Pontos** (`Points`):
A unidade que um filho ganha ao cumprir tarefas e gasta em recompensas.
_Avoid_: Moedas, estrelas, créditos

**Saldo** (`Balance`):
O total de pontos disponíveis de um filho. Cada filho tem o seu, nunca compartilhado.
_Avoid_: Pontuação, placar

**Extrato** (`Statement`):
O histórico de entradas e saídas de pontos de um filho.
_Avoid_: Histórico, log

**Estorno** (`Reversal`):
A saída de pontos no extrato gerada quando um responsável desfaz uma conclusão.
_Avoid_: Cancelamento, devolução

**Ajuste** (`Adjustment`):
Um bônus ou desconto de pontos lançado à mão por um responsável, sempre com motivo.
_Avoid_: Correção, multa, penalidade

**Recompensa** (`Reward`):
Algo que o responsável cadastra com um custo em pontos para os filhos trocarem.
_Avoid_: Prêmio, item da loja

**Resgate** (`Redemption`):
O pedido de um filho para trocar pontos por uma recompensa, que só vale depois que um responsável confirma.
_Avoid_: Compra, troca
