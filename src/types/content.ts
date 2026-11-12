export interface CarouselSlide {
  id: string;
  imagemUrl: string;
  titulo: string;
  linkDestino: string;
  ordem: number;
  ativo: boolean;
  eyebrow?: string;
  descricao?: string;
  textoBotao?: string;
  imagemAlt?: string;
  posicaoObjeto?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface GameItem {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  capaUrl: string;
  categoria: string;
  ordem: number;
  disponivel: boolean;
  regrasTitulo?: string;
  jogadores?: string;
  objetivo?: string;
  preparacao?: string;
  regras?: string[];
  condicaoVitoria?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}
