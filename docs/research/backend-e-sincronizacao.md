# Backend e sincronização do Todo Kids: auth, banco, tempo real e hospedagem

Pesquisa feita em 2026-11-15. Marcação: **[V]** = li a fonte primária nesta data; **[NV]** = não verificado (memória, fonte secundária ou página que não renderizou). Números de GitHub vêm de `gh api`; `[Fn]` aponta para a lista de fontes no fim. Frases sem marcador (por exemplo a coluna "por que não entra") são avaliação minha, não fato de fonte.

## Resumo

1. **Recomendação: Supabase (nuvem, plano Free)**: é o único candidato sério que cumpre todas as restrições *e* a preferência por open source (Apache-2.0/MIT), com regra do livro-razão no próprio banco (`CHECK`, transações, RLS por família) e saída fácil (é Postgres). Preço: pausa com 7 dias de pouca atividade e mais código (SQL + PL/pgSQL).
2. **Segundo lugar, e a escolha vira se a licença FSL for aceitável: Convex**: menos código (tudo TypeScript, tempo real automático), nenhuma pausa por inatividade encontrada e self-hosting em 2 contêineres. Mas o backend **não é open source** (FSL, código-fonte disponível), apesar de o Convex se descrever assim.
3. **Descartados para a v1**: InstantDB (nuvem fecha em 2027-08-31), Appwrite (Free pausa sem atividade *no Console* por 7 dias), Firebase (sem Functions no plano gratuito), PocketBase (sem nuvem gratuita; só vale se self-hosting for obrigatório).

## Achados que mudaram o quadro (todos de 2026)

- **InstantDB**: a equipe foi para a OpenAI; cadastros fechados, apps na nuvem desligam em 2027-08-31. Só resta self-hosting (guia fala em VPS a partir de ~US$ 30/mês). [V] [F1][F2]
- **PocketBase**: repositório do GitHub está arquivado; o último commit (2026-10-26) só acrescenta o aviso "The repo has moved to ganigeorgiev.com/pocketbase/pocketbase". Essa página não renderiza sem JavaScript e `git ls-remote` nela falhou, então não li o novo repositório [NV]. O site mostra v0.42.2; o GitHub parou em v0.40.6. [V] [F3][F4]
- **Appwrite**: desde 2026-02-20 projetos Free sem "development activity" no Console por 7 dias são pausados; desde 2026-06-29 projetos pausados por 90 dias são apagados. [V] [F5][F6]
- **ElectricSQL**: entrou na Neon/Databricks em 2026-08-11; o repositório agora é `neondatabase/electric`, descrito como "agent platform built on sync". [V] [F7][F8]
- **Supabase**: projeto pausado é restaurável por até 1 ano. [V] [F9]
- **Convex Auth**: a v2 é descrita como "current stable release". [V] [F10]

## Tabela comparativa (candidatos sérios)

