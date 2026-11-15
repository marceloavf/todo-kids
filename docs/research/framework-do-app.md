# Framework do app cliente do Todo Kids: comparação honesta

Pesquisa feita em 2026-11-15. Marcação: **[V]** = li a fonte primária nesta data; **[M]** = medi nesta máquina; **[NV]** = não verificado (memória, fonte secundária ou página que não respondeu). Números de GitHub vêm de `gh api`, versões de `npm view`; `[Fn]` aponta para a lista de fontes no fim.

## Resumo

1. **Recomendação: web app estático (SPA) com Vite + React + TypeScript e um `manifest.json`, sem wrapper na v1.** Capacitor entra só no dia em que as lojas forem decididas, apontando para a mesma pasta de build. É a opção com menos peças, menor download e que roda inteira em Ubuntu.
2. **Segundo lugar: Expo.** Tem o melhor caminho para as lojas a partir de Linux (build de iOS na nuvem, cota gratuita), mas a própria documentação trata a web como segunda classe, o JavaScript inicial medido é de 516 KB contra 81 KB (projetos iniciais, não equivalentes) e, na v1, você pagaria o custo do React Native sem usar nada nativo.
3. **Fora: Flutter** (só o motor gráfico pesa 2 a 3 MB comprimido na web e a acessibilidade vem desligada), **Compose Multiplatform** (web em Beta), **Tauri mobile** (não tem alvo web; iOS só em macOS) e **Lynx** (um ano e meio de vida).

A escolha da categoria (web primeiro, wrapper depois) é bem sustentada pelas fontes. A escolha React x Svelte dentro dela é preferência, não evidência: ver a seção 1.

## Achados que mudaram o quadro

- **Expo Go no iPhone agora exige a conta paga da Apple.** A doc manda assinar o Apple Developer Program e compilar o Expo Go com `npx eas-cli@latest go` (mudança documentada entre fevereiro e setembro de 2026) [V][F1]. Sem os US$ 99, um projeto Expo só chega ao iPhone pela exportação web, igual a qualquer outro.
- **No iOS 26+, qualquer site adicionado à Tela de Início abre como web app**, sem exigir manifest nem service worker [V][F2]. A v1 precisa só de um manifest (para o Chrome no Android e para os ícones).
- **Push é um segundo caminho de código no Expo e no Capacitor.** `expo-notifications` declara só `android` e `ios` [V][F3]; o plugin de push do Capacitor não tem implementação web [V][F4]. Na web usa-se Web Push; na loja, APNs/FCM. A câmera não sofre disso: `expo-camera` e o plugin de câmera do Capacitor têm implementação web [V][F3][F4].
- **Google Play exige teste fechado com 12 testadores por 14 dias** para contas pessoais criadas depois de 2023-11-13 [V][F5]. Uma família de 2 a 6 pessoas não cumpre isso sozinha.
- **O Flutter não gera mais service worker** e, no WebKit (Safari e todo navegador de iOS), cai por padrão para JavaScript + CanvasKit em vez de WebAssembly [V][F6][F7].

## Tabela comparativa

Tamanhos: todo o JavaScript do cliente no build de produção, somado e comprimido com `gzip -9` [M]. Medi quatro projetos: Vite `react-ts` + React Router 8 com duas rotas; SvelteKit 3 `minimal` + `adapter-static` em modo SPA com duas rotas; Ionic React `tabs` (só os arquivos modernos); modelo padrão do Expo SDK 58. Não são equivalentes: os dois primeiros não trazem kit de UI, os dois últimos trazem abas e componentes. Leia como ordem de grandeza.

