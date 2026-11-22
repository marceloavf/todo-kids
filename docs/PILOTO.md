# Primeiro teste em família

No aparelho do responsável, entre na conta da família e abra **Família → perfil do filho → Vincular aparelho**. No aparelho do filho, abra o site e toque em **Tenho um código**, ou leia o QR. O código vale por dez minutos. No Safari do iPhone, siga a orientação para abrir o aplicativo pela tela inicial. Ao reabrir o aplicativo vinculado, o filho entra direto em Hoje.

Para retirar o acesso de um aparelho, abra novamente o perfil do filho e toque em **Desvincular**. Arquivar o filho remove todos os seus vínculos.

## Ensaio antes de usar dados reais

Use uma família descartável, dois filhos e sessões separadas. Faça uma tarefa no aparelho do filho, aprove no aparelho do responsável, confira os pontos, peça um resgate e confira o extrato. Verifique o saldo do irmão. Feche e reabra o aplicativo, interrompa e retome a rede, e desvincule o aparelho enquanto ele estiver aberto. Repita o vínculo por QR nos modelos de celular que a família vai usar.

## Publicação proposta

Usar um projeto Supabase exclusivo para o piloto e servir o conteúdo de `dist/` por HTTPS. Um envio manual do build a um host estático permite experimentar em aparelhos reais sem configurar publicação automática a cada commit.

- Rodar `npm run db:start`, `npm test` e `npm run e2e` em ambiente com Docker e Chrome. Os testes de navegador cobrem o aparelho compartilhado e o aparelho vinculado em uma segunda sessão.
- Aplicar as migrações ao projeto do piloto. Ativar login anônimo somente depois de validar as novas permissões. Provisionar uma conta de responsável confirmada e configurar o cadastro público de acordo com o acesso pretendido. Usar apelidos e um PIN próprio. O seed contém credenciais públicas de demonstração.
- Configurar a URL HTTPS publicada como Site URL no Auth. Gerar o build com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do piloto. Publicar apenas `dist/`. A chave de serviço é administrativa e deve ficar fora do ambiente de build.
- Abrir a URL publicada nos aparelhos da família. Fazer o ensaio com dados descartáveis antes de cadastrar as rotinas reais. Guardar o build anterior para restaurar o site se necessário. Uma reversão do site não desfaz migrações nem lançamentos de pontos.

## O que observar com a família

Começar com uma rotina curta e uma recompensa alcançável. Observar se a criança identifica a ação pelo desenho, entende quando uma tarefa espera aprovação e percebe quando os pontos chegaram. Anotar a tarefa, o aparelho e o que a criança esperava que acontecesse. Isso orienta a próxima melhoria sem exigir telemetria.