| Critério | Convex | Supabase | PocketBase | Appwrite | Firebase (base fechada) | API mínima (Cloudflare Workers + D1) |
|---|---|---|---|---|---|---|
| 1. Licença | Backend FSL-1.1-Apache-2.0 (vira Apache após 2 anos; proíbe produto concorrente); cliente npm Apache-2.0 [V][F11][F12] | Apache-2.0 (repo principal), MIT (auth) [V][F13] | MIT [V][F3] | BSD-3-Clause [V][F14] | Backend fechado; SDK aberto [NV licença exata] | Seu código; plataforma fechada |
| 2. Plano gratuito | 1M chamadas de função, 0,5 GB banco, 1 GB arquivos, 1 GB egress, 40 deployments, 1 a 6 devs; "Free has hard resource caps". Nenhuma menção a pausa por inatividade nas páginas de preço, limites e pausa de deployment [V leitura][F15][F16][F65]; ausência de política [NV] | 2 projetos ativos, 500 MB banco, 50 mil MAU, 5 GB egress, 1 GB arquivos, 500 mil invocações de Edge Function. **Pausa em 7 dias de pouca atividade**; restaurável por 1 ano; Pro US$ 25/mês [V][F17][F9] | Não existe nuvem oficial ("self-hosted only") [V][F18] | Tabela de limites não renderizou [NV]. Pausa em 7 dias sem atividade no Console; apagado após 90 dias pausado; máx. 2 funções [V][F5][F6][F19] | Spark: Firestore 1 GiB, 50 mil leituras e 20 mil escritas por dia; **Cloud Functions e Cloud Storage exigem Blaze** [V][F20][F21][F22] | Workers 100 mil req/dia e 10 ms de CPU por chamada; D1 5M linhas lidas e 100 mil escritas por dia, 5 GB [V][F23][F24] |
| 3. Self-hosting Docker | 2 serviços (backend + dashboard), SQLite por padrão [V][F25] | 11 serviços no compose; mínimo 4 GB RAM, 2 núcleos [V][F26][F27] | 1 binário; sem imagem Docker oficial (Dockerfile de exemplo) [V][F28] | 45 serviços no compose; mínimo 4 GB RAM [V][F29][F30] | Impossível | Não se aplica (ou Miniflare local) |
| 4. Auth e-mail+senha | Convex Auth v2: "Email + Password" pronto, roda dentro do app [V][F10] | Nativo; refresh token não expira, sessão dura indefinidamente por padrão [V][F31] | Nativo (`authWithPassword`); API sem estado, token guardado no `authStore` do SDK [V][F32] | Nativo [NV] | Nativo [NV] | Você integra (ex.: Better Auth, MIT, 30,7 mil estrelas [V][F33]) |
| 5. Isolamento por família | Em código: cada função lê a identidade e filtra por `familyId`; não há RLS, cliente nunca acessa tabela direto [NV detalhe] | RLS declarativa (`family_id = auth.uid()`), também aplicada ao tempo real [V][F34] | API rules com `@request.auth.*` por coleção [V][F35] | Permissões por documento/Teams [NV] | Security Rules com `get()`/`exists()` [V][F36] | Em código, em toda rota |
| 6. Regras do livro-razão | Mutações são transações serializáveis (OCC); regra é um `if` em TypeScript [V][F37][F38] | Funções Postgres via `rpc()`, transações, `CHECK`, triggers [V][F39] | Hooks/rotas JS com `$app.runInTransaction` [V][F40][F41] | Transactions API ("commit them atomically") + Functions [V][F42] | No Spark só Security Rules (`getAfter()` em lotes); sem função de servidor [V][F36][F21] | Transações SQLite escritas à mão |
| 7. Tempo real | Automático: toda query é assinatura via WebSocket; 1.000 sessões simultâneas no Free [V][F43][F15] | Postgres Changes; 200 conexões de pico, 2M mensagens/mês [V][F17][F44] | SSE; assinatura respeita a ListRule [V][F45] | 250 conexões, 2M mensagens/mês (cobrança ativa desde 2026-04-30) [V][F46] | Listeners do Firestore [NV] | Você constrói (Durable Objects com WebSocket, disponíveis no Free só com SQLite) [V][F47] |
| 8. SDK TypeScript / React Native | `convex` 1.50.0 (2026-11-12), tipos ponta a ponta, guia React Native [V][F12][F10] | `supabase-js` 2.119.0 (2026-11-04), guia Expo RN [V][F48] | SDK JS 0.29.0 (2026-11-11): "Browser, Node.js, React Native" [V][F3] | `appwrite` 29.2.0 (2026-10-28) [V]; SDK RN [NV] | `firebase` 13.3.0 (2026-11-11) [V] | Sem SDK; `fetch` tipado por você |
| 9. Arquivos / push / offline | Arquivos nativos [V][F15]; push via action [NV]; sem offline nativo [NV] | Storage 1 GB [V][F17]; push via Edge Function [NV]; offline via PowerSync (guia oficial) [V][F49] | Arquivos locais ou S3 [V][F4]; push e offline por sua conta [NV] | Storage e Messaging nativos [NV] | Storage exige Blaze [V][F22]; FCM gratuito e offline nativo no Firestore [NV] | R2, Web Push e offline todos manuais |
| 10. Maturidade | 12.799 estrelas; builds quase diários; Series B de US$ 57M em 2026-08 (fonte secundária) [V números][F11][F50] | 115.051 estrelas; última tag v1.26.08 em 2026-08-07, `supabase-js` em 2026-11-04; Series F de US$ 500M em 2026-06 (fonte secundária) [V números][F13][F51] | 61.591 estrelas; pré-1.0; um mantenedor, "no promises for maintenance", não aceita doações [V][F3][F18] | 58.106 estrelas; 2.7.2 em 2026-11-12; quatro mudanças restritivas no Free/Realtime em 2026 [V][F14][F5][F6][F19][F46] | Google; SDK 5.161 estrelas [V] | Cloudflare (empresa aberta em bolsa) [NV] |

