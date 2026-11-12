import batalhaNaval from "../components/img/Ludico/batalhaNaval.webp";
import ludo from "../components/img/Ludico/ludo.webp";
import xadrez from "../components/img/Ludico/xadrez.webp";

export interface GameInfo {
  slug: string;
  title: string;
  rulesTitle: string;
  description: string;
  image: string;
  players: string;
  objective: string;
  setup: string;
  rules: string[];
  winningCondition: string;
}

export const GAMES: GameInfo[] = [
  {
    slug: "xadrez",
    title: "Xadrez",
    rulesTitle: "Regras do Xadrez",
    description:
      "O xadrez é um jogo de estratégia para dois jogadores, jogado em um tabuleiro de 64 casas. Cada jogador controla peças com movimentos específicos, como torre, bispo e cavalo, com o objetivo de dar “xeque-mate” no rei adversário. Não envolve sorte, apenas planejamento, lógica e antecipação de jogadas.",
    image: xadrez,
    players: "2 jogadores",
    objective: "Colocar o rei adversário em xeque-mate, sem nenhuma jogada legal para escapar.",
    setup:
      "Posicione o tabuleiro com a casa clara no canto inferior direito de cada jogador. As peças brancas ficam nas fileiras 1 e 2, e as pretas nas fileiras 7 e 8, com a dama na casa de sua própria cor.",
    rules: [
      "As peças brancas sempre realizam o primeiro lance; os jogadores alternam uma jogada por turno.",
      "Peão: avança 1 casa para frente (ou 2 no primeiro lance) e captura na diagonal.",
      "Torre: move-se em linha reta pelas colunas ou fileiras quantas casas estiverem livres.",
      "Bispo: move-se pelas diagonais quantas casas estiverem livres.",
      "Dama (Rainha): combina os movimentos da torre e do bispo em qualquer direção.",
      "Cavalo: move-se em formato de “L” (duas casas em uma direção e uma perpendicular) e é a única peça que pode saltar sobre outras.",
      "Rei: move-se 1 casa em qualquer direção, desde que a casa não esteja atacada por uma peça adversária.",
      "Movimentos especiais incluem o roque (proteção do rei com a torre), a captura en passant e a promoção do peão ao alcançar a última fileira.",
    ],
    winningCondition:
      "Vence quem aplicar xeque-mate no rei adversário. A partida também pode terminar em empate por afogamento, comum acordo, repetição de posições ou falta de material.",
  },
  {
    slug: "ludo",
    title: "Ludo",
    rulesTitle: "Regras do Ludo",
    description:
      "O Ludo é um jogo de tabuleiro para até quatro jogadores, em que cada um tenta levar suas peças do início até o centro do tabuleiro. Os movimentos são determinados pelo lançamento de dados, o que introduz sorte no jogo. Vence quem conseguir levar todas as suas peças ao destino primeiro.",
    image: ludo,
    players: "2 a 4 jogadores",
    objective: "Percorrer todo o tabuleiro com seus 4 peões e levá-los até a casa final da sua cor.",
    setup:
      "Cada jogador escolhe uma cor e coloca seus 4 peões na base correspondente. Decide-se no dado quem inicia a partida.",
    rules: [
      "Para retirar um peão da base e colocá-lo na casa de partida, é necessário tirar 6 no dado.",
      "Sempre que um jogador tira 6 no dado, ele ganha o direito de jogar o dado novamente (três vezes seguidas com 6 fazem perder a vez).",
      "Os peões avançam no sentido horário conforme o número obtido no dado.",
      "Se um peão parar em uma casa ocupada por um peão adversário (que não seja uma casa segura marcada com estrela), o peão adversário retorna para a base.",
      "Ao dar a volta completa no tabuleiro, o peão entra no corredor final da sua própria cor, onde não pode ser capturado.",
      "Para entrar exatamente na casa central de chegada, é necessário tirar o número exato de casas restantes no dado.",
    ],
    winningCondition:
      "Vence o primeiro jogador que conseguir levar todos os seus 4 peões até a casa final no centro do tabuleiro.",
  },
  {
    slug: "batalha",
    title: "Batalha naval",
    rulesTitle: "Regras da Batalha Naval",
    description:
      "Batalha Naval é um jogo para dois jogadores baseado em dedução e estratégia. Cada jogador posiciona seus navios em um tabuleiro oculto e tenta adivinhar a localização dos navios adversários por meio de coordenadas. O objetivo é afundar toda a frota do oponente antes que ele faça o mesmo.",
    image: batalhaNaval,
    players: "2 jogadores",
    objective: "Localizar e afundar todos os navios da frota adversária antes que sua frota seja destruída.",
    setup:
      "Cada jogador posiciona secretamente seus navios na grade inferior (horizontal ou verticalmente, sem sobreposição) e usa a grade superior para registrar os tiros realizados.",
    rules: [
      "Os jogadores alternam turnos anunciando uma coordenada (ex: B4 ou G7).",
      "O adversário deve informar com honestidade se o disparo acertou a água (“Água”) ou atingiu parte de um navio (“Fogo” / “Acertou”).",
      "O atacante marca o resultado na sua grade de rastreamento com pino branco (água) ou vermelho (acerto).",
      "Quando todas as casas de um mesmo navio são atingidas, o defensor deve avisar que a embarcação foi afundada.",
      "Os navios não podem ser movidos após o início da partida.",
    ],
    winningCondition:
      "Vence o primeiro jogador que afundar todas as embarcações do adversário.",
  },
];

export function getGameBySlug(slug: string | undefined): GameInfo | undefined {
  if (!slug) return undefined;
  return GAMES.find((game) => game.slug === slug);
}