| Critério | PWA estática (Vite + React ou SvelteKit) | Capacitor + Ionic desde já | Expo (React Native + web) | Flutter |
|---|---|---|---|---|
| Saída web | É a própria web: DOM, rolagem e teclado nativos do navegador | Igual à PWA; Ionic adiciona componentes com cara de iOS/Android | DOM via React Native for Web; APIs com lacunas [V][F8] | Desenha em canvas (WebGL/WebGPU) [V][F9] |
| JS inicial (gzip) | React + roteador 81 KB; SvelteKit SPA 32 KB [M] | Ionic React abas: 311 KB [M] | Modelo padrão SDK 58: 516 KB [M] | Só o CanvasKit: 2,1 a 2,9 MB, mais o app [M] |
| Instalável no iPhone e Android | Sim, com manifest [V][F2][F10] | Sim | Sim; manifest e service worker são manuais [V][F11] | Sim; manifest gerado, sem service worker [V][F6] |
| Ressalvas próprias da web | Nenhuma estrutural | Nenhuma além do peso do Ionic | "PWAs são ótimas para usuários de desktop"; aviso contra service workers [V][F11] | Acessibilidade desligada por padrão; sem SEO; sem isolates [V][F12][F13] |
| Lojas depois | Capacitor (iOS) e Capacitor ou TWA (Android) | Já pronto | Expo Build na nuvem | `flutter build` + macOS |
| iOS a partir de Linux | Só com macOS na nuvem (Codemagic, GitHub Actions) [V][F14] | Idem | Sim, nativo do serviço [V][F15] | Só com macOS na nuvem [V][F16] |
| Ferramentas extras na máquina | Nenhuma | Android Studio + SDK para Android [V][F14] | Nenhuma (build na nuvem) | SDK Flutter/Dart, Android SDK |
| Linguagem | TypeScript | TypeScript | TypeScript | Dart |
| Recarga a quente | HMR do Vite [V][F53] | HMR do Vite [V][F53] | Fast Refresh em todas as plataformas [V][F17] | Hot reload web ligado por padrão [V][F18] |
| Testes | Vitest 5.1.0 (MIT, 17,4k) e Playwright 1.65.1, que emula iPhone [V][F54] | Idem; plugins exigem mocks manuais [V][F55] | `jest-expo` simula a parte nativa [V][F56] | Testes de unidade, de widget e de integração [V][F57] |
| Licença / estrelas | Vite MIT 83,9k; React MIT 252,6k; SvelteKit MIT 20,9k | Capacitor MIT 17,1k; Ionic MIT 52,8k | Expo MIT 53,6k; RN MIT 126,9k; RNW MIT 22,2k | BSD-3-Clause 181,3k |
| Última estável | Vite 8.3.8 (11-11); React 19.3.1 (10-14); SvelteKit 3.2.0 (11-10) | Capacitor 8.6.2 (11-12); Ionic 9.0.11 (11-11) | SDK 58.0.0 (09-29), `expo` 58.0.25; RN 0.88.1 (10-27) | 3.50.0 (11-11) |
| Cadência | Contínua | Uma major por ano (7.0 em 2025-01, 8.0 em 2025-12) | Uma SDK a cada 2 a 3 meses (55, 56, 57, 58 em 2026) | Trimestral (3.41, 3.44, 3.47, 3.50) |
| Quem mantém | Projetos comunitários (Vite, Svelte), Meta (React) [NV] | Ionic, hoje parte da OutSystems [V][F19] | Expo (empresa) e Meta [NV] | Google [NV] |

Todas as datas são de 2026 salvo indicação. Estrelas, licenças e versões: [V][F20].

## 1. PWA estática, wrapper só depois (recomendada)

**O que é.** Um SPA gerado como arquivos estáticos (`dist/` com `index.html`), hospedado em qualquer CDN gratuito, com um manifest. Sem service worker na v1: o app exige internet e não tem push, e nem o iOS 26 nem os critérios de instalação do Chrome pedem um [V][F2][F10].

**Por que ganha.**
- Menos peças: nenhum SDK nativo, nenhum serviço de build, nenhuma conta. Tudo roda com Node 24.
- Menor download no celular: 32 a 81 KB de JS contra 311 KB (Ionic) e 516 KB (Expo), com a ressalva de que os projetos medidos não são equivalentes, e contra megabytes no Flutter [M].
- O wrapper futuro aceita exatamente esse formato. O Capacitor pede "um diretório separado para os arquivos web já construídos" com `index.html` na raiz [V][F21]. A doc do SvelteKit descreve o mesmo caminho (SPA virando app com Capacitor ou Tauri) [V][F22].