## Demais candidatos (uma linha cada)

| Opção | Estado (2026-11-15) | Por que não entra na v1 |
|---|---|---|
| InstantDB | 10.574 estrelas, Apache-2.0, npm 1.0.67 de 2026-08-31 [V][F52] | Nuvem encerra em 2027-08-31; self-hosting ~US$ 30/mês [V][F1][F2] |
| PowerSync | Serviço Apache-2.0 segundo o GitHub, 405 estrelas, v1.28.3 (2026-11-12); Free: 2 GB sincronizados, 50 clientes, "deactivated after 1 week of inactivity" [V][F53][F54] | Camada de sync sobre um Postgres que ainda precisa de auth e escrita próprias; resolve offline, que a v1 não tem |
| ElectricSQL | 10.428 estrelas, Apache-2.0, agora `neondatabase/electric` [V][F8] | Rumo do produto mudou após a aquisição [V][F7]; ainda exigiria Postgres, auth e caminho de escrita próprios [NV] |
| Zero (Rocicorp) | Apache-2.0, 3.442 estrelas, `@rocicorp/zero` 1.12.0 (2026-11-12), GA desde 2026-03; "Cloud Zero" ainda sem disponibilidade pública plena [V][F55][F56] | Exige Postgres + serviço zero-cache + auth externa; mais peças que o necessário |
| Triplit | AGPL-3.0, 3.121 estrelas; último npm em 2025-07-31, último push em 2026-01-19 [V][F57] | Parado |
| Jazz | MIT; repo novo `garden-co/jazz` (245 estrelas) só com `2.0.0-alpha.*`; o antigo é `classic-jazz` (2.536) [V][F58] | Só existe em alpha |
| RxDB | Apache-2.0, 23.430 estrelas, 17.6.0 (2026-10-05) [V][F59] | Biblioteca cliente; não traz backend, auth nem regra no servidor |
| TinyBase | MIT, 5.217 estrelas, v10.1.0 (2026-11-12) [V][F60] | Idem: store cliente com sync, sem autoridade no servidor |

Nota: `releases/latest` não serve para monorepos (rocicorp/mono devolve uma tag de 2023; Electric e Triplit devolvem pacotes), então usei as datas do npm.

## Ponto transversal: um login por família + PIN do responsável

Com uma sessão compartilhada, o servidor **não distingue criança de responsável pelo token**. "Débito só com confirmação do responsável" só é regra de servidor se o PIN for verificado no servidor. Desenho comum a todas as opções: conta de auth = família; `profiles` (responsável/criança) com `family_id`; hash do PIN em tabela ilegível pelo cliente; uma função `verificarPin` devolve um token curto de responsável (ou toda ação de responsável recebe o PIN); limite de tentativas no servidor, porque PIN de 4 dígitos é quebrável por força bruta.

- Convex: mutação TypeScript; o runtime expõe `crypto`/`SubtleCrypto` [V][F61].
- Supabase: função `security definer` chamada por `rpc()` [V][F39]; hash com `pgcrypto` [NV].
- PocketBase: rota custom (`routerAdd` + `$apis.requireAuth()`) dentro de transação [V][F41][F40].
- Firebase Spark: sem Functions não há onde verificar o PIN com segurança [V][F21]; contorno por Security Rules [NV].

## Candidatos sérios

