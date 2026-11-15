# Gamificação e animações do Todo Kids

Pesquisa e auditoria em 15 de novembro de 2026. Escopo somente leitura no código. O único arquivo produzido por esta pesquisa é este relatório.

## Resumo de uma página

O Todo Kids já tem uma boa base: figuras grandes, confirmação em dois toques, Pontos previsíveis, identidade por Filho e ausência de competição ou pressão de tempo. O próximo ganho de qualidade vem da coordenação entre resposta visual, estado confirmado e som. Adicionar camadas de progressão antes de corrigir essa coordenação aumenta o trabalho e pode tornar o uso diário cansativo. Esta é uma avaliação de produto, fundamentada na auditoria abaixo e nas orientações de autonomia da UNICEF e de movimento breve da Apple. [V: UNICEF, 2024][S1]; [V: Apple, s.d., consultado em 2026][S10].

As dez melhorias abaixo estão em ordem qualitativa de impacto por esforço. A ordem considera a v1 para uma família. Não é um resultado experimental.

| Ordem | Melhoria recomendada | Resultado esperado | Esforço |
| --- | --- | --- | --- |
| 1 | Deixar a ampulheta estática após aparecer. | A espera fica compreensível sem movimento infinito nem aparência de cronômetro. | Pequeno |
| 2 | Completar o modo de animação reduzida em CSS, efeitos imperativos e mudança da preferência do aparelho. | A opção funciona em toda a experiência, inclusive no meio de uma celebração. | Pequeno a médio |
| 3 | Cancelar partículas e temporizadores ao sair, trocar de tela ou fechar a comemoração. | O confete termina junto com a ocasião e não invade Recompensas. | Pequeno |
| 4 | Reduzir e escalonar a celebração, juntando Aprovação e dia completo em um só efeito. | Cada conquista tem uma intensidade clara; o uso diário exige menos espera. | Médio |
| 5 | Recuperar o áudio depois de interrupções e coordenar efeitos com a leitura em voz alta. | Som mais confiável, sem efeitos competindo com a Explicação. | Médio |
| 6 | Completar a acessibilidade da comemoração: foco, Escape, botão visível, rolagem e contraste. | O Filho consegue ler, encerrar e continuar em telas pequenas ou com tecnologia assistiva. | Pequeno a médio |
| 7 | Encurtar a coreografia de "Fiz!", mantendo os dois toques e a proteção contra repetição. | O Saldo e o bloco respondem com clareza, sem uma sequência longa de bloqueios. | Médio |
| 8 | Mostrar separadamente o que o Filho marcou e o que aguarda Aprovação. | O esforço fica visível sem anunciar Pontos ainda não creditados. | Pequeno |
| 9 | Permitir escolher uma Recompensa como objetivo, com custo e Saldo restante claros. | O Filho expressa uma preferência e entende a troca, sem prazo nem reserva implícita. | Médio |
| 10 | Dar ao Filho escolha de avatar e cor com o Responsável, sem desbloqueios pagos em Pontos. | Personalização apoia identidade sem criar outra economia ou obrigação de voltar. | Pequeno no fluxo familiar atual; médio se houver tela própria |

Os itens 1 a 8 aproveitam os arquivos existentes. Os itens 9 e 10 são evolução opcional, depois de observar o uso real. Não recomendo níveis, álbum de coleções ou metas cooperativas na v1. Não há evidência direta suficiente de benefício duradouro em um app doméstico como este para justificar essa ampliação agora. A ausência dessa evidência não demonstra que essas mecânicas sejam prejudiciais. [V: Hamari, Koivisto e Sarsa, 2014][S4]; [V: Zourmpakis, 2026][S6].

## Método, marcações e limites

- **[V]** significa que o conteúdo foi aberto e lido nesta pesquisa. Em páginas de fornecedores, confirma o que eles publicam, não a eficácia ou o comportamento de todas as versões do app.
- **[NV]** significa que não houve verificação suficiente. Isso inclui impressões sobre movimento, sons não ouvidos e comportamento em aparelhos reais.
- **Inferência** identifica a interpretação para o Todo Kids. **Proposta** identifica uma decisão de design a testar, não uma conclusão científica.
- Anos indicam publicação ou atualização identificável. **s.d., consulta 2026** indica página viva sem data de publicação confiável.
- Os termos do Todo Kids seguem o [GLOSSARY.md](/home/marceloavf/Projects/todo-kids/GLOSSARY.md). Ao descrever estudos e outros produtos, uso a terminologia dos autores quando necessário.

Li o [BRIEF.md](/home/marceloavf/Projects/todo-kids/docs/BRIEF.md), as pesquisas de [interface e bibliotecas](/home/marceloavf/Projects/todo-kids/docs/research/ui-e-bibliotecas.md) e [apps similares](/home/marceloavf/Projects/todo-kids/docs/research/apps-similares.md), os sete arquivos de `src/child/`, `src/lib/sound.ts`, `src/index.css`, e dependências locais relevantes. Aprofundo comportamento, coordenação dos efeitos e limites da evidência. Não refaço a seleção de bibliotecas nem a comparação de preços da pesquisa anterior.

Inspecionei as seis capturas fornecidas em `slice2`: `hoje-390.png`, `card-360.png`, `fiz-animando-390.png`, `dia-completo-390.png`, `recompensas-390.png` e `perfis-390.png`. São estados estáticos. Elas não permitem medir fluidez, atraso de toque, sincronismo audiovisual ou conforto sensorial. Não rodei o app nem o banco. Não fiz ensaio de uso dos produtos do benchmark.

## 1. Gamificação saudável para crianças

### O que a evidência permite afirmar

Deterding e colegas definem gamificação como uso de elementos de design de jogos fora de jogos. Essa definição não prescreve Pontos, medalhas ou rankings e não demonstra sua eficácia. Portanto, um cartão que responde bem e torna o progresso compreensível já pode contribuir para uma experiência lúdica sem acrescentar um jogo paralelo. A última frase é inferência para o produto. [V: Deterding, Dixon, Khaled e Nacke, 2011][S3].

A revisão de Hamari e colegas encontra resultados frequentemente positivos, mas dependentes do contexto e das pessoas. A meta-análise de Sailer e Homner encontra benefícios agregados em aprendizagem, com resultados motivacionais e comportamentais menos estáveis quando se restringe a análise aos estudos de maior rigor. Nenhuma das duas demonstra que coleções ou níveis melhorem a cooperação doméstica de Filhos de 4 a 12 anos. [V: Hamari, Koivisto e Sarsa, 2014][S4]; [V: Sailer e Homner, 2020][S5].

A revisão de Zourmpakis reúne 19 estudos de gamificação adaptativa e aprendizagem baseada em jogos no pré-escolar e início do ensino fundamental. A base mistura abordagens e depende de amostras pequenas, intervenções curtas e medidas específicas dos pesquisadores. É evidência promissora para adequar dificuldade e ritmo, mas fraca para decidir sobre uma economia de Pontos em casa. A revisão de Alotaibi trata de aprendizagem baseada em jogos, uma intervenção diferente de marcar Tarefas. Seus resultados não isolam o efeito do confete, da animação ou da recompensa. [V: Zourmpakis, 2026][S6]; [V: Alotaibi, 2024][S7].

O RITEC orienta o design por autonomia, competência, emoções, identidade, relações, criatividade, segurança e inclusão. O relatório de 2024 e a caixa de ferramentas apoiam ouvir as crianças e dar espaço para escolha. Isso constitui uma base de design e pesquisa sobre brincar digitalmente, não uma certificação de que uma mecânica específica seja saudável. Li a apresentação oficial do estudo e a caixa de ferramentas; o PDF integral de 16 MB não abriu no mecanismo de consulta. [V: UNICEF, 2024, página do relatório][S1]; [V: UNICEF, 2024, caixa de ferramentas][S2].

Esta pesquisa não repete a discussão ampla sobre motivação intrínseca, economia de fichas ou retirada gradual de recompensas, objeto da pesquisa paralela de psicologia. Aqui a pergunta é como a interface expressa as regras sem pressionar o Filho.

### Julgamento das mecânicas

As recomendações abaixo são inferências de produto. A coluna de evidência distingue apoio geral de demonstração direta da mecânica.

| Mecânica | Apoio e limite | Aplicação recomendada |
| --- | --- | --- |
| Progresso visível e finito | Clareza de competência é compatível com o RITEC. Não há ensaio isolando esta barra em Tarefas domésticas. [V: UNICEF, 2024][S2] | Manter figuras e contagem. Separar "marcadas" de "aprovadas". A barra não deve produzir alarmes perto da meia-noite. |
| Meta escolhida pelo Filho | Apoio de design à autonomia; eficácia doméstica específica [NV]. [V: UNICEF, 2024][S2] | Uma Recompensa favorita, escolhida com liberdade para mudar. Sem prazo, sugerir a mais cara ou aumentar o custo quando se aproxima. |
| Coleções permanentes | Khan Kids demonstra uso comercial, não prova benefício causal. [V: Khan Academy, s.d., consulta 2026][S22] | Adiar. Se houver depois, coleção pequena e conhecida, sem raridade, duplicatas, prazo ou compra de pacotes. Mostrar o conteúdo antes de escolher. |
| Personalização de avatar | Compatível com identidade e autonomia no RITEC. Efeito isolado sobre Tarefas [NV]. [V: UNICEF, 2024][S2] | Preferir escolhas gratuitas do conjunto já existente. Avatar não fica triste, faminto ou indisponível quando o Filho não usa o app. |
| Níveis | As revisões avaliam combinações de elementos, com grande dependência do contexto. Não sustentam uma progressão universal. [V: Hamari e colegas, 2014][S4] | Não adicionar na v1. Um nível acumulado pode virar comparação entre irmãos ou uma segunda contagem sem utilidade prática. Esse risco é inferência. |
| Conquistas | Evidência específica para este contexto é fraca. [V: Sailer e Homner, 2020][S5] | Se testadas, marcos permanentes e descritivos, como "Aprendeu a preparar a mochila", confirmados em conversa. Sem "Filho perfeito" ou "100 dias sem errar". |
| Meta familiar cooperativa | Relações têm apoio no RITEC; resultados de colaboração escolar não provam efeito familiar. [V: UNICEF, 2024][S2]; [V: Sailer e Homner, 2020][S5] | Adiar. Depois, uma atividade conjunta sem Saldo compartilhado, ranking ou exigência de que todos cumpram tudo para alguém receber algo. |
| Celebração de marcos | Orientação de interface apoia retorno breve e proporcional; quantidade ideal para crianças [NV]. [V: Apple, s.d., consulta 2026][S10] | Escalonar Tarefa, Rotina, dia e Resgate confirmado. Não acrescentar bônus por Rotina, que está fora da v1. |

### Padrões que criam pressão

A 5Rights descreve ciclos de recompensa, manutenção de sequências, escassez artificial e pressão social como estratégias persuasivas que podem prejudicar a autonomia. É um relatório de direitos e políticas com exemplos e depoimentos, não um experimento que demonstre dano em toda ocorrência desses elementos. [V: 5Rights Foundation, 2023][S8].

