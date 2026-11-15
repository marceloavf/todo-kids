# UI e bibliotecas para o Todo Kids

Pesquisa feita em 2026-11-15. Marcação: **[V]** = li a fonte primária nesta sessão; **[NV]** = não verificado (memória, resumo de busca ou fonte secundária).
Nas tabelas, licença, estrelas e última versão vieram de `gh api repos/...`, `releases/latest` e do registro npm em 2026-11-15 e são [V], salvo marcação. As colunas "Web / RN", "Encaixe", "Tom" e "Notas" são avaliação minha e contam como [NV] quando não trazem marca. Tamanhos são min+gzip do pacote inteiro, pela API do [Bundlephobia](https://bundlephobia.com) [V]; pacotes com WASM pesam mais do que o número mostra.

## Resumo

1. Blocos visuais: avatares **DiceBear em estilos CC0**, ícones de tarefa **Noto Emoji** (Apache-2.0), fonte **Nunito** (OFL), comemoração com **CSS + canvas-confetti**. Todos servem às duas famílias de framework enquanto o alvo for a web.
2. Código: **Tailwind** como vocabulário comum (shadcn/ui na web pura, NativeWind + React Native Reusables no Expo), **TanStack Query**, **Zod**, **Temporal com polyfill**, **Vitest + Playwright**. A tela do filho deve ser feita à mão; biblioteca de componentes só na área do responsável.
3. Design: alvos de toque de cerca de 2 cm, só toque simples, nada que dependa de leitura, resposta imediata, e pontos como retorno e não como isca. Não achei estudo publicado que meça o efeito de longo prazo de aplicativos de tarefas com pontos.

## 1. Avatares

| Opção | Licença | Estrelas | Última versão | Web / RN | Notas |
|---|---|---|---|---|---|
| [DiceBear](https://github.com/dicebear/dicebear) | código MIT; **cada estilo tem licença própria** | 10,1 mil | v10.7.0, 2026-08-26 | ambos (gera texto SVG; no RN precisa de `react-native-svg` [NV]) | 0 dependências, 25,7 kB sem contar o JSON de cada estilo; 63 estilos em JSON no repo [dicebear/styles](https://github.com/dicebear/styles) |
| [Boring Avatars](https://github.com/boringdesigners/boring-avatars) | MIT | 6,5 mil | v2.0.2, 2025-09-24 | só React web (RN [NV]) | 2,9 kB; 6 variantes abstratas; o README também vende um serviço pago |
| [Bean Heads](https://github.com/RobertBroersma/beanheads) (antigo Big Heads) | MIT; o autor pede para não revender os ícones | 1,5 mil | npm 0.3.3, 2024-03-19 | React web | personagens com cara de adulto; sem release desde 2024 |
| [Multiavatar](https://github.com/multiavatar/Multiavatar) | **licença própria** ("Multiavatar License v1.0") | 2,0 mil | npm 1.0.7, 2021-10-09 | web | parado desde 2022; proíbe reempacotar o conjunto ou usá-lo como "o produto em si" |
| Open Peeps, Notionists | CC0 | n/a | n/a | via DiceBear | disponíveis como estilos do DiceBear; traço adulto |

Licenças dos estilos DiceBear, lidas em [dicebear.com/licenses](https://www.dicebear.com/licenses/) e conferidas no campo `meta.license` dos JSON [V]:

- **CC0 1.0** (sem atribuição): Critters, Thumbs, Cats, Dogs, Open Peeps, Notionists, Lorelei, Pixel Art, Shapes e os demais estilos do próprio DiceBear.
- **CC BY 4.0** (atribuição obrigatória): Adventurer, Big Ears, Big Smile, Croodles, Dylan, Fun Emoji, Glyphs, Micah, Miniavs, Personas, Toon Head.
- **Termos do artista** ("Free for personal and commercial use", Pablo Stanley): Avataaars e Bottts. **MIT**: Icons (Bootstrap Icons).

Conferi a aparência renderizando amostras [V]: Critters e Thumbs são monstrinhos coloridos e simpáticos; Fun Emoji sorteia rostos doentes e tristes por padrão; Adventurer e Big Smile são rostos humanos.

- **Escolha:** `@dicebear/core` com os estilos **Critters e Thumbs (CC0)**, gerados no próprio aplicativo. Guarda-se só a semente e a cor do filho.
- **Reserva:** bichos do mesmo conjunto de emoji da seção 2 sobre a cor do filho. Nenhuma dependência nova e fácil de reconhecer por quem não lê.
- **Cuidado:** não usar a API hospedada `api.dicebear.com` com dados do filho na semente; gerar localmente. Cats e Dogs estão no repositório de estilos, mas a API hospedada devolveu 404 para eles no dia da pesquisa [V].

## 2. Ícones de tarefa e emoji

| Conjunto | Licença | Estrelas | Última versão | Cobertura das 7 tarefas | Tom |
|---|---|---|---|---|---|
| [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | MIT | 10,2 mil | sem releases; última mudança de arte em 2025-01-30, último commit (CI) em 2026-08-24 | todas | formas cheias, poucas cores, arquivos de cerca de 0,8 kB no estilo Flat |
| [Noto Emoji](https://github.com/googlefonts/noto-emoji) | imagens Apache-2.0; fontes OFL-1.1 | 5,1 mil | Unicode 18, 2026-09-24 | todas | mais detalhe e degradês |
| [OpenMoji](https://github.com/hfg-gmuend/openmoji) | arte **CC BY-SA 4.0**; código LGPL-3.0 | 4,6 mil | 17.0.0, 2026-04-23 | todas, mais extras fora do Unicode | contorno fino, menos legível de relance |
| Twemoji: [original](https://github.com/twitter/twemoji) e [fork jdecked](https://github.com/jdecked/twemoji) | arte **CC BY 4.0**; código MIT | 17,8 mil / 1,9 mil | original v14.0.2, 2022-03-31 (parado); fork v17.0.3, 2026-06-01 | todas | chapado |
| [Lucide](https://github.com/lucide-icons/lucide) | ISC (parte herdada do Feather em MIT) | 25,8 mil | 1.73.0, 2026-11-14 | todas (`toothbrush`, `bed`, `broom`, `shower-head`, `utensils`, `dog`, `backpack`) | traço único, sóbrio |
| [Phosphor](https://github.com/phosphor-icons/react) | MIT | 1,8 mil (pacote React) | React v2.1.10, 2025-05-22; `phosphor-react-native` 3.0.6, 2026-04-23 | falta escova de dentes (há `tooth`) | 6 pesos, inclusive duotone |
| [Tabler](https://github.com/tabler/tabler-icons) | MIT | 22,7 mil | v3.52.0, 2026-11-14 | não achei escova, vassoura nem chuveiro; tem `dog-bowl` | traço único |
| [Iconify](https://github.com/iconify/iconify) | código MIT; **cada conjunto mantém a própria licença** | 6,4 mil | `@iconify/react` 6.0.4, 2026-11-01 | agregador | depende do conjunto |
| [Mulberry Symbols](https://github.com/mulberrysymbols/mulberry-symbols) | **CC BY-SA** | 62 | v3.6.1, 2026-08-21 | todas, como ações (`brush_teeth`, `make_the_bed`, `feed_dog`, `tidy_up`, `set_the_table`) | pictogramas de comunicação alternativa, 3,5 mil arquivos |
| ARASAAC e Sclera | **CC BY-NC-SA** e **CC BY-NC** (uso não comercial) | n/a | n/a | não conferi | pictogramas de rotina muito usados em escolas |

Cobertura conferida pela listagem de nomes da [API do Iconify](https://api.iconify.design/collection?prefix=fluent-emoji-flat) e pela árvore de arquivos do Mulberry [V]. Mapa nos conjuntos de emoji: escovar os dentes `toothbrush`, arrumar a cama `bed`, lição `books`/`pencil`/`backpack`, alimentar o bicho `dog-face`/`cat-face` (o Unicode não tem pote de ração), arrumar o quarto `broom`, banho `shower`/`bathtub`, pôr a mesa `fork-and-knife-with-plate`. Os conjuntos feitos para rotinas mostram a ação em vez do objeto, mas nenhum tem licença permissiva: as do ARASAAC e do Sclera vêm da listagem do [OpenSymbols](https://www.opensymbols.org/) [V: fonte secundária; a página do ARASAAC não abriu] e a do Sclera também da [página do projeto](https://www.sclera.be/en/picto/copyright) [V].

- **Escolha:** **Noto Emoji** nas tarefas (copiar os cerca de 40 SVG usados para o repositório, sem dependência em tempo de execução) e **Lucide** nos ícones de interface da área do responsável (`lucide-react`, `lucide-react-native` e `@lucide/svelte`, todos na 1.73.0).
- **Reserva:** **Fluent Emoji Flat**. Nas amostras que renderizei tem formas mais simples e arquivos menores (0,8 kB contra 2 a 6 kB), mas a arte está congelada desde janeiro de 2025, o que fere o critério de manutenção ativa.
- **Cuidado:** ARASAAC e Sclera proíbem uso comercial. OpenMoji e Mulberry exigem atribuição e obrigam a licenciar derivados sob a mesma licença. Twemoji exige atribuição.

## 3. Comemoração e movimento

| Opção | Licença | Estrelas | Última versão | Web / RN | Tamanho e notas |
|---|---|---|---|---|---|
| CSS (`@keyframes`, `transition`) | plataforma | n/a | n/a | só web | 0 kB; respeita `prefers-reduced-motion` com uma media query |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | ISC | 12,9 mil | 1.9.4, 2025-10-25 | só DOM: funciona no Expo exportado para web, não em build nativo | 4,3 kB, 0 dependências; opção `disableForReducedMotion`; confete de emoji com `shapeFromText` |
| [react-native-fast-confetti](https://github.com/AlirezaHadjar/react-native-fast-confetti) | MIT | 581 | v2.0.2, 2026-07-17 | RN nativo; web [NV] | exige Skia, Reanimated e Worklets |
| [react-native-confetti-cannon](https://github.com/VincentCATILLON/react-native-confetti-cannon) | MIT | 530 | 1.5.2, 2021-03-03 | RN | parado |
| [lottie-web](https://github.com/airbnb/lottie-web) | MIT | 32,5 mil | npm 5.13.0, 2025-05-21 | web | 76,8 kB |
| [dotLottie web](https://github.com/LottieFiles/dotlottie-web) | MIT | 947 | `dotlottie-react` 0.22.2, 2026-11-12 | web | 32 kB de JS mais o WASM (peso [NV]) |
| [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) | Apache-2.0 | 17,2 mil | v7.5.1, 2026-11-13 | RN e web (na web usa `dotlottie-react`) | um componente para as duas plataformas |
| Rive: [rive-wasm](https://github.com/rive-app/rive-wasm), [rive-react-native](https://github.com/rive-app/rive-react-native) | runtimes MIT; editor proprietário | 1,0 mil / 789 | 2.50.0, 2026-11-09 / v9.8.6, 2026-10-15 | ambos | 58 a 87 kB mais WASM |
| [Reanimated](https://github.com/software-mansion/react-native-reanimated) | MIT | 11,1 mil | 4.7.1, 2026-10-02 | RN e web (via `react-native-web`) | padrão no Expo |
| [Motion](https://github.com/motiondivision/motion) | MIT | 35,2 mil | npm 14.14.0, 2026-11-13 | só web (JS, React, Vue) | 64,3 kB no pacote inteiro |

Licenças de animações prontas:

- **LottieFiles gratuitas:** [Lottie Simple License](https://lottiefiles.com/page/license) [V]. Permite uso comercial e modificação, **sem atribuição obrigatória**. Os arquivos, mesmo modificados, seguem sob a mesma licença, e não se pode coletá-los para montar serviço concorrente. Itens pagos ou de outros mercados têm outros termos [NV].
- **Rive:** a [página de preços](https://rive.app/pricing) [V] diz que o plano gratuito exporta `.riv` "with a splash screen" e que tirar a tela de abertura da Rive exige plano pago (a partir de US$ 9 por assento/mês). Os runtimes não têm taxa.
- **iPhone:** `navigator.vibrate` não existe no Safari nem no Safari do iOS, segundo os [dados de compatibilidade da MDN](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json) [V]. A comemoração não pode depender de vibração. Som em aplicativo web instalado costuma exigir gesto do usuário [NV]; o toque na tarefa serve de gesto.

- **Escolha:** **CSS para a resposta ao toque + canvas-confetti para a comemoração**, nas duas famílias enquanto a v1 for web.
- **Reserva:** **Lottie por `lottie-react-native`** (ou `dotlottie-react` na web pura) quando houver mascote animado ou build nativo. Em nativo o confete passa a ser `react-native-fast-confetti`, que traz o Skia junto.

## 4. Fontes

Todas são OFL e têm os subconjuntos `latin` e `latin-ext` no [repositório google/fonts](https://github.com/google/fonts/tree/main/ofl) (arquivos `METADATA.pb`, [V]). Os acentos do português estão no bloco Latin-1, coberto pelo `latin` [NV: não testei a renderização]. Fontes não têm releases no GitHub; os repositórios de origem de Nunito, Lexend e Atkinson estão arquivados, e a distribuição viva é o google/fonts (últimas alterações nessas pastas em março de 2026) [V].

| Fonte | Eixos variáveis | Desenhada para | Evidência de legibilidade |
|---|---|---|---|
| [Nunito](https://github.com/google/fonts/tree/main/ofl/nunito) | peso | uso geral, terminais arredondados | nenhuma específica |
| [Fredoka](https://github.com/google/fonts/tree/main/ofl/fredoka) | peso e largura | títulos, bem arredondada | nenhuma |
| [Baloo 2](https://github.com/google/fonts/tree/main/ofl/baloo2) | peso | títulos, pesada | nenhuma |
| [Quicksand](https://github.com/google/fonts/tree/main/ofl/quicksand) | peso | títulos, geométrica e fina | nenhuma |
| [Lexend](https://github.com/google/fonts/tree/main/ofl/lexend) | peso | fluência de leitura | o [site do projeto](https://lexend.com/) afirma ganho; a base parece ser um estudo pequeno, sem replicação independente [NV: resumos de busca] |
| [Atkinson Hyperlegible Next](https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegiblenext) | peso | baixa visão (Braille Institute) | não é pesquisa com crianças [NV] |
| [Andika](https://github.com/google/fonts/tree/main/ofl/andika) | nenhum | alfabetização (SIL) | afirmação do autor [NV] |

O que a pesquisa diz:

- Walker e Reynolds ouviram 48 crianças de 6 anos lendo em Gill Sans e Century, com e sem "letras infantis" (a e g de um andar): "no significant differences, statistically". Fonte: [artigo da própria Sue Walker, 2005](https://booksforkeeps.co.uk/article/typography-in-childrens-books/) [V]; o artigo original no Information Design Journal não foi lido.
- No mesmo texto, 17 de 24 crianças acharam o espaçamento muito apertado entre letras o mais difícil de ler [V].
- Wilkins e outros (2009, [DOI 10.1111/j.1467-9817.2009.01402.x](https://doi.org/10.1111/j.1467-9817.2009.01402.x)) relatam que corpo maior melhora a leitura de crianças de 7 a 9 anos [NV: só o resumo, via busca].
- Conclusão honesta: **tamanho e espaçamento têm mais evidência do que a escolha da fonte**. Escolha pelo tom e pela cobertura.

- **Escolha:** **Nunito**, uma fonte variável para o aplicativo inteiro, hospedada junto (`@fontsource-variable/nunito` 5.3.0 na web, `@expo-google-fonts/nunito` 0.4.2 no Expo).
- **Reserva:** **Fredoka** em títulos e números de pontos, mantendo Nunito no texto.

## 5. Componentes e estilo

Expo / React Native com web:

| Opção | Licença | Estrelas | Última versão | Encaixe num visual lúdico próprio |
|---|---|---|---|---|
| [NativeWind](https://github.com/nativewind/nativewind) | MIT | 8,1 mil | 4.2.7, 2026-09-14; a v5 (Tailwind 4) ainda é `5.0.0-rc.1` | bom: só estilo, sem componentes impostos |
| [React Native Reusables](https://github.com/founded-labs/react-native-reusables) | MIT | 8,7 mil | `rn-primitives` 1.4.0, 2026-03-28 | bom: componentes copiados para o projeto, no modelo shadcn |
| [Tamagui](https://github.com/tamagui/tamagui) | MIT | 14,3 mil | v3.3.3, 2026-11-13 | bom, mas com compilador e conceitos próprios; v2 em maio e v3 em outubro de 2026 |
| [gluestack-ui](https://github.com/gluestack/gluestack-ui) | MIT no README e no npm; **sem arquivo LICENSE na raiz** | 5,4 mil | v5.0.0, 2026-06-25 | bom (copiar e colar), porém depende do NativeWind v5 ainda em RC |
| [React Native Paper](https://github.com/callstack/react-native-paper) | MIT | 14,5 mil | v5.15.4, 2026-11-02 | ruim: aparência Material Design |
| [Unistyles](https://github.com/jpudysz/react-native-unistyles) | MIT (npm) | 3,0 mil | v3.8.1, 2026-11-03 | só estilo; exige RN 0.85+, Expo SDK 56+ e build de desenvolvimento (sem Expo Go) |
| [Uniwind](https://github.com/uni-stack/uniwind) | MIT | 1,8 mil | v1.13.2, 2026-11-05 | alternativa nova ao NativeWind; não avaliei a fundo [NV] |
| [Expo UI](https://docs.expo.dev/versions/latest/sdk/ui/) (`@expo/ui`) | MIT | 53,6 mil (repo expo) | 58.0.28, 2026-11-11 | ruim para o filho: são componentes nativos SwiftUI e Jetpack Compose. A página lista Android, iOS e tvOS e cita "componentes universais" que rodam na web [V] |

Web pura:

| Opção | Licença | Estrelas | Última versão | Encaixe |
|---|---|---|---|---|
| [shadcn/ui](https://github.com/shadcn-ui/ui) | MIT | 128,2 mil | CLI 4.23.0, 2026-10-27 | bom: código copiado, estilo seu (React) |
| [Radix Primitives](https://github.com/radix-ui/primitives) / [Base UI](https://github.com/mui/base-ui) | MIT | 19,5 mil / 11,4 mil | `radix-ui` 1.8.1, 2026-10-12 / v1.9.0, 2026-10-09 | bom: sem estilo, só comportamento e acessibilidade (React) |
| [Ark UI](https://github.com/chakra-ui/ark) | MIT | 5,5 mil | `@ark-ui/svelte` 5.25.1, 2026-11-02 | bom: sem estilo, tem pacote Svelte |
| [daisyUI](https://github.com/saadeghi/daisyui) | MIT | 42,8 mil | v5.8.1, 2026-11-15 | bom: só classes CSS e temas, serve a React e Svelte |
| [Konsta UI](https://github.com/konstaui/konsta) | MIT | 4,3 mil | v5.5.0, 2026-09-28 | ruim: imita iOS e Material (React, Vue, Svelte) |
| [Ionic](https://github.com/ionic-team/ionic-framework) | MIT | 52,8 mil | v9.0.11, 2026-11-11 | ruim: aparência nativa e pacote grande [NV] |
| [Skeleton](https://github.com/skeletonlabs/skeleton) | MIT | 6,1 mil | `skeleton-svelte` 5.0.4, 2026-11-08 | médio: sistema de design pronto (Svelte e React) |
| [Bits UI](https://github.com/huntabyte/bits-ui) / [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) | MIT | 3,7 mil / 9,3 mil | 2.21.0, 2026-11-11 | bom: o par shadcn do Svelte |

- **Escolha:** **Tailwind** ([v4.3.5](https://github.com/tailwindlabs/tailwindcss), MIT) como base comum. Web pura: **shadcn/ui** (React) ou **shadcn-svelte**. Expo: **NativeWind 4 + React Native Reusables**. As duas trilhas usam as mesmas classes e o mesmo modelo de componente copiado.
- **Reserva:** **daisyUI** na web pura (menos dependências, tema por variável CSS para a cor de cada filho); **Tamagui** no Expo.
- **Regra de uso:** biblioteca de componentes só na área do responsável (formulários, diálogos, listas). A tela do filho são poucos botões enormes: fazê-la à mão é menos código do que desfazer o estilo de uma biblioteca.

## 6. Bibliotecas de apoio

| Área | Opção | Licença | Estrelas | Última versão | Web / RN | Tamanho e notas |
|---|---|---|---|---|---|---|
| Dados | [TanStack Query](https://github.com/TanStack/query) | MIT | 50,6 mil | react-query 5.107.1 e svelte-query 6.4.1, 2026-11-06 | ambos, e Svelte | 13,3 kB |
| Estado | [Zustand](https://github.com/pmndrs/zustand) | MIT | 58,9 mil | v5.1.0, 2026-11-06 | ambos (React) | 0,5 kB |
| Estado | [Legend State](https://github.com/LegendApp/legend-state) | MIT | 4,2 mil | estável 2.1.15, de 2024-08-30; a v3 segue em `3.0.0-beta.48` | ambos | evitar por ora |
| Validação | [Zod](https://github.com/colinhacks/zod) | MIT | 44,3 mil | v4.6.7, 2026-10-12 | ambos | 88,9 kB no pacote inteiro |
| Validação | [Valibot](https://github.com/open-circle/valibot) | MIT | 9,1 mil | v1.5.0, 2026-09-09 | ambos | 14,7 kB, modular |
| Datas | [temporal-polyfill](https://github.com/fullcalendar/temporal-polyfill) | MIT (npm) | 791 | 1.0.8, 2026-11-04 | ambos | 19,5 kB |
| Datas | [@js-temporal/polyfill](https://github.com/js-temporal/temporal-polyfill) | ISC | 797 | 0.5.1, 2025-03-31 | ambos | 45,2 kB |
| Datas | [date-fns](https://github.com/date-fns/date-fns) | MIT (npm) | 36,7 mil | v4.4.0, 2026-05-29 | ambos | 17,5 kB; fuso horário pelo `@date-fns/tz` 1.5.0 |
| Datas | [Day.js](https://github.com/iamkun/dayjs) | MIT | 48,6 mil | v1.11.23, 2026-08-17 | ambos | 3,1 kB; fuso por plugin |
| Datas | [rrule](https://github.com/jkbrzt/rrule) | BSD-3-Clause | 3,8 mil | npm 2.8.1, 2023-11-10 | ambos | parado; dispensável |
| Teste | [Vitest](https://github.com/vitest-dev/vitest) | MIT | 17,4 mil | v5.1.0, 2026-11-02 | web | unidade |
| Teste | [Jest](https://github.com/jestjs/jest) | MIT | 45,5 mil | v30.5.2, 2026-09-18 | RN, com `jest-expo` 58.0.14 | unidade no Expo |
| Teste | [Playwright](https://github.com/microsoft/playwright) | Apache-2.0 | 100,2 mil | v1.65.1, 2026-11-13 | web | ponta a ponta, com WebKit |
| Teste | [Maestro](https://github.com/mobile-dev-inc/Maestro) | Apache-2.0 | 16,4 mil | CLI 2.12.1, 2026-11-02 | Android, iOS e web | ponta a ponta em build nativo |

Situação do Temporal: o [README da proposta](https://github.com/tc39/proposal-temporal) diz Stage 4 [V]. Os [dados da MDN](https://github.com/mdn/browser-compat-data/blob/main/javascript/builtins/Temporal.json) listam Chrome 144, Firefox 139, Node 26 e Safari 27.3 [V]; não confirmei se o Safari 27.3 já chegou aos iPhones nem o suporte no motor Hermes do RN [NV]. Por isso o polyfill ainda é necessário.

- **Escolha:** **TanStack Query** para dados do servidor (mais **Zustand** só se sobrar estado local em React; no Svelte, o estado nativo basta). **Zod** na validação. **Temporal via `temporal-polyfill`** nas datas: `PlainDate`, `dayOfWeek` e "hoje" no fuso da família descrevem direto a rotina por dia da semana e a conclusão por dia. Nomes de dias em português saem do `Intl.DateTimeFormat`, sem biblioteca. **Vitest + Playwright** nos testes.
- **Reserva:** **Valibot** se o tamanho do pacote apertar; **date-fns + `@date-fns/tz`** se o polyfill der problema; **Jest (`jest-expo`) + Maestro** se a escolha for Expo.

## 7. Regras de design para a tela do filho

1. **Alvos de toque de cerca de 2 cm.** A NN/g recomenda "at least 2cm × 2cm touch targets for young children", quatro vezes a área do alvo adulto ([NN/g, 2018](https://www.nngroup.com/articles/children-ux-physical-development/)) [V]. Pela conta do Google (48 dp ≈ 9 mm), isso dá cerca de 105 px de CSS. O piso para qualquer controle é 44×44 pt ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)) [V], 48×48 dp com 8 dp de folga ([Ajuda de Acessibilidade do Android](https://support.google.com/accessibility/android/answer/7101858)) [V] e 44×44 px no [WCAG 2.5.5 (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) [V]. Os 24×24 px do [WCAG 2.5.8 (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) [V] valem só para a área do responsável. A página do Material 3 não pôde ser lida [NV].
2. **Área ativa maior que o desenho, e nada colado na borda de baixo.** Crianças de 7 a 10 anos erraram em média 30% dos alvos de 0,25 polegada, e alvos recuados 10 px da borda quase dobraram a taxa de erro ([Anthony et al., 2014](https://lisa-anthony.com/wp-content/uploads/2013/04/anthony-et-al-jpuc2013.pdf)) [V]. A Sesame Workshop observou que pré-escolares apoiam o pulso na borda inferior e disparam controles sem querer ([Sesame Workshop, 2012](https://joanganzcooneycenter.org/?p=19607)) [V: página de apresentação; o PDF não foi lido]. Regra prática, seguindo a recomendação de Anthony et al. de alinhar o alvo à borda ou contar toques na borda: o botão encosta na borda ou fica bem longe dela, nunca com uma margem estreita.
3. **O toque simples basta para tudo.** A Sesame aponta o toque como o gesto mais intuitivo para pré-escolares e diz que pinçar e arremessar são difíceis [V]. A NN/g pede uma alternativa por toque sempre que houver arrastar e aconselha evitar "complex gestures like dragging and scrolling" com os menores, embora aceite deslizar e arrastar simples abaixo dos 9 anos [V]. Banir toque duplo e toque longo é inferência minha; nenhuma das fontes lidas trata deles. As tarefas de hoje devem caber na tela, ou vir em páginas, porque a NN/g manda evitar rolagem com crianças pequenas ([NN/g, 2019](https://www.nngroup.com/articles/childrens-websites-usability-issues/)) [V].
4. **Funcionar sem leitura.** Para a NN/g os menores não leem "at all" [V]. Cada tarefa leva ícone grande, no máximo duas ou três palavras e o nome falado ao tocar. O `expo-speech` cobre Android, iOS e web ([documentação](https://docs.expo.dev/versions/latest/sdk/speech/)) [V]; a qualidade das vozes pt-BR em cada aparelho não foi testada [NV]. Texto de pelo menos 14 pt para os menores e 12 pt para os maiores (NN/g) [V], isto é, cerca de 19 px e 16 px.
5. **Resposta imediata a cada toque, comemoração curta.** Crianças "want instant gratification" e esperam som e animação (NN/g) [V]. Depois de marcar uma tarefa, ignore por um instante toques no mesmo lugar: Anthony et al. chamam esses toques atrasados de "holdovers" e viram que são mais comuns entre os mais novos [V]. Sem isso, o toque de comemoração desfaz a conclusão. Respeite `prefers-reduced-motion`.
6. **Pontos como retorno, não como isca.** A meta-análise de Deci, Koestner e Ryan (1999, [DOI 10.1037/0033-2909.125.6.627](https://doi.org/10.1037/0033-2909.125.6.627)) junta 128 estudos e conclui que recompensa tangível, esperada e condicionada reduz a motivação intrínseca (d de −0,28 a −0,40), enquanto elogio a aumenta (d = 0,33) [NV: números de resumo de busca; só a referência foi conferida no Crossref]. O estudo clássico com crianças é Lepper, Greene e Nisbett (1973, [DOI 10.1037/h0035519](https://doi.org/10.1037/h0035519)) [NV]. Uma análise de aplicativos de tarefas domésticas concluiu que eles focam "external rather than intrinsic motivation" e tratam cada pessoa isolada, não a família ([Bjering, Høiseth e Alsos, 2015](https://doi.org/10.1007/978-3-319-24589-8_16)) [V: resumo]. Na prática (inferência minha, não resultado de estudo): elogie o esforço, deixe o filho escolher a ordem, mostre progresso, e mantenha a regra do glossário de que reprovação não tira pontos.
7. **Sem mecânicas de pressão.** Nada de sorteio de recompensa, contagem regressiva, perda de sequência ou pontos por tempo de uso. Além do risco pedagógico, a [Lei 15.211/2025 (ECA Digital)](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm), em vigor desde 17 de março de 2026, exige configuração padrão que evite uso compulsivo (art. 8º, IV) e cita "recompensas pelo tempo de uso" e notificações entre os recursos que a supervisão parental deve poder limitar (art. 17, § 4º, II) [V: leitura do texto do Planalto; não é parecer jurídico].
8. **Cor nunca sozinha.** Cada filho já tem cor e avatar; o estado "feita" deve mudar forma e ícone, não só a cor. Contraste de texto de 4,5:1 até 17 pt e de 3:1 a partir de 18 pt ou em negrito (Apple HIG) [V]. Os critérios 1.4.1, 1.4.3 e 1.4.11 do WCAG não foram relidos [NV].
9. **Duas faixas de idade.** A NN/g separa 3 a 5, 6 a 8 e 9 a 12 anos e viu crianças rejeitarem conteúdo feito para uma série abaixo ou acima da delas [V]. Um filho de 11 anos não deve ver a mesma tela de um de 4.

## Perguntas em aberto

- **Fala:** voz sintetizada pt-BR ou áudio gravado para o nome das tarefas? Precisa de teste em iPhone e Android reais.
- **Faixas de idade:** quantos modos a tela do filho terá e quem escolhe, o responsável ou a idade cadastrada?
- **Ícones:** emoji mostra o objeto (cama), não a ação (arrumar a cama). Vale testar com um filho que não lê se o objeto basta, ou se compensa desenhar ícones de ação próprios.
- **Estilo no Expo:** ficar no NativeWind 4, esperar a v5 ou avaliar o Uniwind. Depende da decisão de framework.
- **Temporal:** confirmar suporte no Safari do iPhone e no Hermes antes de pensar em tirar o polyfill.
- **Som no iPhone:** validar áudio em aplicativo web instalado; vibração não existe.
- **Lei:** a comprovação é uma foto feita por um filho, logo dado pessoal de criança. Vale revisão jurídica (ECA Digital e LGPD) antes de publicar.
- **Efeito dos pontos:** não achei estudo que meça hábito de longo prazo em aplicativos de tarefas com pontos. Vale observar em casa se as tarefas continuam sendo feitas quando os pontos saem de cena.
- **Rive:** se um dia for usado, o plano gratuito mostra a tela de abertura da Rive.

## Fontes

- **Avatares:** [DiceBear](https://github.com/dicebear/dicebear), [licenças por estilo](https://www.dicebear.com/licenses/), [dicebear/styles](https://github.com/dicebear/styles), [Multiavatar LICENSE](https://github.com/multiavatar/Multiavatar/blob/main/LICENSE), [Boring Avatars](https://github.com/boringdesigners/boring-avatars), [Bean Heads](https://github.com/RobertBroersma/beanheads).
- **Ícones:** [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), [Noto Emoji](https://github.com/googlefonts/noto-emoji), [OpenMoji](https://github.com/hfg-gmuend/openmoji), [Twemoji](https://github.com/twitter/twemoji), [fork jdecked](https://github.com/jdecked/twemoji), [Lucide LICENSE](https://github.com/lucide-icons/lucide/blob/main/LICENSE), [Phosphor](https://github.com/phosphor-icons/react), [Tabler](https://github.com/tabler/tabler-icons), [Iconify](https://github.com/iconify/iconify), [API do Iconify](https://api.iconify.design/collection?prefix=fluent-emoji-flat), [Mulberry Symbols](https://github.com/mulberrysymbols/mulberry-symbols), [OpenSymbols](https://www.opensymbols.org/), [Sclera](https://www.sclera.be/en/picto/copyright).
- **Movimento:** [canvas-confetti](https://github.com/catdad/canvas-confetti), [react-native-fast-confetti](https://github.com/AlirezaHadjar/react-native-fast-confetti), [react-native-confetti-cannon](https://github.com/VincentCATILLON/react-native-confetti-cannon), [lottie-web](https://github.com/airbnb/lottie-web), [dotLottie web](https://github.com/LottieFiles/dotlottie-web), [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native), [Lottie Simple License](https://lottiefiles.com/page/license), [rive-wasm](https://github.com/rive-app/rive-wasm), [rive-react-native](https://github.com/rive-app/rive-react-native), [preços da Rive](https://rive.app/pricing), [Reanimated](https://github.com/software-mansion/react-native-reanimated), [Motion](https://github.com/motiondivision/motion), [MDN, vibração](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json), [Bundlephobia](https://bundlephobia.com).
- **Fontes tipográficas:** [google/fonts](https://github.com/google/fonts/tree/main/ofl), [Lexend](https://lexend.com/), [Sue Walker, 2005](https://booksforkeeps.co.uk/article/typography-in-childrens-books/), [Wilkins et al., 2009](https://doi.org/10.1111/j.1467-9817.2009.01402.x).
- **Componentes:** [NativeWind](https://github.com/nativewind/nativewind), [React Native Reusables](https://github.com/founded-labs/react-native-reusables), [Tamagui](https://github.com/tamagui/tamagui), [gluestack-ui](https://github.com/gluestack/gluestack-ui), [React Native Paper](https://github.com/callstack/react-native-paper), [Unistyles](https://github.com/jpudysz/react-native-unistyles), [Uniwind](https://github.com/uni-stack/uniwind), [Expo UI](https://docs.expo.dev/versions/latest/sdk/ui/), [shadcn/ui](https://github.com/shadcn-ui/ui), [Radix](https://github.com/radix-ui/primitives), [Base UI](https://github.com/mui/base-ui), [Ark UI](https://github.com/chakra-ui/ark), [daisyUI](https://github.com/saadeghi/daisyui), [Konsta UI](https://github.com/konstaui/konsta), [Ionic](https://github.com/ionic-team/ionic-framework), [Skeleton](https://github.com/skeletonlabs/skeleton), [Bits UI](https://github.com/huntabyte/bits-ui), [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte), [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss).
- **Apoio:** [TanStack Query](https://github.com/TanStack/query), [Zustand](https://github.com/pmndrs/zustand), [Legend State](https://github.com/LegendApp/legend-state), [Zod](https://github.com/colinhacks/zod), [Valibot](https://github.com/open-circle/valibot), [temporal-polyfill](https://github.com/fullcalendar/temporal-polyfill), [@js-temporal/polyfill](https://github.com/js-temporal/temporal-polyfill), [proposta Temporal](https://github.com/tc39/proposal-temporal), [MDN, Temporal](https://github.com/mdn/browser-compat-data/blob/main/javascript/builtins/Temporal.json), [date-fns](https://github.com/date-fns/date-fns), [Day.js](https://github.com/iamkun/dayjs), [rrule](https://github.com/jkbrzt/rrule), [Vitest](https://github.com/vitest-dev/vitest), [Jest](https://github.com/jestjs/jest), [Playwright](https://github.com/microsoft/playwright), [Maestro](https://github.com/mobile-dev-inc/Maestro), [expo-speech](https://docs.expo.dev/versions/latest/sdk/speech/).
- **Design para crianças:** [NN/g, usabilidade para crianças (2019)](https://www.nngroup.com/articles/childrens-websites-usability-issues/), [NN/g, desenvolvimento físico (2018)](https://www.nngroup.com/articles/children-ux-physical-development/), [Apple HIG, acessibilidade](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Android, tamanho de alvo](https://support.google.com/accessibility/android/answer/7101858), [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [Anthony et al., 2014](https://lisa-anthony.com/wp-content/uploads/2013/04/anthony-et-al-jpuc2013.pdf), [Sesame Workshop, 2012](https://joanganzcooneycenter.org/?p=19607), [Deci, Koestner e Ryan, 1999](https://doi.org/10.1037/0033-2909.125.6.627), [Lepper, Greene e Nisbett, 1973](https://doi.org/10.1037/h0035519), [Bjering, Høiseth e Alsos, 2015](https://doi.org/10.1007/978-3-319-24589-8_16), [Lei 15.211/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm).