### Supabase (recomendado)
- Postgres de verdade: `CHECK (saldo >= 0)`, chaves estrangeiras, RLS por `auth.uid()`; a regra vive no banco, não só em função [V][F34][F39].
- Custo real da pausa: "a few user requests to the database each day over the previous week" mantém o projeto vivo; uma semana de férias pode pausar e exige clique no painel para restaurar (até 1 ano) [V][F9]. Dev + produção consomem os 2 projetos gratuitos (projetos pausados não contam) [V][F64]; dev pode rodar local em Docker.
- Mitigação possível: uma requisição agendada diária (ex.: cron do GitHub Actions) [NV se basta].
- Mais código e duas linguagens: migrações SQL, funções PL/pgSQL, políticas RLS e merge manual dos eventos de tempo real. RLS mal configurada é o erro clássico.
- Self-hosting pesado (11 serviços, 4 GB RAM) [V][F26][F27].
- Offline futuro tem caminho documentado com PowerSync [V][F49].

### Convex (segundo; primeiro se FSL for aceitável)
- Menor quantidade de código: schema, queries, mutações e auth em TypeScript no mesmo repo; tempo real sem código extra [V][F43].
- Livro-razão: mutação lê o saldo, lança erro se faltar, grava o lançamento; tudo atômico e serializável [V][F37][F38]. Não existem constraints declarativas; a garantia vem de o cliente só escrever via mutação.
- Isolamento por família é disciplina de código [NV] (um wrapper único de função resolve). Esquecer o filtro em uma query vaza dados: é o principal ponto de revisão.
- Hospedagem do front: Convex não serve o site; docs indicam Vercel/Netlify [V][F62]. Cloudflare Pages Free aceita 20 mil arquivos por site [V][F63].
- Saída: self-hosting oficial com o mesmo código [V][F25]; exportação de dados [NV formato].
- Offline futuro: sem caminho nativo; seria retrabalho [NV].
- Licença: FSL permite uso e self-hosting, mas veda produto concorrente à Convex Cloud e não é aprovada pela OSI; cada versão vira Apache-2.0 após 2 anos [V][F11].

### PocketBase
- O mais simples de operar (1 binário, SQLite, painel admin), MIT [V][F4].
- Sem nuvem: custo zero depende de VM gratuita. O próprio FAQ sugere Google Cloud e2-micro (1 GB RAM) e Oracle Always Free, este com relatos de contas apagadas [V][F18]. Você cuida de TLS, backup e atualização.
- Sinais de risco: mantenedor único, saída do GitHub, pré-1.0 sem garantia de compatibilidade, e o FAQ diz: se pretende "solely rely on some AI tool, then please do NOT use PocketBase" [V][F3][F18]. Hooks JS rodam em VM embutida, não em Node [V][F3].

### Appwrite
- Completo (auth, banco, storage, functions, messaging, sites), BSD-3 [V][F14].
- Inviável a custo zero para app em uso contínuo: só atividade de desenvolvimento no Console evita a pausa [V][F5]; que tráfego de API não conta foi dito por equipe em fórum [NV]. Changelog: "Projects that require continuous availability should be on a paid plan" [V][F5].
- Self-hosting: 45 serviços [V][F29].

### Firebase (linha de base fechada)
- Free generoso e sem pausa documentada, offline nativo, FCM gratuito [NV os três].
- Sem Functions e sem Storage no Spark [V][F21][F22]: livro-razão só por Security Rules e PIN sem verificação segura. Fechado e sem self-hosting.

### API mínima própria (Cloudflare Workers + D1 + Durable Objects)
- Custo zero com limites folgados para uma família [V][F23][F24][F47], mas você escreve auth, API, autorização e tempo real: é a opção com mais código.
- Risco: 10 ms de CPU por chamada no Free [V][F23] pode não comportar hash de senha [NV].
- Só compensa se a meta for não depender de nenhum BaaS.

## Questões em aberto (não consegui verificar)

