import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase.ts";
import type { GameItem } from "../types/content.ts";
import { uploadCmsImage } from "./siteConfigService.ts";

const batalhaNaval = new URL("../components/img/Ludico/batalhaNaval.webp", import.meta.url).href;
const ludo = new URL("../components/img/Ludico/ludo.webp", import.meta.url).href;
const xadrez = new URL("../components/img/Ludico/xadrez.webp", import.meta.url).href;

const COLLECTION_NAME = "jogos";
const LOCAL_STORAGE_KEY = "qrcodecdcc_games_local";

export const DEFAULT_GAMES: GameItem[] = [
  {
    id: "xadrez",
    slug: "xadrez",
    nome: "Xadrez",
    descricao:
      "O xadrez é um jogo de estratégia para dois jogadores, jogado em um tabuleiro de 64 casas. Cada jogador controla peças com movimentos específicos com o objetivo de dar xeque-mate no rei adversário.",
    capaUrl: xadrez,
    categoria: "Estratégia Clássica",
    ordem: 1,
    disponivel: true,
    regrasTitulo: "Regras do Xadrez",
    jogadores: "2 jogadores",
    objetivo: "Colocar o rei adversário em xeque-mate, sem nenhuma jogada legal para escapar.",
    preparacao:
      "Posicione o tabuleiro com a casa clara no canto inferior direito de cada jogador. Peças brancas nas fileiras 1 e 2, pretas nas fileiras 7 e 8.",
    regras: [
      "As peças brancas sempre realizam o primeiro lance; os jogadores alternam uma jogada por turno.",
      "Peão: avança 1 casa para frente (ou 2 no primeiro lance) e captura na diagonal.",
      "Torre: move-se em linha reta pelas colunas ou fileiras quantas casas estiverem livres.",
      "Bispo: move-se pelas diagonais quantas casas estiverem livres.",
      "Dama (Rainha): combina os movimentos da torre e do bispo em qualquer direção.",
      "Cavalo: move-se em formato de L (duas casas em uma direção e uma perpendicular) e pode saltar sobre outras peças.",
      "Rei: move-se 1 casa em qualquer direção, desde que a casa não esteja sob ataque.",
      "Movimentos especiais incluem o roque, a captura en passant e a promoção do peão.",
    ],
    condicaoVitoria:
      "Vence quem aplicar xeque-mate no rei adversário. Pode terminar em empate por afogamento ou comum acordo.",
  },
  {
    id: "ludo",
    slug: "ludo",
    nome: "Ludo",
    descricao:
      "O Ludo é um jogo de tabuleiro para até quatro jogadores, em que cada um tenta levar suas peças do início até o centro do tabuleiro. Movimentos determinados pelo dado.",
    capaUrl: ludo,
    categoria: "Família e Sorte",
    ordem: 2,
    disponivel: true,
    regrasTitulo: "Regras do Ludo",
    jogadores: "2 a 4 jogadores",
    objetivo: "Percorrer todo o tabuleiro com seus 4 peões e levá-los até a casa final da sua cor.",
    preparacao:
      "Cada jogador escolhe uma cor e coloca seus 4 peões na base correspondente. Decide-se no dado quem inicia.",
    regras: [
      "Para retirar um peão da base e colocá-lo na casa de partida, é necessário tirar 6 no dado.",
      "Tirar 6 concede nova rolagem (três vezes seguidas com 6 faz perder a vez).",
      "Os peões avançam no sentido horário conforme o número obtido no dado.",
      "Se parar em casa ocupada por peão adversário não seguro, o peão adversário retorna à base.",
      "No corredor final da sua própria cor, o peão não pode ser capturado.",
      "Para entrar na casa central de chegada, é necessário o número exato no dado.",
    ],
    condicaoVitoria:
      "Vence o primeiro jogador que conseguir levar todos os seus 4 peões até a casa final no centro do tabuleiro.",
  },
  {
    id: "batalha",
    slug: "batalha",
    nome: "Batalha Naval",
    descricao:
      "Jogo para dois jogadores baseado em dedução e estratégia. Cada jogador posiciona seus navios em um tabuleiro oculto e tenta adivinhar a localização da frota adversária.",
    capaUrl: batalhaNaval,
    categoria: "Dedução e Estratégia",
    ordem: 3,
    disponivel: true,
    regrasTitulo: "Regras da Batalha Naval",
    jogadores: "2 jogadores",
    objetivo: "Localizar e afundar todos os navios da frota adversária antes que sua frota seja destruída.",
    preparacao:
      "Cada jogador posiciona secretamente seus navios na grade inferior (sem sobreposição) e usa a grade superior para registrar tiros.",
    regras: [
      "Os jogadores alternam turnos anunciando uma coordenada (ex: B4 ou G7).",
      "O adversário informa honestamente se o tiro atingiu a água ('Água') ou um navio ('Fogo' / 'Acertou').",
      "O atacante marca o resultado na sua grade de rastreamento com pino branco ou vermelho.",
      "Quando todas as casas de um navio forem atingidas, o defensor avisa que ele foi afundado.",
      "Os navios não podem ser movidos após o início da partida.",
    ],
    condicaoVitoria: "Vence o primeiro jogador que afundar todas as embarcações do adversário.",
  },
];

const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryCache[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryCache[key] = value;
}

function getLocalGames(): GameItem[] {
  const raw = safeGetItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [...DEFAULT_GAMES];
  }
  try {
    const parsed = JSON.parse(raw) as GameItem[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.ordem - b.ordem);
    }
  } catch {
    // ignora erro de parse
  }
  return [...DEFAULT_GAMES];
}