| Padrão | O problema de design | Regra prática para o Todo Kids |
| --- | --- | --- |
| Recompensa variável | Valor ou disponibilidade imprevisível incentiva tentar novamente para descobrir o resultado. | Não sortear Pontos ou Recompensas. Variação decorativa determinística de um som não muda o valor e não equivale a um sorteio. |
| Sequência com perda | A ausência passa a custar um histórico adquirido. | Preservar a decisão de não ter sequências. Não substituí-las por um calendário de presença disfarçado. |
| FOMO e prazo artificial | O Filho precisa voltar para não perder algo. | Nada de presentes que expiram, ofertas por horário, avisos de última chance ou contagem regressiva. |
| Moedas que escondem valor | Conversões, múltiplos saldos e pacotes dificultam entender o custo. | Uma unidade chamada Pontos. Mostrar custo inteiro, Saldo e o que sobrará após confirmação. O emoji de estrela é símbolo, não outra moeda. |
| Ranking e comparação | O valor da ação passa a depender do desempenho de outra pessoa. | Mostrar somente o progresso do próprio Filho. Nem ranking familiar nem "seu irmão já terminou". |
| Culpa e dependência emocional | Um personagem sofre ou pede ajuda quando a criança tenta sair. | Sem mascote na v1. Nunca usar avatar triste, despedida culpabilizante ou frase de abandono. |
| Progresso interminável | Ao atingir uma meta, surge imediatamente outra exigência. | Dia completo encerra a ocasião. Não oferecer "mais uma Tarefa" automaticamente nem premiar tempo no app. |

As relações de risco nesta tabela seguem a taxonomia e os exemplos da 5Rights. A escolha de proibi-las no Todo Kids é uma decisão de produto já compatível com o briefing, não uma alegação de proibição jurídica universal. [V: 5Rights Foundation, 2023][S8].

O Age Appropriate Design Code do ICO, especialmente o padrão 13, proíbe induzir crianças a fornecer dados desnecessários ou reduzir proteções de privacidade. Também admite intervenções favoráveis ao bem-estar, como pausar e salvar. Isso não equivale a proibir todo elogio ou toda gamificação. O padrão 5 trata do uso prejudicial de dados. Uso esses critérios como referência de design, sem concluir a aplicabilidade jurídica a uma PWA brasileira familiar. [V: ICO, 2020, PDF atualizado em 2022][S9].

Apple e Google fornecem limites de distribuição e proteção infantil, não validação psicológica das mecânicas. A Kids Category da Apple exige separar links externos, compras e distrações por uma barreira parental, e restringe publicidade e análise de terceiros. As políticas Families do Google exigem conteúdo adequado e limitam publicidade, inclusive anúncios que confundem controles ou prejudicam o uso. O limite de cinco segundos citado na política do Google refere-se a anúncios, não a toda animação de interface. A v1 não será publicada nessas lojas, mas pode aproveitar esses limites como referência. [V: Apple, s.d., consulta 2026][S11]; [V: Google Play, s.d., consulta 2026][S12].

## 2. Benchmark de apps infantis

### O que foi verificado

O benchmark usa descrições oficiais, centrais de ajuda e páginas das lojas publicadas pelos fornecedores. "Copiar" significa adotar o princípio de interação, sem copiar personagens, sons ou arte. Toda recomendação desta seção é inferência. Não medi a duração das animações nem ouvi os sons dos apps.