**React ou Svelte?** As fontes não separam os dois de forma decisiva.
- A favor de Vite + React: Ionic publica pacotes só para Angular, React, Vue e JavaScript puro [V][F23], então React mantém Ionic, Konsta UI (React, Vue e Svelte [V][F24]) e uma eventual migração para Expo abertos. SvelteKit 3.0 saiu em 2026-10-01 [V][F20], há seis semanas: um agente de código tende a conhecer a versão 2.
- A favor de SvelteKit em modo SPA: 32 KB contra 81 KB [M], roteamento e service worker embutidos [V][F25]. A própria doc avisa que o modo SPA atrasa a primeira tela por exigir várias idas à rede, salvo quando servido localmente por um wrapper [V][F22].
- Next.js e TanStack Start (estável, 1.169.5 [V][F26]) são frameworks de servidor. O valor deles (SSR, funções de servidor) não entra no pacote estático que o Capacitor embute, então sobram peças sem uso. O modo estático de cada um não foi lido nesta pesquisa [NV].

**Riscos.** Ver a seção "Um código só serve web agora e lojas depois?".

## 2. Capacitor + Ionic desde o primeiro dia

É a opção 1 com duas peças adiantadas. O Capacitor diz ter "suporte de primeira classe" a PWAs e não exige Ionic [V][F27]. Adicioná-lo depois é instalar o pacote e rodar `cap add`, então adiantar não compra nada na v1 e traz Android Studio, SDK e projetos nativos para dentro do repositório [V][F14].

O Ionic Framework é uma decisão de kit de UI, separada do wrapper: entrega componentes com aparência de cada plataforma ao custo de ~311 KB de JS comprimido no projeto inicial [M]. O Konsta UI é a alternativa leve sobre Tailwind (4,3k estrelas, MIT, v5.5.0 de 2026-09-28) [V][F20][F24].

Saúde do projeto: releases frequentes (8.6.2 em 2026-11-12), mas só 14 commits em quatro semanas no repositório principal [V][F20]. A Ionic encerrou a venda de produtos comerciais em 2025-02-11 e o Appflow (build de iOS na nuvem) fica acessível só até 2027-12-31; o comunicado afirma que Capacitor e Ionic Framework "continuarão livres e de código aberto" [V][F19].

## 3. Expo (React Native com exportação web)

**Pontos fortes.**
- É o único candidato em que o mesmo código de UI vira app nativo de verdade, e não um site dentro de um webview.
- Build de iOS em Macs da Expo a partir de qualquer sistema [V][F15]. Plano gratuito: "até 15 builds Android e 15 iOS", fila de baixa prioridade com esperas de 90 minutos ou mais em pico, envio às lojas incluído [V][F28]. A página não diz se a cota é mensal.
- Existe um simulador de iOS remoto para quem não tem Mac [V][F29]; preço não verificado [NV].

**O que a própria documentação diz sobre a web.**
- "Recomendamos construir apps nativos sempre que possível [...] mas PWAs são uma ótima opção para usuários de desktop" [V][F11].
- "Cuidado ao adicionar service workers, pois são conhecidos por causar comportamento inesperado na web"; a configuração é manual, via Workbox [V][F11].
- React Native for Web: `Alert` e `RefreshControl` não implementados; `KeyboardAvoidingView`, `StatusBar` e `BackHandler` são simulações vazias; `Animated` sem driver nativo; `ScrollView` sem eventos de inércia [V][F8].
- Câmera tem suporte web; notificações não [V][F3].

**Por que fica em segundo.** Na v1 só a web é entregue. Escrever em primitivas de React Native (`View`, `Text`, estilos próprios) custa 516 KB de JS comprimido [M] e as lacunas acima, e o benefício só aparece se as lojas vierem. Sem os US$ 99 não dá para testar o lado nativo em um iPhone real [V][F1]. Se a ida às lojas fosse certa e próxima, Expo passaria para o primeiro lugar.

## 4. Flutter

