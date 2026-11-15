# Apps similares ao Todo Kids: construir ou adotar, e o que os melhores fazem na interface

Pesquisa feita em 2026-11-15. Marcação: **[V]** = li a fonte primária nesta data (repositório, loja, site do fornecedor, resumo do artigo); **[NV]** = não verificado (memória, fonte secundária ou página que não abriu). Números de GitHub vêm de `gh api`; dados de loja vêm da API pública do iTunes e das páginas da App Store e do Google Play; telas foram vistas nas capturas publicadas pelos próprios projetos (são imagens de divulgação, não o app em uso). `[Fn]` aponta para a lista de fontes no fim. "Crianças" aparece só ao falar de pesquisa e de apps de terceiros; para o Todo Kids valem os termos do `GLOSSARY.md`.

## Resumo

1. **Construir.** Nenhum projeto open source atende de uma vez português do Brasil, hospedagem a custo zero como web app instalável e tela de filho que dispensa leitura.
2. **O mais próximo é o OpenChore** (MIT, Go + React, PWA): tem seletor de perfil, PIN de responsável, aprovação por tarefa, extrato, ajuste manual e recompensas. Faltam: português (só inglês e alemão), hospedagem sem servidor próprio, resgate com confirmação prévia; sobram sequências, decaimento de pontos e foto. Serve de referência e pode virar fork se houver um servidor sempre ligado.
3. **Nos apps comerciais, as queixas se repetem**: assinatura cara, perda de dados e sincronização, configuração confusa, aprovação sem aviso e filho que burla. O desenho deve atacar as três últimas.

## 1. Projetos open source

Estrelas em 2026-11-15. "Aderência" compara com a lista da v1: perfil por filho, aprovação por tarefa, extrato de pontos, recompensas, tela amigável ao filho, português.

