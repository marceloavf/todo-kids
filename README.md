# Todo Kids

Aplicativo em que os responsáveis montam as tarefas do dia de cada filho, os filhos marcam o que cumpriram e ganham pontos. O [briefing](docs/BRIEF.md) descreve as regras e o [glossário](GLOSSARY.md) define os termos.

O repositório tem o backend no Supabase, os testes das regras, o aplicativo web com as áreas do filho e do responsável e um teste de ponta a ponta do fluxo principal.

## Requisitos

- Node 24
- Docker

## Subir o Supabase local

```sh
npm install
npm run db:start
```

`db:start` sobe o Postgres, o Auth, o PostgREST e o Realtime, e grava a URL e as chaves locais em `.env.local`. A primeira execução baixa as imagens do Docker e demora alguns minutos. O arquivo `.env.example` lista as variáveis.

| Comando | O que faz |
| --- | --- |
| `npm run db:reset` | Recria o banco a partir de `supabase/migrations`. Apaga todos os dados locais. |
| `npm run db:types` | Regenera `src/database.types.ts` a partir do banco local. |
| `npm run db:stop` | Para os contêineres e mantém os dados. |

## Rodar o aplicativo

Com o Supabase local no ar e a família de demonstração criada, rode:

```sh
npm run dev
```

O Vite mostra o endereço, em geral `http://localhost:5173`. O aplicativo lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de `.env.local`. Para testar no celular na mesma rede, rode `npm run dev -- --host` e troque `127.0.0.1` pelo IP desta máquina em `VITE_SUPABASE_URL`.

| Comando | O que faz |
| --- | --- |
| `npm run build` | Gera o site estático em `dist/`. Os caminhos são relativos, então o site funciona em qualquer pasta. |
| `npm run preview` | Serve `dist/` para conferir o build. |
| `npm run lint` | Roda o ESLint. |
| `npm run emoji:fetch` | Baixa do Noto Emoji os SVGs que faltam em `public/emoji` (veja Ícones e sons). |

Ao abrir, o aplicativo sempre mostra os perfis. A autorização do responsável fica só na memória e o aplicativo a encerra no servidor quando a pessoa sai do perfil. O único dado do aplicativo no `localStorage` é a última aprovação já comemorada de cada filho naquele aparelho. O `supabase-js` também guarda ali o login da família.

### Onde fica cada parte

- `src/child/` tem a área do filho: Hoje, o cartão da tarefa, Recompensas, a comemoração e os efeitos.
- `src/guardian/` tem a área do responsável: Início, Rotinas, Recompensas, Extrato e Família. Ela fica em um arquivo JavaScript separado, que só é baixado depois do PIN.
- `src/entry/` tem a Entrada, os Perfis e o teclado do PIN.
- `src/lib/` tem o que as áreas compartilham. `session.tsx` guarda a sessão e exporta `useGuardian`, cujo `callGuardian` acrescenta `p_token` e volta aos perfis quando o servidor responde `not_authorized`. `queries.ts` tem as consultas e as chaves do TanStack Query. `errors.ts` traduz as chaves de erro do banco.

### Ícones e sons

Os ícones das tarefas, das recompensas e dos avatares são emojis no banco. O componente `Emoji` desenha cada um com o SVG do [Noto Emoji](https://github.com/googlefonts/noto-emoji) copiado em `public/emoji`, sob a licença Apache 2.0 que está em `public/emoji/LICENSE`. Um emoji fora do conjunto aparece com a fonte do aparelho. Para incluir um emoji, acrescente-o à lista em `src/lib/emoji-set.ts` e rode `npm run emoji:fetch`.

Os sons em `public/sounds` vêm dos pacotes Interface Sounds e Music Jingles da Kenney, com licença CC0. Os arquivos de licença estão na mesma pasta. Eles foram convertidos de OGG para WAV mono de 22 kHz, porque o Safari do iPhone pode não tocar OGG. `src/lib/sound.ts` diz de qual arquivo original veio cada som.

## Rodar os testes

```sh
npm test
npm run typecheck
```

`npm test` roda também os testes de unidade em `src/lib` e `src/guardian`. Os testes do banco usam o Supabase local. Cada arquivo cria logins novos, então você pode rodar os testes de novo sem `db:reset`. Para vencer uma autorização ou um bloqueio de PIN, os testes alteram a linha direto no contêiner `supabase_db_todo-kids` com `docker exec`.

### Teste de ponta a ponta

```sh
npm run e2e
```

O comando gera o build, sobe o `vite preview` na porta 4319 e roda `e2e/main-flow.e2e.ts` no Google Chrome instalado no sistema, com tela de 390×844 e toque. O Playwright não baixa navegador. O teste cria uma família nova pela tela "Criar família", então não depende da família de demonstração e pode rodar de novo sem `db:reset`. Ele precisa do Supabase local no ar.

## Criar a família de demonstração

```sh
npm run seed
```

O comando cria a família com dois filhos, duas rotinas, uma tarefa avulsa para hoje e quatro recompensas. Rodar de novo atualiza os mesmos registros e não duplica nada.

| Campo | Valor |
| --- | --- |
| E-mail | `demo@todokids.local` |
| Senha | `todokids-demo` |
| PIN da responsável | `1234` |

## Contrato do banco

- `supabase/migrations/20261115000000_init.sql` tem as tabelas, as políticas de leitura e as funções.
- `src/database.types.ts` tem os tipos gerados das tabelas e das funções.
- `src/error-keys.ts` lista as chaves de erro que as funções devolvem em `error.message`.

O aplicativo lê as tabelas da própria família com `select` e grava só pelas funções. As funções de responsável recebem em `p_token` a autorização que `start_guardian_session` devolve.

Uma migração nova que cria tabela ou função precisa repetir o bloco de `revoke` e `grant` do fim da migração inicial. Sem ele, o Supabase libera a gravação direta na tabela e a chamada da função sem login. O teste `tests/db/isolation.test.ts` falha nesse caso.
