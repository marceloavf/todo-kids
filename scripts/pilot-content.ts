const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const SCHOOL_DAYS = [1, 2, 3, 4, 5]
const WEEKEND = [0, 6]

type Step = { text: string; emoji: string }

export type SeedTask = {
  name: string
  icon: string
  description: string
  steps: Step[]
  points: number
  requiresApproval?: boolean
}

function task(
  name: string,
  icon: string,
  description: string,
  points: number,
  steps: [text: string, emoji: string][],
  requiresApproval = false,
): SeedTask {
  return { name, icon, description, points, steps: steps.map(([text, emoji]) => ({ text, emoji })), requiresApproval }
}

export const ROUTINES = [
  {
    name: 'Manhã',
    weekdays: ALL_WEEKDAYS,
    tasks: [
      task('Arrumar a cama', '🛏️', 'Deixe a cama pronta para a próxima noite.', 5, [
        ['Estique o lençol', '🛏️'], ['Puxe o cobertor', '🛏️'], ['Ponha o travesseiro no lugar', '💤'],
      ]),
      task('Vestir a roupa', '👕', 'Troque o pijama pela roupa do dia.', 5, [
        ['Vista a roupa que você separou', '👕'], ['Dobre o pijama ou leve ao cesto', '🧺'],
      ]),
      task('Tomar café da manhã', '🥣', 'Depois do café, ajude a deixar a mesa livre.', 0, [
        ['Sente à mesa para o café', '🥣'], ['Leve seu prato à pia quando terminar', '🍽️'],
      ]),
      task('Escovar os dentes', '🪥', 'Escove os dentes depois do café.', 5, [
        ['Coloque a pasta na escova', '🪥'], ['Escove por fora, por dentro e em cima', '🦷'], ['Cuspa a pasta e guarde a escova', '🚰'],
      ]),
    ],
  },
  {
    name: 'Antes da escola',
    weekdays: SCHOOL_DAYS,
    tasks: [
      task('Conferir a mochila', '🎒', 'Confira se você tem o material para hoje.', 5, [
        ['Olhe a agenda do dia', '📒'], ['Confira os cadernos e o estojo', '📚'], ['Coloque a lancheira e feche a mochila', '🎒'],
      ]),
      task('Calçar os sapatos', '👟', 'Deixe os sapatos prontos para sair.', 0, [
        ['Encontre o par de sapatos', '👟'], ['Calce e feche os sapatos', '👟'],
      ]),
    ],
  },
  {
    name: 'Depois da escola',
    weekdays: SCHOOL_DAYS,
    tasks: [
      task('Guardar a mochila', '🎒', 'Deixe a mochila no lugar dela quando chegar.', 5, [
        ['Tire a lancheira e leve à cozinha', '🍱'], ['Guarde a mochila no lugar de sempre', '🎒'],
      ]),
      task('Fazer a lição', '📚', 'Veja o que tem para hoje e peça ajuda se precisar.', 10, [
        ['Abra a agenda', '📒'], ['Faça a atividade de hoje', '✏️'], ['Mostre a atividade a um adulto', '👀'],
      ], true),
      task('Guardar os brinquedos', '🧸', 'Deixe espaço livre para andar depois de brincar.', 10, [
        ['Recolha os brinquedos do chão', '🧸'], ['Guarde cada um no seu lugar', '📦'], ['Confira se o caminho ficou livre', '👀'],
      ], true),
      task('Dar comida ao cachorro', '🐶', 'Use a porção que um adulto separou.', 5, [
        ['Pegue a porção separada', '🥣'], ['Ponha a ração no pote', '🐶'], ['Confira a água com um adulto', '💧'],
      ]),
    ],
  },
  {
    name: 'Antes de dormir',
    weekdays: ALL_WEEKDAYS,
    tasks: [
      task('Tomar banho', '🚿', 'Separe o que vai usar antes de entrar no banho.', 0, [
        ['Pegue a toalha e o pijama', '👕'], ['Tome banho com ajuda se precisar', '🚿'], ['Pendure a toalha', '🧺'],
      ]),
      task('Colocar o pijama', '👕', 'Vista o pijama e guarde a roupa do dia.', 5, [
        ['Vista o pijama', '👕'], ['Ponha a roupa usada no cesto', '🧺'],
      ]),
      task('Escovar os dentes à noite', '🪥', 'Escove os dentes antes de deitar.', 5, [
        ['Coloque a pasta na escova', '🪥'], ['Escove por fora, por dentro e em cima', '🦷'], ['Cuspa a pasta e guarde a escova', '🚰'],
      ]),
      task('Ler uma história', '📖', 'Escolha uma história para ler ou ouvir.', 0, [
        ['Escolha um livro', '📚'], ['Leia ou peça para alguém ler com você', '📖'], ['Guarde o livro quando terminar', '📚'],
      ]),
    ],
  },
  {
    name: 'Fim de semana',
    weekdays: WEEKEND,
    tasks: [
      task('Guardar as roupas dobradas', '🧺', 'Ajude a guardar suas roupas limpas.', 10, [
        ['Separe suas roupas da pilha', '👕'], ['Guarde cada peça na gaveta certa', '🧺'],
      ]),
      task('Regar as plantas', '🪴', 'Pergunte a um adulto quais plantas precisam de água.', 5, [
        ['Veja quais vasos precisam de água', '👀'], ['Coloque um pouco de água na terra', '💧'],
      ]),
      task('Organizar os livros', '📚', 'Deixe os livros fáceis de encontrar.', 5, [
        ['Junte os livros que ficaram espalhados', '📖'], ['Coloque os livros na estante', '📚'],
      ]),
    ],
  },
]

export const ONE_OFFS = [
  {
    daysFromToday: 0,
    task: task('Pôr a mesa', '🍽️', 'Prepare um lugar para cada pessoa que vai comer.', 10, [
      ['Pergunte quantas pessoas vão comer', '👀'], ['Coloque os pratos e os talheres', '🍽️'], ['Ponha um copo em cada lugar', '🥛'],
    ]),
  },
  {
    daysFromToday: 2,
    task: task('Separar papel para reciclar', '♻️', 'Ajude a separar papéis limpos para a coleta.', 10, [
      ['Junte o papel e o papelão limpos', '📦'], ['Leve tudo ao cesto da reciclagem', '♻️'],
    ], true),
  },
]

export const REWARDS = [
  { name: 'Escolher a música', icon: '🎹', cost: 15 },
  { name: 'Escolher o jogo em família', icon: '🧩', cost: 25 },
  { name: 'Desenhar juntos', icon: '🎨', cost: 35 },
  { name: 'Escolher o jantar', icon: '🍕', cost: 45 },
  { name: 'Sorvete', icon: '🍦', cost: 50 },
  { name: 'Soltar pipa juntos', icon: '🪁', cost: 65 },
  { name: '30 minutos de videogame', icon: '🎮', cost: 80 },
  { name: 'Cinema em casa', icon: '🎬', cost: 100 },
  { name: 'Passeio de bicicleta', icon: '🚲', cost: 120 },
  { name: 'Passeio no parque', icon: '🛝', cost: 150 },
]