- A doc lista PWAs e SPAs como cenários adequados [V][F12], mas o desenho é em canvas, e não em elementos HTML [V][F9].
- Peso: o CanvasKit do Flutter 3.50.0 tem 7,3 MB (2,9 MB com gzip) na variante completa e 5,5 MB (2,1 MB) na variante Chromium, antes do código do app [M][F30]. Qual variante o Safari baixa e o tamanho do `main.dart.js` de um app real não foram medidos [NV].
- No WebKit, WebAssembly fica desligado por padrão e o app cai para `dart2js` + CanvasKit; para ligar, é preciso Safari 26.2+ e uma opção explícita [V][F7].
- Acessibilidade na web: "não vem ligada por padrão"; o usuário precisa acionar um botão invisível [V][F13].
- Sem service worker gerado desde a descontinuação do `flutter_service_worker.js` [V][F6].
- Dart no lugar de TypeScript; build de iOS exige Xcode em macOS [V][F16].

Para um app de formulários e listas que nasce na web, é a pior relação entre peso e benefício.

## 5. Outros

- **Compose Multiplatform** (JetBrains, Apache-2.0, 19,5k, v1.12.2 de 2026-10-15): Android, iOS e desktop estáveis; web sobre Kotlin/Wasm em **Beta** [V][F31]. Exige JDK e Kotlin [NV]. Descartado pela web.
- **Tauri mobile** (Apache-2.0, 112,9k, 2.12.5 de 2026-10-21; 3.0 em alpha): é um wrapper, como o Capacitor, e não gera web app. "O desenvolvimento para iOS exige Xcode e só está disponível em macOS" [V][F32]. Exige Rust. Sem vantagem sobre o Capacitor aqui.
- **Lynx** (Apache-2.0, 15,3k, 4.2.0 de 2026-10-27; repositório criado em 2025-03-04): promete Android, iOS e web [V][F33], mas o guia inicial só oferece binário pronto para o simulador de iOS e não trata a web como alvo de produção [V][F34]. Jovem demais para este caso.

## Fatos do iOS (WebKit e Apple)

| Tema | O que a fonte diz (ano da fonte) | Estado |
|---|---|---|
| Adicionar à Tela de Início | Desde o Safari 26.0: "por padrão, todo site adicionado à Tela de Início abre como web app"; "zero requisitos de instalabilidade"; ícones do manifest continuam sendo usados (2025) [F2] | [V] |
| Convite de instalação | O Safari não implementa `beforeinstallprompt` (dados de compatibilidade da MDN: `version_added: false`). A instalação é manual, pelo menu Compartilhar (dados lidos em 2026) [F35] | [V] |
| Limite de 7 dias | O apagamento de armazenamento gravável por script vale para "sete dias de uso do Safari sem interação". Web apps na Tela de Início "não fazem parte do Safari" e têm contador próprio; "não esperamos que [...] tenha seus dados apagados" e, se acontecer, "consideraríamos um bug sério" (2020) [F36] | [V] |
| Antes de instalar | Dentro do Safari (aba comum), o limite de 7 dias se aplica (2020) [F36] | [V] |
| Persistência | `navigator.storage.persist()` é concedido por heurísticas "como o site estar aberto como Home Screen Web App". Cota igual à do navegador (até 60% do disco por origem) (2023) [F37] | [V] |
| Sessão separada | Web apps na Tela de Início têm "cookies e armazenamento separados do navegador". A cópia de cookies na instalação é descrita só para o macOS (2023) [F38] | [V] |
| Web Push | Desde o iOS 16.4, somente para web apps na Tela de Início, com pedido de permissão disparado por toque do usuário e modo `standalone` (2023) [F38][F39] | [V] |
| Câmera | `getUserMedia` em web app instalado: bug 185448 fechado como corrigido (betas do iOS 13.3 e 13.4; 2020) [F40]. Há relatos posteriores de falhas (bugs 215884, 252465, 273938), não lidos [NV]. `<input type="file" capture>` não verificado [NV] | parcial |
| Safari 27 | As notas do Safari 27.0 (2026-09-17), lidas por inteiro, não citam Tela de Início, manifest, Web Push nem remoção de armazenamento; trazem a API de roteamento estático de service worker e correções de IndexedDB. Nada ali revoga as linhas acima. Notas da 27.1 e 27.2 não lidas [F41] | [V] parcial |
| Brasil | Do iOS 26.5 em diante há lojas alternativas no Brasil (acordo com o CADE). Os apps continuam passando por notarização e vindo de membros do Apple Developer Program [F42] | [V] |
| Conta gratuita da Apple | Instala no próprio aparelho via Xcode, com perfis que expiram em 7 dias e até 3 aparelhos. Exige um Mac [F43] | [V] |