| Projeto | Licença | Estrelas | Último release | Stack e hospedagem | Aderência e lacunas |
|---|---|---|---|---|---|
| [OpenChore](https://github.com/liftedkilt/openchore) | MIT [V] | 35 [V] | nenhum publicado; último push 2026-11-15 [V] | Go + SQLite + React/Vite, PWA; Docker próprio [V][F1] | Seletor de perfil, filho entra com um toque, responsável com PIN; aprovação por tarefa; extrato; `POST /api/points/adjust`; recompensas; tarefa avulsa; leitura em voz alta [V][F1][F2]. Só inglês e alemão [V][F3]. Resgate parece imediato: a documentação da API só lista "redeem" e "undo a redemption", sem etapa de confirmação (inferência; não testei) [V][F2]. Traz sequências, decaimento e foto [V][F1] |
| [Kids-Reward-Chart-System](https://github.com/chapdad031167/Kids-Reward-Chart-System) | MIT [V] | 4 [V] | nenhum; push 2026-08-20 [V] | React + Express + SQLite, PWA; Docker próprio; demo no navegador [V][F4] | Toque no avatar, PIN de responsável, fila de aprovação com "aprovar tudo" e desfazer, extrato exportável, recompensas com limite diário, tema por filho [V][F4]. Toda conclusão vai para a fila (pelo README) [V]. Só inglês: não há pasta de traduções [V] |
| [Donetick](https://github.com/donetick/donetick) | AGPL-3.0 [V] | 2.749 [V] | v0.1.86, 2026-11-03 [V] | Go + React; self-hosted; existe `app.donetick.com` (preço [NV]) [V][F5] | Usuário do tipo filho, aprovação por tarefa, pontos, recompensa com resgate pendente/aprovado/recusado (no código) [V][F6]; tradução `pt`, mas os textos de recompensas só existem em inglês e holandês [V][F7]. Filho entra com usuário e senha de 8+ caracteres, e criar conta de filho abre a tela de plano pago no frontend [V][F7]; se isso vale no self-hosted [NV]. A captura oficial mostra uma lista de tarefas de adulto com prazos e etiquetas [V][F5]. Ajuste manual [NV] |
| [ChoreOps](https://github.com/ccpk1/ChoreOps) (sucessor do KidsChores) | GPL-3.0 [V] | 464 [V] | 1.6.0, 2026-09-29 [V] | Integração Python do Home Assistant [V][F8] | Perfis, aprovação, pontos, resgate com aprovação, bônus e descontos, `pt` [V][F8]. Exige Home Assistant em casa. O KidsChores original está arquivado (365 estrelas, 0.3.1 de 2025-03-10) [V][F9] |
| [TaskMate](https://github.com/tempus2016/taskmate) | MIT [V] | 48 [V] | v7.9.0, 2026-11-13 [V] | Integração do Home Assistant com 33 cartões [V][F10] | Aprovação por tarefa, resgate aprovado pelo responsável, `pt-BR`, modo pré-leitor, modo rotina, quadro de adesivos [V][F10][F11]. Exige Home Assistant |
| [Grocy](https://github.com/grocy/grocy) (módulo de afazeres) | MIT [V] | 9.684 [V] | v4.7.1, 2026-09-04 [V] | PHP, self-hosted, PWA sem offline [V][F12] | `pt_BR` [V]. O README não cita pontos, recompensas nem aprovação; é controle doméstico de adultos [V][F12] |
| [Questboard](https://github.com/thillygooth/questboard) | CC BY-NC 4.0: **não é open source** [V] | 170 [V] | v1.12.6, 2026-08-07 [V] | React + FastAPI, Docker [V][F13] | RPG em pixel art: monstro diário, ouro, recompensas. Sem PIN nem aprovação descritos; perde ouro à meia-noite [V][F13] |
| [Kinwall](https://github.com/JohnDuprey/kinwall) | AGPL-3.0 [V] | 14 [V] | v1.3.0, 2026-11-07 [V] | TypeScript, Docker; painel de parede [V][F14] | Calendário da família com tarefas, pontos e pedido de recompensa; foco em tela de parede [V] |
| [HomeGlow](https://github.com/jherforth/HomeGlow) | AGPL-3.0 [V] | 79 [V] | v1.10, 2026-10-23 [V] | JavaScript + SQLite, Docker [V][F15] | Painel de parede; pontos só ao concluir todas as tarefas do dia [V] |
| [Sprout](https://github.com/freeradicaltech/Sprout) | MIT [V] | 0 [V] | nenhum; push 2026-06-08 [V] | SvelteKit + Prisma + SQLite, PWA, Docker [V][F16] | Beta: extrato (ganho, bônus, desconto, resgate), resgate com aprovação, PIN [V]. Sem comunidade |
| [kids-chores-th](https://github.com/somboonko/kids-chores-th) | MIT [V] | 8 [V] | nenhum; push 2026-07-11 [V] | Google Apps Script + Planilhas: custo zero [V][F17] | Filho entra com avatar e PIN, pontos, recompensas; interface em tailandês [V] |
| [Tarefinhas](https://github.com/franzbsilva/Tarefinhas) | sem licença: não pode ser reutilizado [V] | 2 [V] | nenhum; push 2026-04-03 [V] | HTML/JS + Supabase, PWA [V][F18] | Em português; foco em mesada; bloqueia extras até cumprir as obrigatórias [V] |

Buscas no GitHub por "kids chores", "chore chart", "family chores", "kids allowance", "reward chart", "kids routine", "tarefas crianças" e "mesada" não trouxeram nada maior que isso [V][F19].

**Dá para adotar ou fazer fork?**

- **Adotar como está: não.** Cada candidato cai por um motivo diferente:
  - OpenChore, Kids-Reward-Chart-System, Sprout, Kinwall e HomeGlow pedem um servidor Docker sempre ligado, o que contraria "custo zero" a menos que já exista um em casa; nenhum tem português.
  - ChoreOps e TaskMate pedem Home Assistant; o TaskMate é o único com `pt-BR` e modo pré-leitor.
  - Donetick tem instância hospedada e resgate com confirmação, mas a tela é de adulto, o filho entra com senha e a conta de filho é paga no frontend.
  - kids-chores-th roda de graça, mas só em tailandês; Tarefinhas é em português, mas não tem licença.
- **Fork do OpenChore: viável, com custo.** Licença MIT, traduzir é acrescentar um arquivo `translation.json` [V][F3]. Mas o projeto nasceu em 2026-03, tem um mantenedor principal, não publicou release, e seria preciso desligar sequências, decaimento e foto, trocar o resgate imediato por pedido com confirmação e refazer a tela do filho, que hoje depende de texto. Manter Go além do stack escolhido é custo permanente.
- **Kids-Reward-Chart-System** vale como segunda referência de fluxo (toque, fila, celebração) e tem demo navegável [V][F4].

## 2. Apps comerciais

Notas da App Store dos EUA; preços das compras no app listadas na página da loja.

| App | Tela do filho | Conclusão e aprovação | Recompensas | Visual | Preço | Nota |
|---|---|---|---|---|---|---|
| [Joon](https://apps.apple.com/us/app/id1482225056) (6 a 12 anos) | Jogo com bichinho virtual; tarefas viram "Quests" [V][F20][F21] | Responsável vê a lista por período do dia com valor em moedas [V][F21]; versão gratuita aprova 7 por dia, segundo avaliação [V][F22] | Moedas cuidam do bichinho; "a recompensa é o jogo" [V][F20] | Ilustração suave, fundo claro | US$ 12,99/mês ou a partir de US$ 89,99/ano [V][F20]; no Brasil a partir de R$ 35,90 [V][F23] | 4,7 (6.565) [V] |
| [S'moresUp](https://apps.apple.com/us/app/id1287367596) | Cartão grande da tarefa com ilustração e botão "Mark as complete", confete ao concluir [V][F21] | Aba de aprovações; foto opcional [V][F21] | Pontos "S'mores" trocados por recompensas da família [V][F24] | Colorido e carregado | US$ 7,99/mês, US$ 79,99/ano; R$ 49,90/mês [V][F23] | 4,2 (898) [V] |
| [Neat Kid](https://apps.apple.com/us/app/id6480269902) (5 a 8 anos) | Faixa da semana e cartões com ícone, nome curto e estrelas [V][F21] | Filho marca sozinho; foto opcional (avaliações) [V][F22] | Grade de cartões com ícone e custo em estrelas [V][F21] | Verde, ícones redondos; tem português [V][F24] | US$ 4,99 a 79,99; R$ 14,90 a 299,90 [V][F23] | 4,7 (937); Brasil 4,9 (130) [V] |
| [Chore Pad](https://apps.apple.com/us/app/id384854237) | Quadro por filho: ícone, nome e um visto grande por linha; tema por filho [V][F21] | Toque marca; Modo Responsável com senha [V][F24] | Estrelas trocadas por recompensas [V][F24] | Quadro de cortiça, papel colorido | US$ 3,99/mês, US$ 29,99/ano [V][F23] | 4,2 (144) [V] |
| [Kids Chores and Allowance](https://apps.apple.com/us/app/id1178397615) (Privilege Points) | Tarefas por período ("Morning (Required)") com valor em pontos [V][F21] | Filho toca "Request Points"; responsável libera [V][F21] | "Privilégios" com cronômetro; lista de descontos por comportamento [V][F21] | Roxo, denso | US$ 7,99 a 9,99/mês [V][F23] | 4,6 (3.120) [V] |
| [Chores & Allowance Bot](https://apps.apple.com/us/app/id629797415) | Lista por horário com caixa de marcar e ícone de áudio [V][F21] | Mesada automática ou só após aprovação [V][F24] | Saldo em dinheiro ou moeda inventada [V][F24] | Azul-petróleo, datado; tem português | Grátis sem limite de filhos; Premium US$ 6,99/mês; R$ 49,90/mês [V][F23][F24] | 4,5 (10.971); Brasil 4,6 (83) [V] |
| [Chorsee](https://apps.apple.com/us/app/id1611068600) | Cartões com ícone e cor; grade semanal [V][F21] | Foto exigida por tarefa; ajustes manuais de saldo [V][F24] | Mesada, pontos ou nada, à escolha [V][F24] | Limpo, azul | US$ 8,99/mês, US$ 39,99/ano [V][F23] | 4,6 (12.045) [V] |
| [Homey](https://apps.apple.com/us/app/id1033286805) | Cartões com foto da tarefa [V][F21] | Tela "Approve all" por filho [V][F21] | Carteira e potes de poupança [V][F21] | Mascotes de animais | US$ 6,99/mês; atualizado em 2026-01-29 [V][F23] | 4,1 (2.775) [V] |
| [Thumsters](https://apps.apple.com/us/app/id1274298804) | Não há lista: o responsável dá "joinha" ou "joinha para baixo" [V][F21] | Lançamento pelo adulto, com motivo [V][F24] | Metas compradas com "Thumbucks" [V][F21] | Monstrinhos, roxo chapado | US$ 7,99/mês, US$ 47,99/ano [V][F23] | 4,7 (874) [V] |
| [Brili](https://apps.apple.com/us/app/id1516036620) | Uma tarefa por vez com anel de tempo e trilha da rotina [V][F21] | Avança ao concluir | Grade de cartões com custo em estrelas [V][F21] | Verde calmo; hoje vendido a adultos com TDAH [V][F21] | US$ 7,99/mês; sem atualização desde 2025-11-25 [V][F23] | 4,6 (605) [V] |
| [Habitica](https://apps.apple.com/us/app/id994882113) | Avatar de RPG, listas com caixas coloridas, ouro e mascotes [V][F21] | Autodeclarado; aprovação por responsável [NV] | Itens do jogo e recompensas próprias [V][F24] | Pixel art; tem português | US$ 4,99/mês; R$ 15,90/mês [V][F23] | 4,3 (3.697); Brasil 365 notas [V] |
| [Greenlight](https://apps.apple.com/us/app/id1049340702) | [NV] | [NV] | Dinheiro em cartão de débito [V][F24] | — | US$ 5,99 a 19,98/mês, tarefas em todos os planos [V][F25]; fora da loja brasileira [V][F26] | 4,8 (491 mil) [V] |
| [BusyKid](https://apps.apple.com/us/app/id1474508509) | [NV] | Mesada cai toda sexta [V][F27] | Cartão pré-pago | — | Preço [NV]; fora da loja brasileira [V][F26] | 3,4 (1.508) [V] |
| [Cozi](https://apps.apple.com/us/app/id407108860) | Listas de tarefas compartilhadas, sem pontos [V][F24] | — | — | Agenda familiar | Gold US$ 39 a 59,99/ano [V][F23] | 4,8 (403 mil) [V] |
| [Skylight](https://apps.apple.com/us/app/id1438779037) | Calendário de parede; estrelas e recompensas só no Plus [V][F24] | — | — | — | US$ 79/ano mais o aparelho [V][F23] | 4,8 (52 mil) [V] |

**OurHome**: a busca na App Store dos EUA só devolve apps homônimos de outros desenvolvedores; o original não apareceu [V][F26]. Situação atual [NV].

**Brasil.** Não há líder nacional. Na App Store brasileira, os mais avaliados para "tarefas crianças", "rotina infantil", "mesada" e "quadro de recompensas" são estrangeiros traduzidos: Neat Kid (130 notas) e Chores & Allowance Bot (83); os brasileiros (Rotininha, Daily Kids, Mesada Inteligente, Pipo Mesada) têm de 0 a 5 notas [V][F26]. No Google Play do Brasil a busca "tarefas crianças recompensas" lista Neat Kid (4,7; 1,59 mil avaliações), Child Reward (1,25 mil), Kids ToDo List (2,47 mil) e, entre os brasileiros, "Tarefas e Mesada" com 7 avaliações [V][F28]. Número de downloads não foi obtido [NV].

## 3. Queixas e elogios recorrentes

Amostra: 803 avaliações da App Store dos EUA de 10 apps (as mais úteis e as mais recentes de cada), das quais 311 com 3 estrelas ou menos [V][F22]. A contagem por tema é por palavra-chave, com sobreposição; serve para ordenar, não para medir. As datas vão de 2016 a 2026 (472 das 803 são de 2024 em diante); os exemplos de Homey (2019), Chore Pad (2018 a 2022) e Chorsee (2023) são antigos e podem já estar corrigidos.

| Tema nas avaliações de 1 a 3 estrelas | Ocorrências | Exemplo lido |
|---|---|---|
| Assinatura e preço | 87, nos 10 apps | Joon: quase US$ 100 por ano e cobrança sem aviso; Bot: "parem de implorar para eu pagar" |
| Erros, sincronização e perda de dados | 71, nos 10 apps | Neat Kid: perfis e tarefas sumiram ao trocar de celular; pontos zeravam ao alternar de filho |
| Confuso ou demorado de configurar | 65, nos 10 apps | S'moresUp: 10 minutos para criar e atribuir uma tarefa; Thumsters: cliques demais para dar um joinha |
| Aprovação e avisos | 28, em 9 apps | Homey: nenhum aviso quando o filho marca, é preciso abrir e desmarcar; Chorsee: sem aviso de conclusão; Joon: limite de 7 aprovações por dia no gratuito; foto pequena demais para conferir |
| Vários filhos e aparelhos | 25, em 8 apps | Chore Pad: sincronizar só por Dropbox |
| Filho burla | 17, em 6 apps | S'moresUp: nada impede o filho de entrar na conta do adulto; Neat Kid: marca sozinho, sem opção de exigir aprovação |
| Perda de interesse | 4 | Joon: chocou os três ovos na primeira semana e largou; "abandonado depois de um mês"; "foca demais no bichinho" |

Outros pontos lidos: tarefa não feita que passa para o dia seguinte e acumula (Neat Kid); impossível marcar hoje o que foi feito ontem (Chorsee, Privilege Points); mudança no visual do bichinho que deixou crianças tristes (Joon, 2026-10-05) [V][F22].

**Elogios**: menos cobrança verbal ("menos bronca, casa mais feliz"), filhos pedindo tarefas extras, recompensas definidas pela própria família, cada filho vendo a sua lista, substituir o quadro de papel na geladeira, e gratuidade real sem anúncio [V][F22].

**As três queixas que mais valem um desenho contrário**: (1) aprovação sem aviso e sem ação em lote; (2) configuração demorada; (3) filho que entra na área do responsável ou marca sem fazer. Assinatura não se aplica a um app gratuito. Perda de dados e sincronização são o segundo tema mais citado, mas são risco de engenharia, não de interface.

## 4. Três direções de interface

**A. Lista de cartões por período do dia**
- Quem usa: OpenChore (arco do dia, "4 de 10", blocos "Obrigatórias / Todo dia / Bônus"), Neat Kid, Chores & Allowance Bot, Privilege Points, Chorsee, Kids-Reward-Chart-System [V][F1][F4][F21].
- Tela do filho: saldo no topo, barra ou anel de progresso, cartões com ícone, texto curto e círculo de marcar; três abas (Hoje, Semana, Recompensas).
- Tela do responsável: uma coluna por filho com barra de progresso e "aguardando aprovação"; o responsável pode marcar pelo filho [V][F1].
- Bom em: densidade, muitos filhos, tarefas com aprovação e avulsas no mesmo lugar; é o mais barato de construir.
- Ruim em: depende de leitura; lista longa desanima quem tem 4 a 6 anos. Funciona bem dos 7 aos 12.

**B. Roteiro guiado, uma tarefa por vez**
- Quem usa: Brili (anel de tempo e trilha da rotina), Modo Rotina do TaskMate (uma tarefa, botão grande "Feito", "Pular por agora", "Voltar", celebração no fim) [V][F11][F21].
- Tela do filho: ícone enorme, uma ação, barra de progresso; ao terminar, festa com o total de pontos da rodada.
- Tela do responsável: não vi nenhuma nesses apps. Proposta minha: linha do tempo do dia por filho, com o ponto em que cada um está.
- Evidência mais fraca das três: o Brili hoje mira adultos, e do Modo Rotina li só a documentação, sem captura.
- Bom em: rotina da manhã e da noite, pré-leitores, crianças que se dispersam; a ordem é dada pelo responsável.
- Ruim em: tarefas sem ordem, tarefas avulsas e visão geral do dia; o filho mais velho acha lento. Funciona bem dos 4 aos 7.

**C. Quadro de adesivos com personagem que reage**
- Quem usa: Chore Pad (quadro temático por filho), Quadro de Adesivos e Modo Pré-leitor do TaskMate (blocos de 128 px só com figura, pontos em 1 a 5 estrelas, cinza tracejado = a fazer, colorido = feito, âmbar com ampulheta = aguardando o responsável, resgate em dois toques) [V][F11]; variante com mascote: Joon, Habitica, Questboard, Thumsters [V][F13][F21].
- Tela do filho: grade de blocos grandes; blocos se acendem rumo à recompensa escolhida.
- Tela do responsável: cartões por filho com avatar, saldo e progresso, e a fila de aprovação no topo com "aprovar tudo" e "desfazer" [V][F4].
- Bom em: funcionar sem leitura, celebração, identidade por cor e avatar; é o que melhor cobre de 4 a 8 anos.
- Ruim em: cabe pouco texto e poucos itens; com 12 anos parece infantil. O mascote com cuidados próprios custa caro e é a origem das queixas de perda de interesse e de apego do Joon; um personagem que só reage é a versão segura.

Uma saída vista no TaskMate é ter a mesma tela com um interruptor de pré-leitor por filho [V][F11].

## 5. Evidência sobre sistemas de recompensa

- **Recompensa material esperada reduz a motivação própria por atividades que a criança já acha interessantes.** Meta-análise de 128 experimentos: efeito de −0,28 a −0,40 na escolha livre; elogio aumenta (0,33); o prejuízo tende a ser maior em crianças que em universitários [V][F29]. A conclusão é contestada por comentários publicados na mesma edição [V][F29]; a crítica de Cameron e colegas [NV].
- **Recompensar ajuda espontânea diminui a ajuda.** Bebês de 20 meses que ganharam recompensa material ajudaram menos depois do que os que receberam elogio ou nada [V][F30].
- **Economia de fichas funciona para aumentar comportamentos-alvo no curto prazo.** Meta-análise de 24 estudos em salas do jardim ao 5º ano: efeitos grandes [V][F31]. Uma revisão de 2011 concluiu que a qualidade da evidência não bastava para o selo de melhor prática [V][F32]. Efeito um pouco menor de 3 a 5 anos que de 6 a 15, segundo Soares e colegas (2016), que só vi em resumo de busca [NV].
- **Tirar fichas não rende mais que só dar.** Reforço e custo de resposta foram igualmente eficazes, e a preferência variou entre as crianças [V][F33]; mesmo achado em 1974 [NV].
- **Limite**: tudo isso vem de laboratório e de sala de aula. Não encontrei estudo primário sobre apps de tarefas em casa, e a página de orientação do CDC sobre programas de recompensa devolveu erro 404 [V].

Consequências para o desenho (inferência minha, não resultado dos estudos): pontuar rotina e obrigação, e não gentileza espontânea; acompanhar os pontos com celebração e elogio; tratar o ajuste de desconto como exceção; não vincular pontos ao que o filho já faz por gosto.

## 6. Perguntas em aberto

1. O `GLOSSARY.md` define Comprovação como foto e Aprovação como aceitar uma comprovação, mas a v1 não terá foto. O que a Aprovação aprova na v1? (Não editei o glossário.)
2. Existe um servidor sempre ligado em casa? Se sim, o fork do OpenChore deixa de esbarrar em custo.
3. Resgate: pedido que espera confirmação (decisão atual) ou imediato com desfazer, como no OpenChore?
4. Para não empilhar aprovações: "aprovar tudo", aviso visível ao abrir o perfil do responsável, e aprovação desligada por padrão?
5. Aparelho compartilhado ou um por filho? Isso define o quanto o PIN precisa resistir.
6. Uma tela só com interruptor de pré-leitor por filho, ou duas telas (4 a 6 e 7 a 12)?
7. Tarefa não concluída: some no fim do dia, ou pode ser marcada depois?
8. Não verificados: preço do Donetick hospedado, situação do OurHome, telas do filho no Greenlight e no BusyKid, downloads no Google Play, e os estudos marcados [NV].

## Fontes

- [F1] https://github.com/liftedkilt/openchore — README do OpenChore: recursos, stack, capturas da tela do filho, do seletor e do painel do responsável.
- [F2] https://github.com/liftedkilt/openchore/blob/main/docs/api.md — endpoints de aprovação, ajuste manual, resgate e desfazer resgate.
- [F3] https://github.com/liftedkilt/openchore/blob/main/web/src/i18n/languages.ts — idiomas `en` e `de`; um arquivo por idioma.
- [F4] https://github.com/chapdad031167/Kids-Reward-Chart-System — README, árvore de arquivos e capturas; demo em https://chapdad031167.github.io/Kids-Reward-Chart-System/.
- [F5] https://github.com/donetick/donetick — README do Donetick; https://app.donetick.com respondeu 200.
- [F6] https://github.com/donetick/donetick/blob/develop/internal/reward/model/model.go e `internal/user/model/model.go` — resgate com status e usuário do tipo filho.
- [F7] https://github.com/donetick/frontend/tree/develop/public/locales — pasta `pt`; `rewards.json` só em `en` e `nl`. Em `src/views/Settings/ChildUserSettings.jsx` e `src/views/Modals/Inputs/CreateChildUserModal.jsx`: senha do filho e bloqueio por plano.
- [F8] https://github.com/ccpk1/ChoreOps — README e pasta de traduções do ChoreOps.
- [F9] https://github.com/ad-ha/kidschores-ha — aviso de migração para o ChoreOps; repositório arquivado.
- [F10] https://github.com/tempus2016/taskmate — README e traduções (`pt-BR.json`).
- [F11] https://tempus2016.github.io/taskmate/Pre-Reader-Mode/ , https://tempus2016.github.io/taskmate/Routine-Mode/ , https://tempus2016.github.io/taskmate/Sticker-Chart-Card/ — modo pré-leitor, modo rotina e quadro de adesivos.
- [F12] https://github.com/grocy/grocy — README e pasta `localization/pt_BR`.
- [F13] https://github.com/thillygooth/questboard — README, licença CC BY-NC 4.0 e captura.
- [F14] https://github.com/JohnDuprey/kinwall — README.
- [F15] https://github.com/jherforth/HomeGlow — README.
- [F16] https://github.com/freeradicaltech/Sprout — README.
- [F17] https://github.com/somboonko/kids-chores-th — README.
- [F18] https://github.com/franzbsilva/Tarefinhas — README; repositório sem arquivo de licença.
- [F19] `gh search repos` com os termos citados, ordenado por estrelas, em 2026-11-15.
- [F20] https://www.joonapp.io/ — faixa etária, funcionamento e preço do Joon.
- [F21] Capturas de tela publicadas na App Store de cada app (campo `screenshotUrls` de https://itunes.apple.com/lookup?id=ID&country=us), vistas como imagem.
- [F22] https://itunes.apple.com/us/rss/customerreviews/page=1/id=ID/sortby=mosthelpful/json (e `sortby=mostrecent`) para Joon, S'moresUp, BusyKid, Homey, Chores & Allowance Bot, Chorsee, Neat Kid, Thumsters, Privilege Points e Chore Pad.
- [F23] Páginas https://apps.apple.com/us/app/idID e https://apps.apple.com/br/app/idID — compras no app e data da última versão.
- [F24] Descrição de cada app na App Store (campo `description` da API de consulta do iTunes).
- [F25] https://greenlight.com/plans — planos e inclusão de tarefas.
- [F26] https://itunes.apple.com/search e https://itunes.apple.com/lookup com `country=br` e `country=us` — presença na loja brasileira, notas e busca por OurHome.
- [F27] https://busykid.com/ — "allowance is direct deposited each Friday".
- [F28] https://play.google.com/store/search?q=tarefas%20crian%C3%A7as%20recompensas&c=apps&hl=pt_BR&gl=BR e as páginas de cada app — ordem, nota e número de avaliações.
- [F29] https://pubmed.ncbi.nlm.nih.gov/10589297/ — Deci, Koestner e Ryan (1999), Psychological Bulletin 125(6).
- [F30] https://pubmed.ncbi.nlm.nih.gov/18999339/ — Warneken e Tomasello (2008), Developmental Psychology 44(6).
- [F31] https://pubmed.ncbi.nlm.nih.gov/34784784/ — Kim, Fienup, Oh e Wang (2022), Behavior Modification 46(6).
- [F32] https://pubmed.ncbi.nlm.nih.gov/21930008/ — Maggin e colegas (2011), Journal of School Psychology 49(5).
- [F33] https://pubmed.ncbi.nlm.nih.gov/26916640/ — Jowett Hirst, Dozier e Payne (2016), Journal of Applied Behavior Analysis 49(2).