| Produto | Progresso, Recompensas e personagens verificados | Som, movimento e celebração | O que aproveitar e o que evitar |
| --- | --- | --- | --- |
| Duolingo ABC | Lições curtas, histórias narradas com destaque das palavras, personagens e pequenas recompensas. [V: Duolingo, s.d., consulta 2026][S20]. O documento de 2023 distingue a versão de alfabetização, com uma piada diária, da sequência formal dos outros apps. [V: Duolingo, 2023][S21] | A narração está documentada [V]. Molas, número de estrelas, háptica e duração das comemorações [NV]. Não transferir observações do Duolingo de idiomas para o ABC. | Aproveitar uma ação clara e retorno legível por vez. Não importar ligas, perda de sequência, vidas ou escassez do produto de idiomas. A documentação de 2023 não comprova ausência atual de toda mecânica de retenção. |
| Khan Academy Kids | Caminho personalizado e exploração livre. A ajuda mostra vistos de progresso e coleções nos quartos dos personagens, como instrumentos, chapéus e insetos. [V: Khan Academy, s.d., consulta 2026][S22][S23] | Kodi atua como narradora; músicas e instrumentos estão documentados [V]. Qualidade da mixagem e comemorações em uso [NV]. | Aproveitar consistência visual e possibilidade de escolha. Uma coleção é referência para futuro, sem reproduzir uma sala de brinquedos paralela às Tarefas. |
| Toca Boca World | Criação de personagens, decoração e presentes. A ajuda oficial informa que cada presente semanal fica disponível por uma semana. [V: Toca Boca, s.d., consulta 2026][S24][S25] | Abertura do presente após interação está descrita [V]. Sons, física e sequência exata de abertura [NV]. | Aproveitar expressão pessoal e resposta dos objetos à ação. Evitar presente que expira, caça a novidades e agenda semanal de retorno. Não tomar o prestígio da marca como aprovação de todas as mecânicas. |
| Sago Mini World | Brincadeira aberta, personagens e personalização de objetos. O fornecedor declara ausência de Pontos e limites de tempo. [V: Sago Mini, s.d., consulta 2026][S26] | A página destaca arte e música [V: declaração do fornecedor]. A impressão de movimento delicado ou som pouco cansativo continua [NV]. | Aproveitar liberdade e causalidade lúdica. Não acrescentar atividades infinitas ao Todo Kids. A meta aqui ocorre fora da tela. |
| PBS KIDS Games | Coleção de jogos com personagens conhecidos e temas curriculares. A descrição não estabelece uma economia universal de recompensas. [V: PBS, s.d., consulta 2026][S27] | Cada jogo pode ter regras próprias. Um sistema comum de som, medalhas ou celebração é [NV]. | Aproveitar navegação visual e contexto reconhecível. Não generalizar a interação de um minijogo para o catálogo inteiro. |
| Lingokids | A ajuda atualizada em 02/10/2026 descreve uma estrela por atividade diferente, cinco estrelas por pacote de adesivos, contador reiniciado diariamente e retirada do pacote sem prazo. [V: Lingokids, 2026][S28] | A animação de celebração sinaliza a conclusão da parte principal da atividade [V]. Timbre, volume, probabilidade do conteúdo dos pacotes e duração [NV]. | Aproveitar um sinal claro de término. Evitar reiniciar progresso adquirido e oferecer pacotes cujo conteúdo não é conhecido. A fonte não permite afirmar que sejam caixas aleatórias. |
| Headspace for Kids | Conteúdo guiado por faixas até 5, 6 a 8 e 9 a 12 anos, em temas como calma, foco e sono. [V: Headspace, 2021][S29] | Narração e vídeo guiado estão documentados [V]. A impressão de animação suave é [NV]; não houve reprodução. Níveis ou economia infantil de recompensas [NV]. | Aproveitar tom sem julgamento, pausas e adequação da linguagem. Não transformar calma ou foco em uma obrigação pontuada, nem apresentar o app como tratamento. |
| Joon | Tarefas viram atividades do jogo e alimentam o cuidado e a evolução de um animal virtual. O site também descreve lembretes. [V: Joon, s.d., consulta 2026][S30] | Celebrações, efeitos e duração [NV]. O uso de um personagem em progressão é verificado; sofrimento por ausência não foi verificado. | Aproveitar ligação clara entre ação real e retorno. Não adotar mascote, cuidados obrigatórios ou lembretes. Alegações de eficácia do fornecedor não validam o desenho do Todo Kids. |
| Greenlight | Ajuda oficial descreve pagamento por Tarefa, distribuição entre categorias e metas de poupança; outra página permite vincular mesada à conclusão. [V: Greenlight, s.d., consulta 2026][S31][S32] | Personagens, sons, confete e uso do app pelo Filho [NV]. | Aproveitar transparência entre ganho e destino. Não introduzir dinheiro, investimentos, juros, cartão ou pressão para cumprir tudo como consequência desta referência. |
| BusyKid | Ganhos por Tarefas e categorias de poupar, doar e investir. A página descreve depósito da mesada na sexta-feira. [V: BusyKid, s.d., consulta 2026][S33] | Celebração, som e movimento [NV]. | Aproveitar uma separação compreensível de estados. Evitar transformar a relação doméstica inteira em pagamentos ou agenda de recompensas. |
| OurHome | O domínio oficial não respondeu nesta pesquisa. Sistema histórico de Pontos e recompensas e disponibilidade atual [NV]. Não uso esses dados para sustentar propostas. | Todos os detalhes audiovisuais [NV]. | Não copiar uma suposta mecânica sem fonte atual. A pesquisa anterior já registra a incerteza de disponibilidade. |
| Homey | Site oficial descreve responsabilidades, trabalhos pagos, metas de poupança, recompensas, notificações e conversa familiar. [V: Homey, s.d., consulta 2026][S34] | Sons, mascotes e animações atuais [NV]. | Aproveitar a explicação visual do objetivo. Não importar notificações, conversa ou promessa de resultado financeiro futuro. |
| S'moresUp | Site oficial apresenta organização de Tarefas e recompensas. A descrição oficial na loja confirma Pontos S'mores por Tarefas e recompensas escolhidas pela família. [V: S'moresUp, s.d., consulta 2026][S35][S36] | Não revalidei o confete descrito na pesquisa anterior. Intensidade, som e movimento atuais [NV]. Depoimentos no site não são evidência experimental. | Aproveitar participação familiar e clareza das recompensas. Evitar competição, punições automáticas e densidade de painel adulto na área do Filho. |

### O aprendizado transversal

A semelhança útil é a correspondência entre ação, resposta e significado. Para o Todo Kids, o desenho de maior valor é reconhecer o bloco que o Filho tocou, confirmar a Conclusão e explicar o Saldo. Um catálogo de minijogos ou um animal que precisa de cuidados tem outra finalidade. Esta é inferência a partir dos produtos acima, não um resultado comparativo de satisfação.

O benchmark também mostra que coleções e brincadeira aberta são opções diferentes. Sago Mini publica uma proposta sem Pontos; Khan Kids usa coleções; Lingokids adiciona um contador diário. Não existe consenso comercial sobre uma única estrutura de gamificação saudável. As escolhas devem ser avaliadas pelo efeito na família, não pela semelhança com um app premiado. [V: Sago Mini, s.d.][S26]; [V: Khan Academy, s.d.][S22]; [V: Lingokids, 2026][S28].

## 3. Animação, microinteração e acessibilidade

### Princípios de animação aplicados com parcimônia

Lasseter descreve a adaptação de princípios da animação tradicional à animação por computador. A Adobe reúne os doze princípios tradicionais em um guia profissional. São referências de ofício, não experimentos sobre crianças usando interfaces. A tabela é uma aplicação proposta ao Todo Kids. As intensidades e tempos são hipóteses de design. [V: Lasseter, 1987][S13]; [V: Adobe, s.d., consulta 2026][S14].

| Princípio | Aplicação proposta |
| --- | --- |
| Compressão e alongamento | Bloco pressionado até `scale: 0.96`. Selo pode passar por `scaleX: 1.04`, `scaleY: 0.96` por 60 ms. Nunca deformar texto. |
| Antecipação | A própria pressão de 60 ms prepara a abertura. Não criar uma espera artificial antes de enviar "Fiz!". |
| Encenação | Um foco principal por instante. Primeiro selo, depois relação com o Saldo. Texto e botão ficam acima das partículas. |
| Ação direta e pose a pose | Usar estados claros de início e fim. A resposta do servidor escolhe a pose final; a animação não escolhe o estado dos dados. |
| Continuidade e sobreposição | Ícone assenta brevemente depois do cartão. A sobreposição dura 40 a 60 ms e não inicia outro salto inteiro. |
| Aceleração e desaceleração | Entrada desacelera, saída acelera. Evitar deslocamento linear de um cartão grande. |
| Arcos | O chip de Pontos usa uma curva curta até o Saldo. Sem giro, volta na tela ou várias moedas. |
| Ação secundária | Um pequeno pulso do Saldo pode acompanhar a chegada do chip. Não fazer todos os blocos reagirem. |
| Ritmo e duração | Pressão de 60 ms, troca pequena de 120 a 180 ms e cartão com alvo visual de 280 a 360 ms. |
| Exagero | Reservar uma escala de até 1.10 ao selo ou ao marco maior. O texto e o fundo não pulam. |
| Desenho sólido | Manter proporção, borda e sombra coerentes. Não esticar a imagem ou recalcular sua resolução durante a transição. |
| Apelo | Repetir cor, forma e linguagem do Filho. Personalidade vem da consistência, sem exigir mascote. |

A Apple recomenda brevidade, propósito e possibilidade de cancelar movimentos, especialmente em ações frequentes. O Material publica durações graduais e orienta aumentar o tempo conforme a área e o deslocamento. Esses guias ajudam a escolher uma escala consistente; não prescrevem os valores de mola ou a quantidade de partículas deste relatório. [V: Apple, s.d., consulta 2026][S10]; [V: Google, s.d., consulta 2026][S15].

### Escala de celebração e ritmo diário

A recomendação é manter o mesmo retorno pequeno em toda Tarefa. Não enfraquecer a experiência conforme o Filho "perde novidade", nem aumentar a intensidade para tentar recuperar interesse. Variar discretamente o acabamento pode reduzir monotonia, mas essa vantagem ainda é [NV] para este app.

| Ocasião | Intensidade proposta | Duração visual proposta | Partículas | Som |
| --- | --- | --- | --- | --- |
| Tarefa sem Aprovação | Selo, chip único e pulso leve do Saldo | 600 a 750 ms desde o sucesso da operação | 8 estrelas | Um sinal curto; chegada opcional muito baixa |
| Tarefa com Aprovação | Selo de ampulheta e mensagem estática | 120 a 180 ms | 0 | Um sinal neutro, sem som de Pontos |
| Rotina completa | Mensagem pequena no próprio quadro, se houver esse agrupamento no futuro | 350 a 500 ms | 0 | Nenhum som adicional na mesma Conclusão |
| Dia completo | Comemoração de tela cheia preservada, com encerramento disponível | Movimento até 1.200 ms; mensagem fica até ser fechada | 32 no total | Uma vinheta de até 1.200 ms |
| Pedido de Resgate | Confirmação visual de pedido pendente | 120 a 180 ms | 0 | Sinal neutro |
| Resgate confirmado | Destaque da Recompensa e confirmação do débito | 900 a 1.100 ms | 40 no total | Uma vinheta de até 900 ms |

Esses valores são propostas, não limiares científicos de segurança. Resgate confirmado é mais raro e pode ter o maior destaque, mas não precisa ocupar a tela inteira. A Rotina não concede Pontos extras e só merece uma nova mensagem se não competir com o dia completo. A v1 pode continuar sem retorno específico de Rotina.

Uma Aprovação individual usa o nível de Tarefa. Aprovações recebidas juntas produzem um resumo, não uma fila de festas. Se também completarem o dia, deve existir uma única ocasião audiovisual. Ao reabrir depois de longo período, mostrar o resumo das aprovações com calma, sem reproduzir todos os sons atrasados. Tudo isso é proposta para reduzir interrupções, alinhada à orientação de acessibilidade cognitiva. [V: W3C WAI, 2021][S19].

### Acessibilidade e diferenças sensoriais

WCAG 2.3.3 é nível AAA e exige poder desligar animação não essencial disparada por interação. WCAG 2.2.2 é nível A e exige pausa, parada ou ocultação para movimento automático que dure mais de cinco segundos e apareça junto de outro conteúdo. Um loop de 3,2 segundos repetido infinitamente dura mais de cinco segundos. A ampulheta em aprovações recebidas por atualização automática merece atenção a esse critério. Mesmo quando o estado começou por um toque intencional, remover o giro contínuo é a solução mais simples. Não declaro conformidade ou falha global do app sem ensaio completo. [V: W3C, WCAG 2.2, 2023][S16][S17].

O padrão 2.3.1 trata de flashes, não de qualquer movimento. Adotar zero flashes deliberados, zero estrobo e zero sacudida de tela evita trabalhar no limite das exceções. Confetes não são automaticamente uma violação, mas opacidade pulsante ou mudança rápida de luminância exige análise própria. [V: W3C, WCAG 2.2, 2023][S18].

O guia cognitivo do W3C reconhece diferenças de atenção e episódios de sobrecarga sensorial em algumas pessoas autistas. O guia de interrupções recomenda controle sobre movimento e som. Isso apoia oferecer previsibilidade, quietude e opções. Não autoriza dizer que todos os Filhos com TDAH precisam de estímulo extra ou que todos os Filhos com TEA precisam de animação desligada. Não há um perfil clínico inferido pelo app. [V: W3C WAI, 2021][S19][S39].

Proposta de comportamento acessível:

- A opção do Filho e `prefers-reduced-motion` se combinam por OU. Qualquer uma ligada reduz o movimento.
- Com movimento reduzido, usar troca estática ou opacidade de até 100 ms. Sem expansão compartilhada, voo, contagem animada, compressão, rotação ou partículas.
- Preservar exatamente a informação: nome da Tarefa, estado e Pontos creditados. Anunciar uma vez o valor final por `role="status"`, sem ler cada número intermediário.
- Som, leitura em voz alta e movimento continuam independentes. Movimento reduzido não significa ausência de comemoração textual.
- Não mover foco para um aviso pequeno de Aprovação. Em comemoração que se comporta como diálogo, mover e devolver foco, conter Tab, aceitar Escape e manter o botão de continuar acessível.
- Não fechar automaticamente uma mensagem que o Filho pode estar lendo. O movimento acaba; a mensagem permanece.

MotionConfig reduz movimentos de transformação e de layout, mas mantém outras propriedades, como opacidade. Ele não substitui a decisão explícita sobre CSS e toda animação imperativa. A implementação deve conferir o comportamento de cada caminho e também uma preferência que muda enquanto a área está montada. [V: Motion, s.d., consulta 2026][S40]. O padrão de foco dos diálogos é documentado pelo WAI-ARIA APG. [V: W3C WAI, s.d., consulta 2026][S41].

## 4. Som e háptica

### Direção sonora proposta

Usar sons de objetos leves: madeira, toque macio e notas dedilhadas. Evitar sirenes, apitos agudos, explosões, voz comemorativa automática e música contínua. Isso é direção artística proposta, não prescrição pediátrica. O som informa o estado e pode ser completamente dispensado.

A Apple recomenda respeitar volume, contexto de silêncio e interrupções, além de usar háptica breve, coerente e opcional. São diretrizes de plataformas nativas. A PWA não recebe automaticamente todos os controles e garantias de uma sessão nativa de áudio. [V: Apple, s.d., consulta 2026][S42][S43].

Valores iniciais para editar os arquivos, sujeitos à audição nos aparelhos da família:

| Evento | Duração do arquivo | Ganho inicial relativo | Timbre, variação e camadas |
| --- | --- | --- | --- |
| Toque de navegação | 30 a 60 ms | 0,10 | Um clique macio. Pode ser omitido em toques na aba já selecionada. |
| Abrir cartão | 80 a 140 ms | 0,12 | Movimento curto, sem varredura aguda. Omitir se a leitura começar junto. |
| Tarefa confirmada | 180 a 280 ms | 0,25 | Uma nota ou duas notas suaves. Uma variante A e B alternada, de igual duração e nível, é opcional. |
| Pontos chegam ao Saldo | 60 a 100 ms | 0,08 | Camada opcional, no máximo uma. Pode reutilizar o arquivo atual mais baixo ou ficar em silêncio. |
| Pedido pendente | 100 a 160 ms | 0,15 | Sinal neutro e curto. Mesmo sentido para pedido de Resgate. |
| Dia completo | Até 1.200 ms | 0,25 | Uma vinheta. Sem repetição ou aplausos em cima. |
| Resgate confirmado | 500 a 900 ms | 0,25 | Uma vinheta distinta. Não usar no pedido ainda pendente. |
| Erro de conexão ou operação | 80 a 140 ms | 0,12 | Toque neutro, acompanhado de mensagem. Nunca som que culpe ou assuste. |

Os ganhos supõem arquivos preparados com níveis semelhantes. `gain = 0.25` não significa 25% da sensação de volume e não informa decibéis no ouvido. O app não conhece a pressão sonora do alto-falante ou dos fones. Não há um valor universal de volume seguro a impor por esse número.

Como ponto de partida de produção, aplicar entrada de 5 a 10 ms e saída de 20 a 40 ms para evitar cliques de corte. Preferir energia percebida média a agudos estridentes; um filtro passa-baixas em 6 a 8 kHz pode ser experimentado na edição. Não há evidência verificada de que essa faixa seja ideal para crianças. Os WAV atuais têm 22,05 kHz de amostragem; isso não é a frequência do timbre.

Não sortear variantes raras, não alterar o valor dos Pontos com o som e não usar uma vinheta "especial" como isca. Uma alternância A/B previsível é só acabamento. Não há necessidade de novos arquivos na primeira rodada: baixar ganho, impedir sobreposição e usar os sons existentes já resolve parte importante do problema.

Proposta de mistura e silêncio:

1. Prioridade da leitura em voz alta sobre efeitos. Ao falar, suprimir os sons de abrir e tocar; não tentar controlar o volume global da síntese de fala pelo GainNode do Web Audio.
2. Fora da fala, manter no máximo duas fontes simultâneas: uma vinheta e um toque curto. Uma vinheta de dia completo substitui sons da Tarefa que a originou.
3. Ao desligar sons, interromper fontes já tocando e vibração em curso. Verificar a opção apenas no início do efeito não garante silêncio imediato.
4. Ao ocultar a página ou trocar de Perfil, parar fala, efeitos e vibração. Não reproduzir sons acumulados quando a página volta.
5. Quando falta um arquivo ou o navegador bloqueia reprodução, continuar silenciosamente. Não atrasar nem repetir a operação de dados para esperar pelo som.

### O que a web consegue fazer

| Capacidade | iPhone com Safari ou PWA | Android com Chromium | Consequência |
| --- | --- | --- | --- |
| Efeitos com Web Audio | Viáveis, mas contexto pode ficar interrompido ao sair e voltar. [V: MDN, s.d., consulta 2026][S45] | Política de autoplay pode suspender o contexto até uma interação. [V: Beaufort, Google, 2018, página viva][S44] | Desbloquear no gesto. Se suspenso ou interrompido, tentar retomar em novo gesto e tratar rejeição. A celebração visual funciona sem áudio. |
| Vibração | Não depender dela. O W3C registra oposição do WebKit à API. [V: W3C, 2026][S46] | Disponível em navegadores Chromium compatíveis, conforme aparelho, ativação e preferências. [V: W3C, 2026][S46]; [V: MDN, s.d.][S47] | Detectar suporte. `navigator.vibrate` não oferece o controle de intensidade ou os padrões do Taptic Engine. |
| Leitura em voz alta | Depende das vozes e do comportamento do sistema. A execução real neste app é [NV]. | Também depende das vozes instaladas ou remotas. [V: MDN, s.d.][S48] | Oferecer Ouvir, Parar e texto legível. Preferir voz local pt-BR, com alternativa explícita se não existir. |
| Silêncio físico do aparelho | Não prometer que o comportamento será idêntico ao de um app nativo. [NV: combinação específica de versão, PWA e rota de áudio] | Também requer ensaio com volume, DND e fones. [NV] | A opção de sons do Perfil é o controle confiável do produto. Testar o comportamento físico antes de descrevê-lo como garantido. |

Para vibração, propor um pulso de 15 ms na Tarefa confirmada e `[20, 40, 20]` no dia ou no Resgate confirmado. Não vibrar ao abrir, durante espera ou ao receber uma Aprovação remota. São valores de design a testar, não limites clínicos. A implementação atual liga vibração à opção de sons; manter essa relação na v1, explicando-a como "sons e vibração". Uma opção separada só se a família precisar dela.

Não usar truques com controles de formulário para provocar vibração no iPhone. Se a API não existir, o app segue com retorno visual. Não vale migrar para nativo apenas por essa diferença.

## 5. Auditoria do código e das capturas

### O que já está bom

Os itens seguintes são observações estáticas [V], não resultados de teste com Filhos.

- [Today.tsx:96](/home/marceloavf/Projects/todo-kids/src/child/Today.tsx:96) usa bloco inteiro como botão, nome acessível com estado e Pontos, borda tracejada para Tarefa a fazer e selos diferentes para pendente e feita. As capturas mostram hierarquia visual consistente e figuras reconhecíveis.
- [CardDialog.tsx:21](/home/marceloavf/Projects/todo-kids/src/child/CardDialog.tsx:21) protege os dois toques com 450 ms de armação e reinicia a espera quando há toque precoce. Usa `inert`, foco inicial, Escape, contenção de Tab e devolução do foco.
- [Today.tsx:258](/home/marceloavf/Projects/todo-kids/src/child/Today.tsx:258) confirma em `click`, protege requisição com referência síncrona e mantém erro no cartão. Isso evita que o gesto de rolar iniciado no botão seja tratado como confirmação.
- [ChildApp.tsx:138](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:138) espera o servidor antes de sinalizar sucesso. Tarefa pendente não dispara voo de Pontos.
- [fx.ts:25](/home/marceloavf/Projects/todo-kids/src/child/fx.ts:25) reúne opções sensoriais e combina a preferência do Perfil com a do aparelho. O `MotionConfig` da área recebe o resultado.
- [ChildApp.tsx:98](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:98) evita comemorar novamente um dia que já estava completo ao abrir. Há marcador por Filho e aparelho para Aprovações, com alternativa em memória quando localStorage falha.
- [Rewards.tsx:147](/home/marceloavf/Projects/todo-kids/src/child/Rewards.tsx:147) explica Saldo insuficiente, pedido pendente e confirmação pelo Responsável. O custo aparece antes do pedido.
- [speech.ts:5](/home/marceloavf/Projects/todo-kids/src/child/speech.ts:5) procura pt-BR antes de português genérico e cancela uma fala anterior. [sound.ts:15](/home/marceloavf/Projects/todo-kids/src/lib/sound.ts:15) reutiliza um AudioContext e buffers decodificados.
- [Emoji.tsx:10](/home/marceloavf/Projects/todo-kids/src/lib/Emoji.tsx:10) usa SVGs locais via `img`, com dimensões nas classes e texto alternativo vazio quando decorativos. Não injeta 111 árvores SVG no DOM de uma vez.

### Fragilidades, bugs e riscos

"Constatação" significa que o caminho está presente no código ou na captura. "Risco" significa que o efeito em execução depende de condições não ensaiadas.

| Prioridade e evidência | Local | Achado e consequência | Correção proposta |
| --- | --- | --- | --- |
| Alta, constatação [V] | [Today.tsx:150](/home/marceloavf/Projects/todo-kids/src/child/Today.tsx:150) | Ampulheta gira em ciclos de 3,2 s com `repeat: Infinity`, em todos os estados pendentes. O movimento não informa quanto falta. | Exibir selo estático. Zero giro, inclusive no modo normal. |
| Alta, constatação [V] | [fx.ts:53](/home/marceloavf/Projects/todo-kids/src/child/fx.ts:53) | `party()` emite 180 partículas em três rajadas. O terceiro disparo tem temporizador sem cancelamento. Não há `reset` quando a tela fecha. A captura de Recompensas ainda mostra partículas. | Reduzir orçamento, cancelar temporizador e limpar o canvas ao encerrar a ocasião ou navegar. |
| Alta, caminho verificável [V], frequência real [NV] | [Celebration.tsx:23](/home/marceloavf/Projects/todo-kids/src/child/Celebration.tsx:23), [ChildApp.tsx:107](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:107) | O efeito da comemoração depende de `day` e do tamanho de `approved`. Uma Aprovação pode iniciar festa e, 900 ms depois, promover a mesma tela a dia completo, disparando som e festa outra vez. `mergeCelebration` unifica dados, mas não impede esse segundo efeito. | Resolver a maior ocasião antes de emitir efeitos. Um identificador de ocasião controla uma execução; atualizações do texto não reiniciam o show. |
| Alta, constatação parcial [V] | [Rewards.tsx:66](/home/marceloavf/Projects/todo-kids/src/child/Rewards.tsx:66), [CardDialog.tsx:7](/home/marceloavf/Projects/todo-kids/src/child/CardDialog.tsx:7), [index.css](/home/marceloavf/Projects/todo-kids/src/index.css) | Barra CSS de Recompensa transita por 700 ms e botão conserva deslocamento CSS no toque. Não há regra CSS de movimento reduzido. `MotionConfig` não controla essas transições CSS. | Aplicar duração zero e retirar transformações CSS quando a preferência efetiva reduz movimento. |
| Alta, risco [V no código], execução [NV] | [sound.ts:29](/home/marceloavf/Projects/todo-kids/src/lib/sound.ts:29) | Depois do primeiro desbloqueio, os ouvintes são removidos. `playSound` apenas retorna quando o contexto não está `running`. No iOS, voltar de uma interrupção pode deixar todos os sons silenciosos. | Retomar áudio em novo gesto quando necessário, tratar a promessa e não reproduzir efeitos antigos. [V: MDN][S45] |
| Média, constatação [V] | [Celebration.tsx:31](/home/marceloavf/Projects/todo-kids/src/child/Celebration.tsx:31) | A comemoração põe foco no botão, mas não implementa Escape, contenção explícita de Tab ou devolução do foco. Também não limita nem permite rolar a lista de aprovações. Até 20 entradas podem chegar pela consulta. | Completar o comportamento de diálogo e usar resumo curto com área rolável. Não depender somente de `aria-modal`. [V: WAI-ARIA APG][S41] |
| Média, constatação [V] | [ChildApp.tsx:157](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:157), [ChildApp.tsx:364](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:364) | Após sucesso, há bloqueio de 900 ms e voo que começa após 320 ms e dura 800 ms. `tapsLocked` fica ligado enquanto há voo. A pressão de `scale: 0.88`, selo de `2.4` e pulso de Saldo de `1.25` adicionam bastante amplitude. | Reduzir amplitude e sobrepor etapas. Preservar a proteção de toque repetido sem depender da duração do voo. |
| Média, constatação [V] | [ChildApp.tsx:178](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:178) | `requestReward` toca `reward` e agenda partículas após o pedido, antes de confirmação e débito. O fluxo lido consulta apenas Resgates pendentes, sem ocasião audiovisual própria para confirmação. | Pedido recebe retorno neutro. Comemoração maior só em Resgate confirmado, após observar um evento confiável desse estado. |
| Média, risco [V no código], efeito real [NV] | [ChildApp.tsx:170](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:170), [ChildApp.tsx:185](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:185) | Temporizadores de 320 e 900 ms não são todos cancelados ao desmontar. Podem produzir efeitos depois de trocar de Perfil ou tela. O temporizador do dia só é limpo ao desmontar, sem revalidar `allDone` no disparo. | Cancelar por ocasião e revalidar estado, Perfil, dia e visibilidade antes de executar. |
| Média, constatação [V] | [Today.tsx:63](/home/marceloavf/Projects/todo-kids/src/child/Today.tsx:63), [sound.ts:43](/home/marceloavf/Projects/todo-kids/src/lib/sound.ts:43) | Abrir som e iniciar fala ocorrem juntos. Não há limite de fontes simultâneas, parada das fontes ao desligar sons ou tratamento de retorno após suspensão. | Priorizar voz, guardar fontes ativas e controlar a mistura. Não confundir disponibilidade da API com reprodução garantida. |
| Média, risco [V no código], execução [NV] | [Today.tsx:56](/home/marceloavf/Projects/todo-kids/src/child/Today.tsx:56), [speech.ts:12](/home/marceloavf/Projects/todo-kids/src/child/speech.ts:12) | O efeito que para a fala reage ao fechamento do cartão, mas não retorna limpeza ao desmontar Today. Troca direta de aba ou Perfil pode deixar fala continuar. Não há botão Parar. `ptVoice` não distingue voz local de remota. | Cancelar ao desmontar e ocultar, oferecer Parar e preferir voz local quando disponível. [V: MDN][S48] |
| Média, risco de geometria [V no código], defeito visual [NV] | [ChildApp.tsx:234](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:234), [CardDialog.tsx:93](/home/marceloavf/Projects/todo-kids/src/child/CardDialog.tsx:93) | Origem do `layoutId` está em contêiner com rolagem; destino fica em contêiner fixo. Não há `layoutScroll` nem `layoutRoot`. As capturas não mostram abertura após rolar. | Verificar a geometria com muitas Tarefas e rolagem. Aplicar as propriedades documentadas se houver desvio, sem reescrever o layout. [V: Motion][S49] |
| Média, risco da dependência [V no artefato instalado] | [fx.ts:26](/home/marceloavf/Projects/todo-kids/src/child/fx.ts:26) | O `useReducedMotion` instalado inicializa um `useState` com a preferência, sem setter ou assinatura de mudança no hook. Mudar a preferência do sistema durante a sessão pode não atualizar `fx.reduced`. | Verificar o comportamento instalado. Se necessário, observar `matchMedia` com assinatura de mudança em um único lugar e cancelar efeitos em curso. Não presumir que a documentação geral prova essa atualização. |
| Média, constatação semântica [V] | [ChildApp.tsx:89](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:89) | Contagem considera apenas `done`. Depois de marcar uma Tarefa com Aprovação, o Filho vê a ampulheta, mas a barra não muda. O trabalho informado e o crédito se confundem. | Acrescentar "X marcadas; Y esperando o responsável" sem creditar ou pintar como aprovada a Tarefa pendente. |
| Média, constatação por cálculo [V] | [index.css:19](/home/marceloavf/Projects/todo-kids/src/index.css:19), [Rewards.tsx:82](/home/marceloavf/Projects/todo-kids/src/child/Rewards.tsx:82) | Branco sobre o coral padrão `#f2603f` tem contraste aproximado de 3,22:1. Serve ao texto grande de "Fiz!", mas não ao "Quero!" de 18 px em negrito, cujo mínimo é 4,5:1. Âmbar `#a86f00` sobre `#fff0c2` fica em 3,75:1 e também exige cuidado nos rótulos pequenos. | Usar `kid-ink` em texto pequeno, escurecer o fundo do controle ou ajustar cores com contraste calculado para cada Perfil. [V: W3C][S50] |
| Baixa a média, risco [V no código] | [ChildApp.tsx:113](/home/marceloavf/Projects/todo-kids/src/child/ChildApp.tsx:113), [queries.ts:63](/home/marceloavf/Projects/todo-kids/src/lib/queries.ts:63) | Consulta traz no máximo 20 Aprovações recentes e avança o marcador ao horário mais novo. Uma ausência com mais de 20 pode omitir mensagens antigas de reconhecimento. Na primeira visita ao aparelho, o histórico é intencionalmente tratado como já visto. | Se a família atingir esse volume, buscar um resumo completo ou paginar antes de avançar o marcador. Não adicionar uma nova fila de festas. |

Na captura `fiz-animando-390.png`, partículas e chip atravessam o cabeçalho e o nome. Na de dia completo, confetes passam sobre texto e botão. Isso é uma constatação visual [V]; considerar a quantidade excessiva é uma avaliação de design. A captura de Recompensas confirma persistência visível das partículas, mas não mede por quantos segundos elas ficaram.

### Desempenho em celulares fracos

Não medi FPS, tempo de interação, memória nem energia. Os itens abaixo identificam trabalho desnecessário e pontos para verificação posterior, sem prometer um ganho numérico.

**Canvas.** `stars()` cria 36 estrelas por Tarefa, `sparkle()` cria 18 partículas e `party()` cria 180. Na versão instalada, o export padrão de canvas-confetti já tenta usar worker e redimensionamento. Seria incorreto recomendar "ligar worker" como se isso estivesse ausente. A opção `useWorker: false` documentada para uma instância criada não descreve o export global. Verifiquei `node_modules/canvas-confetti/src/confetti.js`, em especial `getDefaultFire`. O caminho sem worker ainda é possível conforme suporte. Priorizar redução de partículas, duração, área do canvas e cancelamento. [V: artefato instalado]; [V: documentação de canvas-confetti, s.d.][S51].

O `zIndex` padrão instalado é 100; a comemoração usa 50 e o chip 80. Isso explica por que o confete passa sobre conteúdo. Criar uma instância própria só se necessário para controlar esse ciclo de vida e a camada. Se criada, usar `resize: true`, `useWorker: true` e `disableForReducedMotion: true`, mantendo também a preferência do Perfil. O mesmo canvas não deve ser inicializado várias vezes, e uma instância com worker assume seu controle. [V: código local]; [V: canvas-confetti, s.d.][S51].

**Motion.** Há poucos blocos no quadro atual; não existe evidência de que `layoutId` precise ser removido. A biblioteca anima mudanças de layout usando transformações, mas medir posições, coordenar pais e filhos e deformar sombras ou bordas ainda exige cuidado. Evitar animar a grade inteira, adicionar sombras desfocadas em movimento ou medir o DOM em cada quadro. A leitura de destino de `FlyingPoints` acontece durante render; capturar origem e destino no início da ocasião torna o comportamento mais previsível se o cabeçalho mudar. O impacto de desempenho permanece [NV]. [V: Motion, s.d.][S49].

**Barras e números.** A barra de Hoje anima `width` e a de Recompensas usa transição CSS de largura. Elas não devem oscilar como molas a cada refetch. Proponho `scaleX`, com origem à esquerda, ou troca imediata em movimento reduzido. O Saldo já usa MotionValue, evitando estado React por quadro; manter essa escolha. Atualização do dado nunca espera a animação terminar. [V: ChildApp.tsx e Rewards.tsx]; proposta de implementação.

**Áudio.** Os oito WAV somam 126.504 bytes. Durações lidas dos cabeçalhos: toque 43 ms, abrir 209 ms, Tarefa 530 ms, Pontos 125 ms, pendente 191 ms, Recompensa 485 ms e dia 1.137 ms. Todos têm 22.050 Hz, mono, PCM de 16 bits. A soma aproximada de PCM decodificado em float32 é 252 kB, além de estruturas internas. Isso não sugere por si só um problema grande de memória. O risco mais imediato é decodificar tudo no primeiro gesto, perder o primeiro efeito e sobrepor sons. A avaliação de timbre, pico, loudness e clipping continua [NV], pois os arquivos não foram ouvidos nem analisados nesses aspectos.

**SVGs.** Existem 111 arquivos, totalizando 1.276.383 bytes sem compressão. Os maiores são o livro aberto, 70.657 bytes; a torneira, 67.989; e o coala, 64.343. Isso não significa que o celular transfira todos em Hoje: `Emoji` aponta apenas as imagens renderizadas e várias ocorrências usam a mesma URL. O seletor de muitos emojis pode solicitar mais arquivos. Não converter tudo em sprite nem rasterizar antes de medir. Se houver problema, otimizar os SVGs maiores preservando a arte e conferir o seletor em rede lenta. [V: inventário local e Emoji.tsx].

**Fontes.** `src/main.tsx` importa Nunito variável; o CSS instalado usa `font-display: swap` e separa `unicode-range`. O subconjunto latino normal tem 39.128 bytes. O import geral declara outros subconjuntos, mas isso não prova que todos sejam baixados no uso em português. Restringir ao latino é uma limpeza opcional, não prioridade. Risco a conferir é mudança de quebra de linha entre a fonte de reserva e Nunito, especialmente no cartão durante a expansão. Não recomendo trocar a fonte com base apenas nesta auditoria. [V: arquivos instalados de Fontsource e main.tsx].

As contagens de arquivos e durações vêm de leitura de `Path.stat` e `wave`, sem executar o aplicativo. Os contrastes vêm da fórmula de luminância sRGB da WCAG. Nenhum desses números é um benchmark de desempenho.

## 6. Tabela de propostas

Esforço pequeno significa alteração localizada sem novo modelo persistente. Médio envolve coordenação entre componentes ou um estado persistente novo. Grande envolve fluxo, modelo e validação novos. O risco é de implementação ou experiência, não uma previsão clínica.

| ID | Tela ou arquivo afetado | O que muda | Evidência principal | Esforço | Risco | Conflito com regra decidida |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | `Today.tsx`, `Hourglass`, `Rewards.tsx` | Ampulheta estática em toda Pendência. | Loop no código [V]; [W3C, 2023][S17] | Pequeno | Baixo; conservar rótulo e forma. | Nenhum. |
| P2 | `fx.ts`, `index.css`, `CardDialog.tsx`, `ChildApp.tsx`, `Rewards.tsx` | Preferência efetiva cobre CSS, Motion imperativo, canvas e mudanças em curso. | [Motion, s.d.][S40]; [W3C, 2023][S16]; código instalado [V] | Pequeno a médio | Médio; efeito em curso precisa acabar sem perder o estado final. | Nenhum; cumpre a regra existente. |
| P3 | `fx.ts`, `Celebration.tsx`, temporizadores em `ChildApp.tsx` | Cancelar efeitos e limpar partículas em navegação, fechamento, ocultação e troca de Perfil. | Capturas e código [V]; API `reset` [canvas-confetti][S51] | Pequeno | Baixo; uma instância deve ter um dono claro. | Nenhum. |
| P4 | `Celebration.tsx`, `ChildApp.tsx`, `fx.ts` | Um efeito por ocasião e níveis proporcionais de celebração. | Duplicação possível no código [V]; [Apple, s.d.][S10] | Médio | Médio; não suprimir mensagens de novas Aprovações. | Nenhum; mantém festa de dia completo e não cria bônus. |
| P5 | `sound.ts`, `speech.ts`, `Today.tsx`, `fx.ts` | Retomada de AudioContext, controle de fontes, silêncio ao sair e prioridade à voz. | [MDN, s.d.][S45][S48]; [Apple, s.d.][S42] | Médio | Médio; testar retorno do iOS e falhas de vozes. | Nenhum; preserva as três opções. |
| P6 | `Celebration.tsx`, `Rewards.tsx`, `index.css` | Diálogo completo, lista limitada com rolagem e contraste de texto pequeno. | [WAI-ARIA APG][S41]; [WCAG 1.4.3][S50]; cálculo local [V] | Pequeno a médio | Baixo; testar com texto ampliado. | Nenhum. |
| P7 | `Today.tsx`, `CardDialog.tsx`, `ChildApp.tsx` | Menor amplitude, voo mais curto, Saldo confirmado independente dos efeitos. | Código e captura [V]; [Apple, s.d.][S10]; [Motion][S52] | Médio | Médio; preservar bloqueio contra repetição e confirmação. | Nenhum se os dois toques forem mantidos. |
| P8 | Cabeçalho de `ChildApp.tsx`, estados de `Today.tsx` | Mostrar Conclusões informadas e Aprovações separadamente. | Código [V]; competência no [RITEC, 2024][S2] | Pequeno | Baixo a médio; não chamar Pendência de crédito. | Nenhum; não altera Pontos. |
| P9 | `Rewards.tsx`, `ChildApp.tsx`; persistência futura do Perfil | Recompensa favorita e indicação "custa X, seu Saldo é Y, após confirmar sobram Z". | Autonomia no [RITEC, 2024][S2]; custos atuais [V] | Médio | Médio; favorita não pode parecer reserva de Pontos nem prazo. | Nenhum. Exige discutir persistência; não faz parte desta edição. |
| P10 | Fluxo familiar de avatar e cor; eventual tela do Filho | Filho escolhe identidade sem gastar Pontos. | Identidade no [RITEC, 2024][S2]; conjunto local [V] | Pequeno no uso acompanhado; médio como recurso | Baixo; identidade não muda sozinha nem é perdida. | Nenhum. Avatar não é mascote. |
| P11, depois | Quadro de Hoje | Marco pequeno de Rotina sem bônus. | [Apple, s.d.][S10]; suporte de relações no RITEC é indireto | Médio | Médio; não empilhar com Tarefa e dia. | Não, desde que sem bônus. Fora do recorte atual da v1. |
| P12, adiar | Futuro álbum pessoal | Coleção finita e permanente escolhida pelo Filho. | Benchmark de [Khan Kids][S22]; eficácia doméstica [NV] | Grande | Médio a alto; amplia retenção e modelo. | Sem conflito se não houver sorte, prazo ou comparação; amplia escopo. |
| P13, adiar | Futuro espaço familiar | Meta cooperativa de atividade conjunta, sem somar Saldos. | [UNICEF, 2024][S2]; benefício específico [NV] | Grande | Alto; pode virar cobrança entre irmãos. | Conflita se houver ranking, Saldo compartilhado ou punição coletiva. |
| P14, não recomendar na v1 | Nenhum arquivo por enquanto | Não adicionar níveis ou títulos de valor pessoal. | Revisões não isolam benefício neste contexto. [Hamari e colegas][S4] | Grande se implementado | Alto custo de regras, comparação e linguagem. | Ranking conflita; nível individual não é proibido, mas não se justifica agora. |

## 7. Especificação de animações pronta para implementação

### Convenções comuns

Todos os números desta seção são propostas iniciais. `duration` do Motion recebe segundos; o documento apresenta milissegundos. As molas usam `mass: 1`. Não combinar `stiffness` e `damping` com `duration` ou `bounce` esperando que todos controlem o mesmo efeito: Motion dá precedência aos parâmetros físicos. Portanto, as durações das molas abaixo são alvos perceptivos aproximados, não garantias de término. Usar eventos de conclusão ou a linha do tempo explícita onde o sincronismo importa. [V: Motion, s.d., consulta 2026][S52].

| Uso | Parâmetros propostos | Meta visual aproximada |
| --- | --- | --- |
| Soltar bloco | `type: 'spring', stiffness: 520, damping: 34, mass: 1` | Assentar em cerca de 200 a 280 ms |
| Abrir ou fechar cartão | `type: 'spring', stiffness: 420, damping: 38, mass: 1` | Parte principal em cerca de 280 a 360 ms, pouco excesso |
| Carimbar selo | `type: 'spring', stiffness: 650, damping: 32, mass: 1` | Parte principal em cerca de 180 a 260 ms |
| Ícone de marco maior | `type: 'spring', stiffness: 300, damping: 26, mass: 1` | Parte principal em cerca de 320 a 440 ms |
| Opacidade | `type: 'tween', duration: 0.12, ease: 'linear'` | 120 ms exatos |
| Progresso | `type: 'tween', duration: 0.25, ease: [0.2, 0, 0, 1]` | 250 ms exatos, sem oscilação |
| Voo | `type: 'tween', duration: 0.36, ease: [0.2, 0, 0, 1]` | 360 ms exatos |

Regras comuns propostas:

1. Confirmar o estado pelo servidor antes de celebrar. A pressão responde imediatamente, sem anunciar sucesso antecipado.
2. Separar atualização dos dados de animação. Cancelar efeitos nunca cancela uma Conclusão aceita nem mantém um Saldo artificialmente retido. Se a operação não retorna o Saldo, atualizar a consulta do Perfil e usar a resposta autoritativa. Não somar Pontos ao último valor local como se não existissem Ajustes ou Resgates concorrentes.
3. Cada ocasião tem identidade estável. Re-render, retorno de consulta ou adição de texto não repetem som nem partículas.
4. A ocasião de maior importância absorve os efeitos menores da mesma ação. Ordem visual: Resgate confirmado, dia completo, Rotina, Tarefa. Eventos independentes não são descartados; os detalhes entram em resumo.
5. Nenhum efeito decorativo bloqueia navegação. Continuar fica disponível após ignorar o gesto que abriu a tela, por até 200 ms. Não exigir assistir à animação.
6. Manter dois toques e a armação atual do Cartão da tarefa na primeira implementação. Seu intervalo é proteção de interação, não parte da mola. Só recalibrar os 450 ms com teste de toques reais. A proteção de até 200 ms nas comemorações abaixo tem outra finalidade, impedir que o gesto de abertura também feche a comemoração.
7. Ao sair, cancelar temporizadores, animações imperativas, fala, fontes de áudio e canvas. Ao voltar, apresentar estado final sem repetir efeitos antigos.
8. Se uma Aprovação remota chegar durante a leitura de um cartão, atualizar os dados e adiar a apresentação da comemoração até o fechamento desse cartão. Não interromper fala nem roubar foco. Não criar notificação, prazo ou contador para esse adiamento.

### A1. Pressionar bloco e abrir o Cartão da tarefa

- **Gatilho:** `pointerdown` dá retorno de pressão; `click` abre o cartão. Rolar e cancelar o ponteiro não abre nem confirma.
- **Sequência:** 0 a 60 ms, bloco vai de `scale: 1` a `0.96`; ao soltar, usa a mola de bloco. Na abertura, o contorno e o ícone compartilham origem com o bloco. O conteúdo entra com opacidade de 120 ms, iniciada após 60 ms.
- **Mola:** cartão `420/38/1`; não deformar título, Passos ou área de toque. Manter alvo visual de 280 a 360 ms.
- **Partículas:** zero.
- **Som:** `open` baixo, uma vez. Omitir quando a leitura começa.
- **Reduzido:** cartão aparece no lugar com opacidade de até 100 ms. Sem deslocamento, expansão, pressão ou rotação. Armação continua igual.
- **Fechar:** inverter a correspondência com o bloco, alvo de até 280 ms; reduzir para opacidade de 100 ms no modo reduzido. Cancelar fala no início do fechamento.

### A2. Confirmar Tarefa sem Aprovação

- **Gatilho:** sucesso de `complete_task` com estado aprovado. Enquanto espera a rede, manter botão ocupado e cartão estável, sem confete ou contagem falsa.
- **Sequência desde a resposta:** atualizar o bloco confirmado e solicitar atualização do Saldo ao servidor. Fechar cartão. Ao terminar o fechamento, carimbar selo de `scale: 1.25, rotate: -8` para `1, -8`, com mola `650/32/1`. Emitir oito estrelas uma vez. Iniciar chip único `+N` junto do carimbo, não depois dele.
- **Voo:** 360 ms. Origem é centro do bloco; destino é Saldo medido no início da ocasião. Ponto intermediário fica no máximo 20 px acima do menor Y, limitado à área visível. Escala de `0.9` para `1`, depois `0.8`. Sem ultrapassar o Saldo nem encobrir o nome.
- **Saldo:** exibir e anunciar o valor autoritativo assim que a consulta responder, sem esperar o voo. Até essa resposta, conservar o último Saldo conhecido sem inventar um total. O chip explica os Pontos da Conclusão confirmada. Na chegada, pulso visual de `1 → 1.06 → 1` em 160 ms. Se houver interpolação numérica após obter o valor, limitar a 250 ms e permitir interrompê-la diretamente no valor final. Não manter `heldBalance` apenas para sincronizar a animação.
- **Partículas:** `particleCount: 8`, `shapes: ['star']`, `spread: 45`, `startVelocity: 10`, `gravity: 0.9`, `decay: 0.9`, `ticks: 40`, `scalar: 0.65`. Recortar visualmente à região do bloco ou usar camada abaixo dos textos. Em canvas recortado, calcular a origem relativa ao retângulo desse canvas, sem reutilizar a normalização pela janela de `fx.ts`. `ticks` são passos de simulação, não milissegundos; impor limpeza por relógio ao fim da ocasião.
- **Som e háptica:** um `done` com ganho inicial 0,25, no carimbo. Camada `points` em 0,08 é opcional. Vibração de 15 ms, somente se habilitada e suportada.
- **Reduzido:** fechar com opacidade de 100 ms, selo estático, Saldo final sem interpolação assim que confirmado pela consulta e mensagem "Feito. +N pontos". Zero partículas, voo, pulso e contagem. Som continua condicionado à opção de sons.
- **Limite:** encerrar decoração até 750 ms após resposta. Manter proteção contra duplo envio e cauda de toque, sem usar presença do chip como bloqueio global.

### A3. Confirmar Tarefa com Aprovação

- **Gatilho:** sucesso da operação com estado pendente.
- **Sequência:** fechar cartão e mostrar selo de ampulheta estática com opacidade em 120 ms. Mostrar "Esperando o responsável". Contagem de informadas muda; contagem de aprovadas e Saldo não mudam.
- **Mola:** nenhuma; não há necessidade de salto nesse estado.
- **Partículas:** zero.
- **Som e háptica:** `pending` em 0,15, uma vez. Sem háptica adicional na espera.
- **Reduzido:** troca imediata ou opacidade de 100 ms. Mesma informação.

### A4. Receber Aprovação

- **Gatilho:** entrada de Aprovação ainda não reconhecida para o Filho atual, com o app visível. Na reabertura, apresentar resumo reconhecível.
- **Sequência:** coletar eventos por uma janela de 150 ms para formar um resumo. Consultar o estado final do dia; não promover uma festa menor a outra festa 900 ms depois. Uma Aprovação usa selo de A2. Várias usam mensagem "O responsável aprovou X tarefas. +N pontos".
- **Mola e duração:** selo `650/32/1`, sem tela cheia para cada entrada. Mensagem entra por opacidade de 120 ms e permanece acessível até leitura ou encerramento. Se completar o dia, usar somente A6.
- **Partículas:** oito estrelas no total, não oito por entrada. Em resumo de reabertura, zero por padrão.
- **Som e háptica:** um sinal curto se a sessão já permite som; zero háptica remota. Não aguardar áudio para mostrar os dados.
- **Reduzido:** resumo estático com Saldo final e anúncio único. Sem voo nem selo em escala.

### A5. Completar Rotina, opção posterior

- **Gatilho:** transição de incompleta para completa de uma Rotina identificável na interface. Não inventar agrupamento apenas para criar celebração.
- **Sequência:** texto inline "Rotina concluída" com selo pequeno. Entrada em 120 ms e assentamento de até 350 ms com mola `300/26/1` no selo.
- **Partículas, som e háptica:** zero. Não adicionar bônus.
- **Reduzido:** selo e texto estáticos.
- **Conflito de ocasiões:** se a mesma Conclusão fecha o dia, só A6. Se a v1 não mostra Rotinas na área do Filho, não implementar A5.

### A6. Completar o dia

- **Gatilho:** transição observada de pelo menos uma Tarefa não aprovada para todas aprovadas no mesmo dia do servidor. Zero Tarefas não é dia completo. Não reemitir ao abrir um dia já completo. Guardar reconhecimento por Filho e dia para evitar nova festa após mera remonta.
- **Sequência:** se vier da última Tarefa, aguardar somente o fechamento do cartão e entrar em tela cheia com opacidade de 120 ms. Ícone vai de `scale: 0.9` a `1`, rotação de `-4` a `0`, com mola `300/26/1`. Título e botão permanecem estáveis. Mensagem "Você fez todas as tarefas de hoje". Se houver Pendências, não afirmar que o Responsável já aprovou tudo.
- **Partículas:** duas rajadas de 16, simultâneas, nas laterais. `shapes: ['star', 'circle']`, `spread: 45`, `startVelocity: 18`, `gravity: 1`, `decay: 0.9`, `ticks: 55`, `scalar: 0.75`, ângulos 60 e 120, origem em Y 0,70. Canvas atrás do conteúdo da comemoração. Limpar em 1.200 ms ou antes se fechar.
- **Som e háptica:** uma vinheta `day`, até 1.200 ms, ganho inicial 0,25. Suprime `done` e `points` da mesma ocasião. Vibração opcional `[20, 40, 20]` quando a ocasião decorre da interação do Filho. Se vier de Aprovação remota, não vibrar.
- **Encerrar:** botão visível e funcional, além de Escape e retorno de foco. Um novo toque pode encerrar após 200 ms de proteção contra a cauda do gesto anterior. Movimento termina sozinho; mensagem não desaparece sozinha.
- **Reduzido:** mesma tela estática, sem escala, rotação ou confete. Opacidade de até 100 ms e vinheta somente se sons estiverem habilitados. Botão disponível nas mesmas condições.

### A7. Pedir e confirmar Resgate

- **Pedido:** manter cartão e dois toques. Depois de `request_redemption`, mostrar ampulheta estática e "Pedido enviado. Um responsável vai confirmar". Opacidade de 120 ms, zero partículas, `pending` em 0,15. Sem anúncio de débito ou Recompensa entregue.
- **Confirmação:** requer observar o estado confirmado por consulta ou evento confiável, algo ainda ausente do caminho audiovisual lido. Identificar o Resgate para não repetir na próxima consulta. Mostrar Recompensa, custo confirmado e Saldo resultante. Não interpretar apenas o desaparecimento de Pendências como confirmação, pois pode ser recusa.
- **Sequência da confirmação:** opacidade de 120 ms; figura de `scale: 0.92` para `1` com mola `300/26/1`; pequeno brilho de opacidade única, sem pulsação repetida. Fundo e Saldo não tremem.
- **Partículas:** 40 círculos e estrelas em uma rajada local. `spread: 60`, `startVelocity: 16`, `gravity: 0.9`, `decay: 0.9`, `ticks: 55`, `scalar: 0.7`. Limpar em 1.100 ms ou ao fechar. Não usar figura que pareça moeda caindo no Saldo, pois houve débito.
- **Som e háptica:** `reward` ou edição de até 900 ms, ganho inicial 0,25. Háptica opcional `[20, 40, 20]` apenas no contexto ativo de interação, sem vibrar em evento remoto inesperado.
- **Reduzido:** confirmação estática com custo e Saldo final, zero partículas e transformações. Mensagem permanece legível.
- **Recusa:** mensagem neutra "O responsável não confirmou este pedido". Sem animação de perda, som triste ou retirada de Pontos que não foram debitados.

### Critérios de aceitação para uma implementação futura

1. Concluir uma Tarefa com movimento e sons desligados produz a mesma informação final e nenhuma decoração móvel.
2. Fechar uma festa, trocar de aba ou Perfil não deixa partículas, fala, sons ou disparos atrasados.
3. Aprovar várias Tarefas e completar o dia produz uma única vinheta e um único orçamento de partículas.
4. Tocar repetidamente no bloco ou em "Fiz!" não marca antes do segundo gesto intencional e não cria efeitos de ganho duplicados.
5. Rolagem com muitas Tarefas não altera a origem do cartão ou do chip.
6. Uma Aprovação remota não rouba foco de um cartão que o Filho está lendo.
7. Pedir, recusar e confirmar Resgate têm mensagens diferentes, sem confundir débito ou entrega.
8. Retornar de bloqueio de tela ou interrupção de áudio permite novo som após gesto, ou segue silenciosamente sem erro.
9. Um lote grande de Aprovações cabe com texto ampliado, teclado e botão de continuar sempre alcançável.
10. Mudar a preferência de movimento do aparelho ou do Perfil interrompe a decoração em curso e deixa o estado final correto.

Esses ensaios ficam para a fase de implementação. Não foram executados nesta pesquisa por orientação de não rodar app ou banco.

## 8. Decisões que só a família pode tomar

| Decisão | Recomendação para começar | O que observar na família |
| --- | --- | --- |
| Quanto som cada Filho quer ouvir? | Começar baixo, demonstrar ligado e desligado e respeitar a preferência do Filho. Sem música contínua. | Se ele se assusta, pede silêncio ou prefere apenas a leitura. Não deduzir isso da idade ou de diagnóstico. |
| O Filho quer menos animação? | Apresentar a opção de forma neutra e deixar o Responsável ajustá-la com ele. | Se olha para o efeito ou consegue continuar a Tarefa sem se distrair ou esperar pelo show. |
| O que conta como reconhecimento enquanto espera Aprovação? | Mostrar que informou a Conclusão e explicar que o Responsável confere os Pontos. | Se entende que não perdeu o que fez e que Pendência não é erro. |
| Quais Tarefas exigem Aprovação? | Manter a regra por Tarefa e explicar quando ocorrerá a conferência, em conversa. | Se a espera gera cobrança ou insegurança. O app não deve inventar prazo ou lembrete. |
| Qual Recompensa o Filho quer escolher como objetivo? | Uma favorita opcional, sem prazo e com liberdade para mudar. | Se entende custo e Saldo e continua podendo gostar de outras Recompensas. |
| Quais Recompensas são aceitáveis e viáveis? | Preferir opções que a família consegue cumprir e combinar a disponibilidade antes. | Se Resgate confirmado é seguido da experiência combinada. Afeto, segurança e necessidades básicas não devem depender de Pontos. Esta é recomendação de produto, a articular com a pesquisa de psicologia. |
| Como adequar o tom entre 4 e 12 anos? | Conservar o mesmo fluxo; ajustar nomes, Explicações, avatar e intensidade conforme preferência. | Se o Filho mais velho considera o quadro infantil ou se o pré-leitor reconhece a ação na figura. Não criar dois apps antes de ouvir ambos. |
| Quem escolhe avatar e cor? | O Filho escolhe entre opções acessíveis, acompanhado pelo Responsável. | Se reconhece o próprio Perfil sem comparar os outros. Evitar trocar a identidade sem avisá-lo. |
| Vale experimentar coleções ou marcos? | Adiar até haver uma necessidade expressa pelos Filhos. Se testar, começar com um marco permanente, sem prêmio extra. | Se desperta prazer sem gerar pedidos compulsivos de novas Tarefas só para liberar conteúdo. |
| Vale uma meta conjunta? | Primeiro fazer uma atividade cooperativa fora do app, sem somar Saldos. | Se a cooperação acontece sem um irmão fiscalizar ou culpar o outro. Não exigir conclusão perfeita de todos. |
| Como avaliar se o app está ajudando? | Conversa curta após uma ou duas semanas, escolhida pela família, sem coleta automática adicional. | Compreensão do quadro, menos conflitos e facilidade de encerrar. Tempo de tela e frequência de abertura não são metas de sucesso. |

As recomendações desta seção não substituem a escolha familiar nem produzem orientações clínicas. Não alteram as regras já decididas de ausência de sequências, contagem regressiva, sorteios, mascote, comparação ou notificações.

## 9. Fontes e grau de verificação

### Pesquisa e direitos da criança

- **S1. UNICEF Innocenti, 2024. [Responsible Innovation in Technology for Children][S1]. [V] página oficial do relatório e descrição do estudo. [NV] leitura integral do PDF da fase dois; a ferramenta recusou o tamanho de 15.911.910 bytes. Não atribuí à leitura integral conclusões específicas.
- **S2. UNICEF, 2024. [RITEC Design Toolbox][S2]. [V] página, dimensões e orientação de uso. Sem auditoria completa de todos os materiais anexos.
- **S3. Deterding, Dixon, Khaled e Nacke, 2011. [From Game Design Elements to Gamefulness][S3]. [V] artigo original em cópia pública. O endereço da ACM retornou 403; a cópia do artigo foi aberta.
- **S4. Hamari, Koivisto e Sarsa, 2014. [Does Gamification Work?][S4]. [V] texto do artigo original em cópia pública.
- **S5. Sailer e Homner, 2020, publicado online em 2019. [The Gamification of Learning: a Meta-analysis][S5]. [V] resumo, métodos e análises de rigor no texto aberto da editora.
- **S6. Alkinoos-Ioannis Zourmpakis, 2026. [Adaptive Gamification and Game-Based Learning in Preschool and Early Primary Education][S6]. [V] revisão aberta, escopo, amostra de estudos e limitações.
- **S7. Manar S. Alotaibi, 2024. [Game-based learning in early childhood education][S7]. [V] artigo aberto. Não trato aprendizagem baseada em jogos como equivalente à gamificação de Tarefas.
- **S8. 5Rights Foundation, abril de 2023. [Disrupted Childhood: The cost of persuasive design][S8]. [V] PDF, capítulos sobre estratégias persuasivas e exemplos de sequências e escassez. O caminho de hospedagem inclui 2024, mas a edição identifica abril de 2023.
- **S9. ICO, 2020, versão do PDF de 17/10/2022. [Age appropriate design: a code of practice for online services][S9]. [V] padrões 5 e 13 no PDF. A página HTML apresentou timeouts em releituras; a análise usa o PDF oficial.

### Design, movimento e acessibilidade

- **S10. Apple, s.d., consulta 2026. [Human Interface Guidelines: Motion][S10]. [V] versão Markdown oficial, inclusive brevidade e cancelamento.
- **S11. Apple, s.d., consulta 2026. [App Review Guidelines][S11]. [V] seções 1.3 e 5.1.4. Referência de loja, sem parecer de conformidade.
- **S12. Google Play, s.d., consulta 2026. [Families Policies][S12]. [V] requisitos e práticas de monetização proibidas.
- **S13. John Lasseter, 1987. [Principles of Traditional Animation Applied to 3D Computer Animation][S13]. [V] artigo original em cópia universitária pública.
- **S14. Adobe, s.d., consulta 2026. [12 principles of animation][S14]. [V] guia profissional. Fonte didática, não artigo experimental nem leitura do livro de Thomas e Johnston.
- **S15. Google Material Components, s.d., consulta 2026. [Motion theming][S15]. [V] documentação oficial e escala de durações. A página antiga do Material 2 retornou apenas aviso de JavaScript; não a usei para os valores.
- **S16. W3C, WCAG 2.2, 2023, explicação viva consultada em 2026. [2.3.3 Animation from Interactions][S16]. [V] escopo e nível AAA.
- **S17. W3C, WCAG 2.2, 2023, explicação viva consultada em 2026. [2.2.2 Pause, Stop, Hide][S17]. [V] três condições e distinção de atualização automática.
- **S18. W3C, WCAG 2.2, 2023. [2.3.1 Three Flashes or Below Threshold][S18]. [V] explicação e critério.
- **S19. W3C WAI, 2021. [Limit Interruptions][S19]. [V] orientação cognitiva suplementar, não critério normativo de WCAG.
- **S39. W3C, 2021. [Making Content Usable for People with Cognitive and Learning Disabilities][S39]. [V] guia e diferenças individuais. Não é protocolo clínico.
- **S40. Motion, s.d., consulta 2026. [Accessible animations][S40]. [V] alcance de MotionConfig e hook. Conferi também o hook no pacote instalado.
- **S41. W3C WAI, s.d., consulta 2026. [Modal dialog pattern][S41]. [V] teclado, foco e encerramento.
- **S49. Motion, s.d., consulta 2026. [Layout animations][S49]. [V] medição, rolagem, contêiner fixo e transformação.
- **S50. W3C, WCAG 2.2, 2023. [1.4.3 Contrast Minimum][S50]. [V] limiares de contraste e definição de texto grande.
- **S51. canvas-confetti, s.d., consulta 2026. [Documentação oficial][S51]. [V] worker, instância, redução de movimento e reset. Valores do export padrão conferidos no código instalado, sem inferi-los do padrão de `create`.
- **S52. Motion, s.d., consulta 2026. [Transitions][S52]. [V] molas físicas, duração, precedência e keyframes.

### Produtos do benchmark

- **S20. Duolingo, s.d., consulta 2026. [Duolingo ABC na App Store][S20]. [V] descrição do fornecedor. Não usei avaliações como prova das mecânicas.
- **S21. Duolingo, 2023. [The Duolingo Method for App-based Teaching and Learning][S21]. [V] documento do fornecedor, distinção entre apps na seção de hábito. Atualidade de todas as mecânicas em 2026 [NV].
- **S22. Khan Academy, s.d., consulta 2026. [Parent and Home Account Users: Getting Started][S22]. [V] coleções, progresso, músicas e controles.
- **S23. Khan Academy, s.d., consulta 2026. [Khan Academy Kids][S23]. [V] caminho, exploração e narração.
- **S24. Toca Boca, s.d., consulta 2026. [New player or just came back?][S24]. [V] criação de personagens e decoração.
- **S25. Toca Boca, s.d., consulta 2026. [How can I claim my free weekly gift?][S25]. [V] periodicidade e prazo de uma semana.
- **S26. Sago Mini, s.d., consulta 2026. [Sago Mini World][S26]. [V] proposta de brincadeira, ausência declarada de Pontos e tempo, arte e música.
- **S27. PBS, s.d., consulta 2026. [PBS KIDS Games na App Store][S27]. [V] descrição oficial. Página antiga de apps da PBS retornou 404.
- **S28. Lingokids, 02/10/2026. [How does the reward system work?][S28]. [V] regras de estrelas, adesivos, reinício diário e animação de conclusão.
- **S29. Headspace, 06/10/2021. [Meditation for kids][S29]. [V] descrição de conteúdos. Não usei as alegações terapêuticas para justificar o Todo Kids.
- **S30. Joon, s.d., consulta 2026. [Site oficial][S30]. [V] animal, Tarefas, evolução e lembretes. Estudos e porcentagens publicitárias não foram auditados.
- **S31. Greenlight, s.d., consulta 2026. [Pay per chore and split earnings][S31]. [V] funcionamento publicado na ajuda.
- **S32. Greenlight, s.d., consulta 2026. [Are chores and allowances connected?][S32]. [V] alternativas de vínculo e lembrete.
- **S33. BusyKid, s.d., consulta 2026. [Site oficial][S33]. [V] ganhos e categorias, não efeitos em uso.
- **S34. Homey, s.d., consulta 2026. [Site oficial][S34]. [V] descrição de recursos, sem aceitar como prova as previsões financeiras do marketing.
- **S35. S'moresUp, s.d., consulta 2026. [Site oficial][S35]. [V] proposta e Tarefas. Depoimentos não são evidência de eficácia.
- **S36. S'moresUp, s.d., consulta 2026. [Descrição na App Store][S36]. [V] descrição do fornecedor, Pontos S'mores, recompensas da família e recursos de aprovação. Não usei avaliações de clientes como prova.
- **S37. OurHome. [Domínio oficial consultado][S37]. [NV] conteúdo e disponibilidade; timeout.

### Áudio e plataforma

- **S42. Apple, s.d., consulta 2026. [Playing audio][S42]. [V] versão Markdown oficial, silêncio e mistura.
- **S43. Apple, s.d., consulta 2026. [Playing haptics][S43]. [V] versão Markdown oficial, consistência, brevidade e controle.
- **S44. François Beaufort, Google, 2018, página viva consultada em 2026. [Autoplay policy in Chrome][S44]. [V] política e Web Audio.
- **S45. MDN, s.d., consulta 2026. [BaseAudioContext.state][S45]. [V] estados e retorno de interrupção no iOS Safari.
- **S46. W3C, 21/05/2026. [Vibration API][S46]. [V] estado de implementação, Chromium e posição do WebKit. É um Candidate Recommendation Draft, não uma recomendação final.
- **S47. MDN, s.d., consulta 2026. [Navigator.vibrate][S47]. [V] limites e dependência do aparelho e do modo de silêncio.
- **S48. MDN, s.d., consulta 2026. [SpeechSynthesisVoice.localService][S48]. [V] distinção entre voz local e remota.

## 10. Verificações executadas e lacunas

Executei lint, typecheck e os testes que só leem arquivos ou exercitam funções locais, sem iniciar app ou banco. Saída dos comandos, omitindo apenas o resumo de duração do runner:

```text
$ mise exec -- npm run lint
> lint
> eslint .

$ mise exec -- npm run typecheck
> typecheck
> tsc -p tsconfig.json && tsc -p tsconfig.app.json

$ mise exec -- npm run test -- src/lib/parse.test.ts tests/db/error-keys.test.ts
> test
> vitest run src/lib/parse.test.ts tests/db/error-keys.test.ts

 RUN  v5.1.0 /home/marceloavf/Projects/todo-kids

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

Lint e typecheck terminaram sem diagnósticos. Os quatro testes locais passaram. A suíte completa de banco e os testes Playwright não foram executados para cumprir a orientação de não rodar app ou banco. Esses resultados verificam o estado compartilhado do repositório naquele momento, não o comportamento audiovisual proposto. Também conferi referências Markdown, definições de fontes, colunas das tabelas e os números do inventário local. Não há mudanças de código ou commit nesta pesquisa.

Permanecem [NV]: fluidez e consumo em celular fraco; iPhone e Android reais; retorno do áudio após interrupção neste app; volume, timbre e mistura dos WAV por audição; síntese pt-BR em cada aparelho; mudança de preferência do sistema durante a sessão; comportamento audiovisual dos produtos do benchmark; disponibilidade do OurHome; benefício duradouro das novas mecânicas em Tarefas domésticas; e todos os parâmetros propostos em ms, molas, partículas, ganho e vibração. Nenhuma recomendação pretende apresentar esses parâmetros como resultado de pesquisa clínica.

[S1]: https://www.unicef.org/innocenti/reports/responsible-innovation-technology-children
[S2]: https://www.unicef.org/childrightsandbusiness/workstreams/responsible-technology/online-gaming/ritec-design-toolbox
[S3]: https://creativegames.org.uk/modules/Gamification/Deterding_Dixon%20etal_Gamification-2011.pdf
[S4]: https://www.lescahiersdelinnovation.com/wp-content/uploads/2019/06/2014-hamari_et_al-does_gamification_work.pdf
[S5]: https://link.springer.com/article/10.1007/s10648-019-09498-w
[S6]: https://www.mdpi.com/2073-431X/15/7/464
[S7]: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1307881/full
[S8]: https://5rightsfoundation.com/wp-content/uploads/2024/08/5rights_DisruptedChildhood_G.pdf
[S9]: https://ico.org.uk/media/for-organisations/guide-to-data-protection/ico-codes-of-practice/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf
[S10]: https://developer.apple.com/design/human-interface-guidelines/motion.md
[S11]: https://developer.apple.com/app-store/review/guidelines/
[S12]: https://support.google.com/googleplay/android-developer/answer/9893335?hl=en
[S13]: https://users.cs.northwestern.edu/~animation/Lasseter_1987.pdf
[S14]: https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html
[S15]: https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
[S16]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
[S17]: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
[S18]: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
[S19]: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p01-minimal-interruptions/
[S20]: https://apps.apple.com/us/app/learn-to-read-duolingo-abc/id1440502568
[S21]: https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_duolingo_method_2023.pdf
[S22]: https://khankids.zendesk.com/hc/en-us/articles/360006764812-Parent-and-Home-Account-Users-Getting-Started-and-creating-an-account-with-Khan-Academy-Kids
[S23]: https://www.khanacademy.org/kids
[S24]: https://tocaboca.helpshift.com/hc/en/3-toca-boca-world/faq/414-new-player-or-just-came-back-start-here/
[S25]: https://tocaboca.helpshift.com/hc/en/3-toca-boca-world/faq/4-how-can-i-claim-my-free-weekly-gift-in-toca-boca-world/
[S26]: https://sagomini.com/world/
[S27]: https://apps.apple.com/us/app/pbs-kids-games/id1050773989
[S28]: https://help.lingokids.com/hc/en-us/articles/18393545177874-How-does-the-reward-system-work
[S29]: https://www.headspace.com/meditation/kids
[S30]: https://www.joonapp.io/
[S31]: https://help.greenlight.com/hc/en-us/articles/50527840580379-How-do-I-pay-my-child-per-chore-and-split-the-earnings
[S32]: https://help.greenlight.com/hc/en-us/articles/360023614373-Are-chores-and-allowances-connected
[S33]: https://busykid.com/
[S34]: https://www.homeyapp.net/
[S35]: https://smoresup.com/
[S36]: https://apps.apple.com/us/app/smoresup-best-chores-app/id1287367596
[S37]: https://ourhomeapp.com/
[S39]: https://www.w3.org/TR/coga-usable/
[S40]: https://motion.dev/docs/react-accessibility
[S41]: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
[S42]: https://developer.apple.com/design/human-interface-guidelines/playing-audio.md
[S43]: https://developer.apple.com/design/human-interface-guidelines/playing-haptics.md
[S44]: https://developer.chrome.com/blog/autoplay/
[S45]: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state
[S46]: https://www.w3.org/TR/vibration/
[S47]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
[S48]: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
[S49]: https://motion.dev/docs/react-layout-animations
[S50]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
[S51]: https://github.com/catdad/canvas-confetti
[S52]: https://motion.dev/docs/react-transitions