**Consequência para o login (inferência minha, não está na fonte):** como o web app instalado não compartilha sessão com o Safari, um link mágico aberto pelo e-mail cai no Safari, e não no app. Prefira código digitado, senha ou PIN.

## Um código só serve web agora e lojas depois?

Em boa parte sim, mas estes pontos contradizem a versão forte da ideia:

1. **Custo fixo que nenhum framework remove.** App Store: US$ 99 por ano [V][F44]. Google Play: US$ 25 uma vez [V][F45] mais o teste fechado de 12 testadores por 14 dias [V][F5].
2. **Mac obrigatório para compilar iOS**, local ou alugado. Codemagic dá 500 minutos gratuitos por mês em Mac mini M2 [V][F46]. No GitHub Actions, runners padrão são gratuitos em repositório público e o macOS custa US$ 0,062 por minuto em privado [V][F47]. O Expo Build embute isso [V][F15].
3. **Revisão da Apple.** Diretriz 4.2: o app deve ir "além de um site reempacotado" [V][F48]. Um wrapper de webview sem nada nativo corre risco de rejeição. Se entrar na categoria Kids, valem as regras da 1.3: links para fora e compras só atrás de trava parental; analytics e anúncios de terceiros, em regra, proibidos [V][F48].
4. **Push muda de API** entre a PWA e o app de loja (ver "Achados"). A câmera não.
5. **A instalação não migra.** PWA instalada e Safari guardam dados separados [V][F38]. Que um app de loja também comece vazio é inferência minha (é outro contêiner), não li fonte. Cada pessoa da família entraria de novo ao trocar.
6. **Android é o lado fácil.** O Bubblewrap gera um TWA a partir do manifest, baixa JDK e SDK sozinho e tem imagem Docker oficial; exige Digital Asset Links no domínio [V][F49][F50].
7. **Service worker dentro do webview do Capacitor no iOS**: não achei texto primário que confirme ou negue. A configuração do Capacitor tem uma opção "fazer as requisições do service worker passarem pela ponte" desde a 7.0 [V][F51], sem dizer em que plataforma funciona [NV].

## Perguntas em aberto

- A sensação de toque (rolagem, gestos, teclado) de cada opção em iPhone real: nenhuma fonte primária mede isso. Só um protótipo no aparelho responde.
- Câmera em web app instalado nos iOS 26 e 27: confiável ou não? Testar antes de trazer as fotos de comprovação de volta.
- Tamanho real do Flutter web (app + variante do CanvasKit no Safari) e tempo de carga em 4G: não medido.
- A cota gratuita do Expo Build é mensal? Quanto custa o simulador remoto? O Expo Go ainda existe na App Store para alguma SDK?
- PWABuilder para iOS: a documentação não carregou [NV][F52].
- A API do GitHub devolve hoje `react/react` e `react/react-native` como nomes dos repositórios; não busquei a explicação.
- A doc `main` do Capacitor já cita "Capacitor 9" com Xcode 27 e Android Studio 2026.1.4 como mínimos; a 9 ainda não saiu no npm [V][F14][F20].

## Fontes

Cada linha traz a afirmação que a fonte sustenta.

