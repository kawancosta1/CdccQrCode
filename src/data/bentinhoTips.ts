export interface BentinhoTip {
  id: string;
  label: string;
  text: string;
}

const ROUTE_TIPS: Record<string, BentinhoTip[]> = {
  "/": [
    {
      id: "home-dedalus",
      label: "Dica do Bentinho",
      text: "Você pode buscar tanto pelo código CDU (ex: 530) quanto pelo nome do livro ou assunto (ex: Física, Dom Casmurro)!",
    },
    {
      id: "home-rota",
      label: "Sabia disso?",
      text: "Vai pegar vários livros? Clique em '+ Minha Rota' nos resultados para organizar suas estantes por sala.",
    },
  ],
  "/vestibular": [
    {
      id: "vest-1",
      label: "Dica de Vestibular",
      text: "As obras da FUVEST e UNICAMP ficam concentradas na Sala 1 (Estantes 4, 5 e 6). Clique em qualquer card para ver os temas cobrados!",
    },
    {
      id: "vest-2",
      label: "Leitura Gratuita",
      text: "Vários clássicos em domínio público têm link direto para leitura na Biblioteca Brasiliana Mindlin da USP.",
    },
  ],
  "/estantes": [
    {
      id: "est-1",
      label: "Guia das Salas",
      text: "Sala 1 guarda Ciências e Literatura (469–930), Sala 2 tem Acervo Geral e Física/Química (001–469, R) e Sala 3 é o Espaço Infantojuvenil!",
    },
  ],
  "/espacoludico": [
    {
      id: "lud-1",
      label: "Hora do Jogo!",
      text: "No Espaço Lúdico você encontra Xadrez, Ludo e Batalha Naval para jogar com amigos — e tabuleiros digitais aqui mesmo no portal.",
    },
  ],
  "/novidades": [
    {
      id: "nov-1",
      label: "Novos no Acervo",
      text: "Aqui ficam as últimas compras e doações incorporadas à biblioteca. Não achou um título? Envie uma sugestão de compra!",
    },
  ],
  "/sugerir": [
    {
      id: "sug-1",
      label: "Participe do Acervo",
      text: "Sua sugestão de livro ajuda a equipe do CDCC a planejar as próximas compras da biblioteca!",
    },
  ],
};

export function getBentinhoTipsForContext(pathname: string, query?: string | null): BentinhoTip[] {
  const cleanQuery = query?.trim().toUpperCase() ?? "";
  if (cleanQuery.startsWith("53")) {
    return [
      {
        id: "cdu-fisica",
        label: "Curiosidade de Física (530)",
        text: "Na CDU, 530 reúne Mecânica, Óptica, Eletromagnetismo e Física Moderna — um dos acervos mais procurados do CDCC!",
      },
      ...(ROUTE_TIPS[pathname] ?? ROUTE_TIPS["/"]),
    ];
  }
  if (cleanQuery.startsWith("52")) {
    return [
      {
        id: "cdu-astro",
        label: "Curiosidade de Astronomia (520)",
        text: "O CDCC-USP possui tradição histórica em Astronomia com o Observatório Dietrich Schiel em São Carlos!",
      },
      ...(ROUTE_TIPS[pathname] ?? ROUTE_TIPS["/"]),
    ];
  }
  if (cleanQuery.startsWith("869")) {
    return [
      {
        id: "cdu-lit",
        label: "Literatura em Língua Portuguesa (869)",
        text: "Os códigos 869.9 reúnem Literatura Brasileira na Sala 1 — incluindo os clássicos dos vestibulares.",
      },
      ...(ROUTE_TIPS[pathname] ?? ROUTE_TIPS["/"]),
    ];
  }

  if (pathname.startsWith("/estantes/")) {
    return [
      {
        id: "shelf-detail",
        label: "Na Estante",
        text: "Use o guia lateral de prateleiras para identificar a altura exata onde o código está guardado!",
      },
      ...ROUTE_TIPS["/estantes"],
    ];
  }

  return ROUTE_TIPS[pathname] ?? ROUTE_TIPS["/"];
}