- Convex: ausência de pausa/remoção por inatividade no Free é inferida do silêncio das páginas de preço, limites e pausa (a única menção a "idle" é isenção de taxa para deployments sem chamadas há 30 dias); não achei afirmação explícita. Comportamento exato ao atingir o teto do Free também não está descrito.
- Convex Auth: onde o token fica no navegador e a duração padrão da sessão.
- Supabase: se tarefas internas (`pg_cron`) contam como "user database activity" para evitar a pausa.
- Appwrite: limites numéricos atuais do Free (a tabela do site é renderizada por JavaScript).
- PocketBase: motivo declarado da saída do GitHub (o commit só traz o aviso) e se o SDK JS segue no GitHub a longo prazo.
- Rodadas de investimento de Supabase e Convex vêm de imprensa, não de comunicado primário lido por mim.
- Mudanças de licença recentes: nenhuma encontrada, mas não auditei históricos de `LICENSE`.
- Web Push em app instalado no iOS e consumo real de mensagens de tempo real não foram testados.

## Fontes

- [F1] Anúncio e encerramento da Instant Cloud: https://www.instantdb.com/pricing
- [F2] Guia de self-hosting da Instant (~US$ 30/mês): https://www.instantdb.com/docs/self-hosting
- [F3] PocketBase no GitHub (arquivado, aviso de mudança, MIT, SDKs, aviso pré-1.0): https://github.com/pocketbase/pocketbase
- [F4] Site do PocketBase (v0.42.2, recursos): https://pocketbase.io/
- [F5] Appwrite, pausa automática no Free (2026-02-20): https://appwrite.io/changelog/entry/2026-02-20-1
- [F6] Appwrite, projetos pausados apagados após 90 dias (2026-06-29): https://appwrite.io/changelog/entry/2026-06-29
- [F7] Electric entra na Databricks/Neon: https://electric.ax/blog/2026/08/11/electric-joining-databricks
- [F8] Repositório Electric: https://github.com/neondatabase/electric
- [F9] Supabase, pausa de projetos (critério de atividade, restauração por 1 ano): https://supabase.com/docs/guides/platform/project-pausing
- [F10] Convex Auth (v2 estável, e-mail + senha, React Native): https://docs.convex.dev/auth/convex-auth
- [F11] Convex backend (estrelas, licença FSL): https://github.com/convex/convex-backend e https://docs.convex.dev/self-hosting
- [F12] Pacote `convex` no npm (versão, Apache-2.0): https://www.npmjs.com/package/convex
- [F13] Supabase no GitHub (estrelas, licença, releases): https://github.com/supabase/supabase e https://github.com/supabase/auth
- [F14] Appwrite no GitHub (estrelas, BSD-3, releases): https://github.com/appwrite/appwrite
- [F15] Preços do Convex (limites Free/Starter, sessões simultâneas): https://www.convex.dev/pricing
- [F16] Limites do Convex ("Free has hard resource caps"): https://docs.convex.dev/production/state/limits
- [F17] Preços do Supabase (limites Free, pausa, Realtime, Pro): https://supabase.com/pricing
- [F18] FAQ do PocketBase (sem hospedagem, VMs gratuitas, sem promessa de manutenção, aviso sobre IA): https://pocketbase.io/faq
- [F19] Appwrite, limite de 2 funções no Free (2026-01-08): https://appwrite.io/changelog/entry/2026-01-08
- [F20] Cotas gratuitas do Firestore: https://firebase.google.com/docs/firestore/quotas
- [F21] Cloud Functions exige Blaze: https://firebase.google.com/docs/functions/get-started
- [F22] Cloud Storage exige Blaze: https://firebase.google.com/docs/storage/web/start
- [F23] Preços do Cloudflare Workers (Free): https://developers.cloudflare.com/workers/platform/pricing/
- [F24] Preços do Cloudflare D1 (Free): https://developers.cloudflare.com/d1/platform/pricing/
- [F25] Self-hosting do Convex (serviços, SQLite): https://github.com/convex/convex-backend/blob/main/self-hosted/README.md
- [F26] Compose do Supabase (lista de serviços): https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml
- [F27] Self-hosting do Supabase (requisitos): https://supabase.com/docs/guides/self-hosting/docker
- [F28] PocketBase em produção (systemd, Caddy, Dockerfile de exemplo): https://pocketbase.io/docs/going-to-production/
- [F29] Compose do Appwrite (45 serviços): https://github.com/appwrite/appwrite/blob/main/docker-compose.yml
- [F30] Instalação self-hosted do Appwrite (requisitos): https://appwrite.io/docs/advanced/self-hosting/installation
- [F31] Sessões no Supabase Auth: https://supabase.com/docs/guides/auth/sessions
- [F32] Autenticação no PocketBase: https://pocketbase.io/docs/authentication/
- [F33] Better Auth: https://github.com/better-auth/better-auth
- [F34] Supabase Realtime Postgres Changes com RLS: https://supabase.com/docs/guides/realtime/postgres-changes
- [F35] API rules do PocketBase: https://pocketbase.io/docs/api-rules-and-filters/
- [F36] Condições das Security Rules do Firestore (`get`, `exists`, `getAfter`): https://firebase.google.com/docs/firestore/security/rules-conditions
- [F37] Mutações do Convex são transacionais: https://docs.convex.dev/functions/mutation-functions
- [F38] Controle de concorrência otimista do Convex: https://docs.convex.dev/database/advanced/occ
- [F39] Funções de banco e `rpc()` no Supabase: https://supabase.com/docs/guides/database/functions
- [F40] Transações no PocketBase (`runInTransaction`): https://pocketbase.io/docs/js-database/
- [F41] Rotas custom no PocketBase: https://pocketbase.io/docs/js-routing/
- [F42] Transações no Appwrite: https://appwrite.io/docs/products/databases/transactions
- [F43] Tempo real no Convex: https://docs.convex.dev/realtime
- [F44] Cotas de Realtime do Supabase: https://supabase.com/docs/guides/realtime/pricing
- [F45] API de tempo real do PocketBase (SSE): https://pocketbase.io/docs/api-realtime/
- [F46] Appwrite, limites de Realtime (2026-03): https://appwrite.io/changelog/entry/2026-03-19
- [F47] Preços de Durable Objects (Free só com SQLite, 100 mil req/dia): https://developers.cloudflare.com/durable-objects/platform/pricing/
- [F48] Supabase com Expo React Native: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native e https://www.npmjs.com/package/@supabase/supabase-js
- [F49] Guia Supabase + PowerSync: https://docs.powersync.com/integration-guides/supabase-+-powersync
- [F50] Series B do Convex (secundária): https://siliconangle.com/2026/08/04/convex-reels-57m-ai-optimized-application-backend/
- [F51] Series F do Supabase (secundária): https://www.orrick.com/en/News/2026/06/Supabase-Raises-500-Million-at-10-5-Billion-Valuation-to-Accelerate-Lead-in-Agentic-Infrastructure
- [F52] InstantDB no GitHub e npm: https://github.com/instantdb/instant e https://www.npmjs.com/package/@instantdb/react
- [F53] Preços do PowerSync: https://www.powersync.com/pricing
- [F54] Serviço PowerSync no GitHub: https://github.com/powersync-ja/powersync-service
- [F55] Zero no GitHub e npm: https://github.com/rocicorp/mono e https://www.npmjs.com/package/@rocicorp/zero
- [F56] Status do Zero (GA em 2026-03, roadmap do Cloud Zero): https://zero.rocicorp.dev/docs/status
- [F57] Triplit no GitHub e npm: https://github.com/aspen-cloud/triplit e https://www.npmjs.com/package/@triplit/client
- [F58] Jazz (repo novo e clássico): https://github.com/garden-co/jazz e https://github.com/garden-co/classic-jazz
- [F59] RxDB: https://github.com/pubkey/rxdb
- [F60] TinyBase: https://github.com/tinyplex/tinybase
- [F61] Runtimes do Convex (Web Crypto): https://docs.convex.dev/functions/runtimes
- [F62] Hospedagem do front com Convex: https://docs.convex.dev/production/hosting/
- [F63] Limites do Cloudflare Pages: https://developers.cloudflare.com/pages/platform/limits/
- [F64] Cobrança no Supabase (2 projetos gratuitos; pausados não contam): https://supabase.com/docs/guides/platform/billing-on-supabase
- [F65] Pausa manual de deployment no Convex (sem menção a inatividade): https://docs.convex.dev/production/pause-deployment