function saveLocalGames(games: GameItem[]): void {
  safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(games));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const GamesService = {
  async getAll(): Promise<GameItem[]> {
    const db = getFirestoreDb();
    if (db) {
      try {
        const colRef = collection(db, COLLECTION_NAME);
        const q = query(colRef, orderBy("ordem", "asc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const remoteGames = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<GameItem, "id">),
          }));
          saveLocalGames(remoteGames);
          return remoteGames;
        }
      } catch (err) {
        console.warn("Firestore inacessível ou offline. Usando fallback dos jogos:", err);
      }
    }
    return getLocalGames();
  },

  async getActive(): Promise<GameItem[]> {
    const all = await this.getAll();
    const active = all.filter((g) => g.disponivel !== false).sort((a, b) => a.ordem - b.ordem);
    if (active.length === 0) {
      return DEFAULT_GAMES.filter((g) => g.disponivel);
    }
    return active;
  },

  async getBySlug(slug: string): Promise<GameItem | null> {
    const all = await this.getAll();
    const match = all.find((g) => g.slug.toLowerCase() === slug.toLowerCase());
    if (match) return match;
    const fallback = DEFAULT_GAMES.find((g) => g.slug.toLowerCase() === slug.toLowerCase());
    return fallback ?? null;
  },

  async create(data: Omit<GameItem, "id">, imageFile?: File): Promise<GameItem> {
    let finalCapaUrl = data.capaUrl;
    if (imageFile) {
      finalCapaUrl = await this.uploadCover(imageFile);
    }

    const slug = data.slug?.trim() ? generateSlug(data.slug) : generateSlug(data.nome);
    const newGameData: Omit<GameItem, "id"> = {
      ...data,
      slug,
      capaUrl: finalCapaUrl,
      ordem: typeof data.ordem === "number" ? data.ordem : (await this.getAll()).length + 1,
      disponivel: data.disponivel ?? true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const db = getFirestoreDb();
    if (db) {
      try {
        const colRef = collection(db, COLLECTION_NAME);
        const docRef = await addDoc(colRef, newGameData);
        const created: GameItem = { id: docRef.id, ...newGameData };
        const local = getLocalGames();
        saveLocalGames([...local, created]);
        return created;
      } catch (err) {
        console.warn("Falha ao salvar jogo no Firestore. Gravando localmente:", err);
      }
    }

    const localId = `local-game-${Date.now()}`;
    const created: GameItem = { id: localId, ...newGameData };
    const local = getLocalGames();
    saveLocalGames([...local, created]);
    return created;
  },

  async update(id: string, data: Partial<GameItem>, imageFile?: File): Promise<GameItem> {
    let finalCapaUrl = data.capaUrl;
    if (imageFile) {
      finalCapaUrl = await this.uploadCover(imageFile);
    }

    const updates: Partial<GameItem> = {
      ...data,
      ...(data.nome && !data.slug ? { slug: generateSlug(data.nome) } : {}),
      ...(finalCapaUrl ? { capaUrl: finalCapaUrl } : {}),
      atualizadoEm: new Date().toISOString(),
    };

    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
      } catch (err) {
        console.warn("Falha ao atualizar jogo no Firestore. Atualizando localmente:", err);
      }
    }

    const local = getLocalGames();
    const updated = local.map((game) => (game.id === id ? { ...game, ...updates } : game));
    saveLocalGames(updated);
    const result = updated.find((g) => g.id === id);
    if (!result) {
      throw new Error(`Jogo com id ${id} não encontrado.`);
    }
    return result;
  },

  async delete(id: string): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn("Falha ao excluir jogo no Firestore. Excluindo localmente:", err);
      }
    }

    const local = getLocalGames();
    const filtered = local.filter((game) => game.id !== id);
    saveLocalGames(filtered);
  },

  async toggleDisponivel(id: string, nextDisponivel: boolean): Promise<void> {
    await this.update(id, { disponivel: nextDisponivel });
  },

  async reorder(orderedIds: string[]): Promise<void> {
    const local = getLocalGames();
    const reordered: GameItem[] = [];

    orderedIds.forEach((id, index) => {
      const match = local.find((g) => g.id === id);
      if (match) {
        reordered.push({ ...match, ordem: index + 1, atualizadoEm: new Date().toISOString() });
      }
    });

    local.forEach((g) => {
      if (!orderedIds.includes(g.id)) {
        reordered.push({ ...g, ordem: reordered.length + 1 });
      }
    });

    saveLocalGames(reordered);

    const db = getFirestoreDb();
    if (db) {
      try {
        await Promise.all(
          reordered.map((game) => {
            const docRef = doc(db, COLLECTION_NAME, game.id);
            return updateDoc(docRef, { ordem: game.ordem });
          }),
        );
      } catch (err) {
        console.warn("Falha ao atualizar ordem de jogos no Firestore:", err);
      }
    }
  },

  async uploadCover(file: File): Promise<string> {
    return uploadCmsImage(file, "games");
  },

  async resetToDefaults(): Promise<void> {
    saveLocalGames([...DEFAULT_GAMES]);
    const db = getFirestoreDb();
    if (db) {
      try {
        const existing = await this.getAll();
        await Promise.all(existing.map((g) => this.delete(g.id)));
        for (const game of DEFAULT_GAMES) {
          const data = { ...game };
          delete (data as { id?: string }).id;
          await this.create(data);
        }
      } catch (err) {
        console.warn("Falha ao semear jogos no Firestore:", err);
      }
    }
  },
};