- **[F1]** Expo Go em iPhone físico exige Apple Developer Program e `eas-cli go`: https://docs.expo.dev/get-started/set-up-your-environment/ ; texto-fonte e histórico: https://github.com/expo/expo/blob/main/docs/scenes/get-started/set-up-your-environment/instructions/iosPhysicalExpoGo.mdx
- **[F2]** Todo site na Tela de Início abre como web app; zero requisitos: https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- **[F3]** `expo-notifications` (`platforms: ['android', 'ios']`) e `expo-camera` (inclui `web`): https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx e https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/camera.mdx
- **[F4]** Plugin de push do Capacitor sem `web.ts`; o de câmera tem: https://github.com/ionic-team/capacitor-plugins/tree/main/push-notifications/src e https://github.com/ionic-team/capacitor-plugins/tree/main/camera/src
- **[F5]** Teste fechado, 12 testadores, 14 dias, contas pessoais pós 2023-11-13: https://support.google.com/googleplay/android-developer/answer/14151465
- **[F6]** Flutter não gera nem registra mais service worker: https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/web/initialization.md
- **[F7]** WebKit cai para `dart2js` + CanvasKit por padrão; Wasm requer Safari 26.2+: https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/web/wasm.md
- **[F8]** Tabela de compatibilidade do React Native for Web: https://necolas.github.io/react-native-web/docs/react-native-compatibility/
- **[F9]** Flutter web renderiza com CanvasKit e Skwasm (WebGL/WebGPU): https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/web/index.md
- **[F10]** Critérios de instalação do Chrome (HTTPS, manifest com nome, ícones 192 e 512, `start_url`, `display`; sem citar service worker): https://web.dev/articles/install-criteria
- **[F11]** Guia de PWA da Expo (recomendação por apps nativos, aviso sobre service workers, manifest manual): https://github.com/expo/expo/blob/main/docs/pages/guides/progressive-web-apps.mdx
- **[F12]** FAQ web do Flutter (cenários ideais, SEO, sem isolates, sem `dart:io`): https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/web/faq.md
- **[F13]** Acessibilidade web do Flutter é opt-in: https://github.com/flutter/website/blob/main/sites/docs/src/content/ui/accessibility/web-accessibility.md
- **[F14]** Requisitos do Capacitor (macOS e Xcode para iOS; Android Studio e SDK; Node 24): https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/getting-started/environment-setup.md
- **[F15]** Builds de iOS em Macs da Expo; conta de US$ 99 exigida para a loja: https://github.com/expo/expo/blob/main/docs/pages/build/introduction.mdx e https://github.com/expo/expo/blob/main/docs/pages/build/setup.mdx
- **[F16]** Configuração de iOS do Flutter pressupõe Mac e Xcode: https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/ios/setup.md
- **[F17]** Fast Refresh e depuração "totalmente universais" na Expo: https://github.com/expo/expo/blob/main/docs/pages/workflow/web.mdx
- **[F18]** Hot reload ligado por padrão no Flutter web: https://github.com/flutter/website/blob/main/sites/docs/src/content/platform-integration/web/building.md
- **[F19]** Fim das vendas comerciais da Ionic, Appflow até 2027-12-31, OutSystems: https://ionic.io/blog/important-announcement-the-future-of-ionics-commercial-products
- **[F20]** Estrelas, licenças, releases e commits: `gh api repos/<dono>/<repo>`, `.../releases`, `.../stats/participation`; versões e datas: `npm view <pacote> version time`; Flutter: https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json
- **[F21]** Capacitor exige diretório de build com `index.html` (`webDir`): https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/getting-started/installation.md
- **[F22]** SvelteKit: SPA vira app móvel com Capacitor ou Tauri; aviso de desempenho do modo SPA: https://github.com/sveltejs/kit/blob/main/documentation/docs/10-getting-started/25-project-types.md e https://github.com/sveltejs/kit/blob/main/documentation/docs/25-build-and-deploy/55-single-page-apps.md
- **[F23]** Ionic publica pacotes para Angular, React, Vue e JavaScript: https://ionicframework.com/docs/intro/cdn
- **[F24]** Konsta UI para React, Vue e Svelte: https://github.com/konstaui/konsta
- **[F25]** Service worker embutido no SvelteKit: https://github.com/sveltejs/kit/blob/main/documentation/docs/30-advanced/40-service-workers.md
- **[F26]** "TanStack Start is stable": https://tanstack.com/start/latest/docs/framework/react/overview
- **[F27]** Capacitor: suporte a PWA e independência do Ionic: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/web/progressive-web-apps.md e https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/getting-started/faqs.md
- **[F28]** Plano gratuito da Expo: https://expo.dev/pricing
- **[F29]** Simulador de iOS remoto da Expo: https://github.com/expo/expo/blob/main/docs/pages/eas/simulators/how-to/work-without-a-mac.mdx
- **[F30]** Tamanho do CanvasKit medido em `https://www.gstatic.com/flutter-canvaskit/371f77202a73e8dff57a8b3bff75bca55c090aee/` (`canvaskit.wasm`, `chromium/canvaskit.wasm`, `skwasm.wasm`); hash em `bin/internal/engine.version` da tag 3.50.0
- **[F31]** Níveis de estabilidade do Compose Multiplatform: https://kotlinlang.org/docs/multiplatform/supported-platforms.html e https://github.com/JetBrains/compose-multiplatform
- **[F32]** Pré-requisitos do Tauri (iOS só em macOS): https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/start/prerequisites.mdx
- **[F33]** README do Lynx: https://github.com/lynx-family/lynx
- **[F34]** Guia inicial do Lynx: https://lynxjs.org/guide/start/quick-start.html
- **[F35]** `BeforeInstallPromptEvent` sem suporte no Safari: https://github.com/mdn/browser-compat-data/blob/main/api/BeforeInstallPromptEvent.json
- **[F36]** Limite de 7 dias e exceção dos web apps na Tela de Início (frases conferidas com `curl`): https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- **[F37]** Cotas, remoção e modo persistente: https://webkit.org/blog/14403/updates-to-storage-policy/
- **[F38]** WWDC23 "What's new in web apps" (cookies e armazenamento separados no iOS; push com `standalone`; frase conferida com `curl`): https://developer.apple.com/videos/play/wwdc2023/10120/
- **[F39]** Web Push no iOS 16.4: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- **[F40]** Bug 185448 (`getUserMedia` em web app instalado): https://bugs.webkit.org/show_bug.cgi?id=185448
- **[F41]** Notas do Safari 27.0 (sem mudanças em web apps instalados): https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
- **[F42]** Mudanças do iOS no Brasil: https://developer.apple.com/support/app-distribution-in-brazil/
- **[F43]** Limites da conta gratuita da Apple: https://developer.apple.com/support/compare-memberships/
- **[F44]** Apple Developer Program a US$ 99 por ano: https://developer.apple.com/programs/whats-included/
- **[F45]** Taxa única de US$ 25 do Google Play: https://support.google.com/googleplay/android-developer/answer/6112435
- **[F46]** Plano gratuito do Codemagic: https://codemagic.io/pricing/
- **[F47]** Cobrança do GitHub Actions: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- **[F48]** Diretrizes 4.2 e 1.3 da App Store: https://developer.apple.com/app-store/review/guidelines/
- **[F49]** Bubblewrap (requisitos, download automático, imagem Docker): https://github.com/GoogleChromeLabs/bubblewrap/blob/main/packages/cli/README.md
- **[F50]** TWA e Digital Asset Links: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- **[F51]** Opções de configuração do Capacitor: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/reference/config.md
- **[F52]** PWABuilder, publicação na App Store (não carregou): https://docs.pwabuilder.com/#/builder/app-store
- **[F53]** HMR do Vite sobre ESM nativo, com integrações oficiais: https://github.com/vitejs/vite/blob/main/docs/guide/features.md
- **[F54]** Vitest (`gh api repos/vitest-dev/vitest`) e emulação de iPhone no Playwright: https://github.com/microsoft/playwright/blob/main/docs/src/emulation.md
- **[F55]** Mocks de plugins do Capacitor: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/guides/mocking-plugins.md
- **[F56]** `jest-expo`: https://github.com/expo/expo/blob/main/docs/pages/develop/unit-testing.mdx
- **[F57]** Tipos de teste do Flutter: https://github.com/flutter/website/blob/main/sites/docs/src/content/testing/overview.md
