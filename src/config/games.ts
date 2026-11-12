import batalhaNaval from "../components/img/Ludico/batalhaNaval.jpg";
import ludo from "../components/img/Ludico/ludo.jpg";
import xadrez from "../components/img/Ludico/xadrez.jpg";

export interface GameInfo {
  slug: string;
  title: string;
  rulesTitle: string;
  description: string;
  image: string;
  containerClassKey: "xadrez" | "ludo" | "batalhaNaval";
}

export const GAMES: GameInfo[] = [
  {
    slug: "xadrez",
    title: "Xadrez",
    rulesTitle: "Regras Xadrez",
    description:
      "O xadrez é um jogo de estratégia para dois jogadores, jogado em um tabuleiro de 64 casas. Cada jogador controla peças com movimentos específicos, como torre, bispo e cavalo, com o objetivo de dar “xeque-mate” no rei adversário. Não envolve sorte, apenas planejamento, lógica e antecipação de jogadas.",
    image: xadrez,
    containerClassKey: "xadrez",
  },
  {
    slug: "ludo",
    title: "Ludo",
    rulesTitle: "Regras Ludo",
    description:
      "O Ludo é um jogo de tabuleiro para até quatro jogadores, em que cada um tenta levar suas peças do início até o centro do tabuleiro. Os movimentos são determinados pelo lançamento de dados, o que introduz sorte no jogo. Vence quem conseguir levar todas as suas peças ao destino primeiro.",
    image: ludo,
    containerClassKey: "ludo",
  },
  {
    slug: "batalha",
    title: "Batalha naval",
    rulesTitle: "Regras Batalha naval",
    description:
      "Batalha Naval é um jogo para dois jogadores baseado em dedução e estratégia. Cada jogador posiciona seus navios em um tabuleiro oculto e tenta adivar a localização dos navios adversários por meio de coordenadas. O objetivo é afundar toda a frota do oponente antes que ele faça o mesmo.",
    image: batalhaNaval,
    containerClassKey: "batalhaNaval",
  },
];

export function getGameBySlug(slug: string | undefined): GameInfo | undefined {
  if (!slug) return undefined;
  return GAMES.find((game) => game.slug === slug);
}
