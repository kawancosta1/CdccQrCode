export interface AdminTourStep {
  selector: string;
  title: string;
  description: string;
}

export interface AdminSectionGuide {
  id: string;
  route: string;
  title: string;
  subtitle: string;
  publicImpact: string;
  steps: string[];
  tipsAndWarnings: string[];
  tourSteps?: AdminTourStep[];
}

export const ADMIN_SECTION_GUIDES: AdminSectionGuide[] = [
  {
    id: "dashboard",
    route: "/admin",
    title: "Dashboard",
    subtitle: "Visão geral rápida da biblioteca e atalhos principais",
    publicImpact:
      "Não altera o site público diretamente; exibe o resumo do acervo, livros de demonstração e atalhos para as áreas mais usadas.",
    steps: [
      "Confira os indicadores de livros cadastrados, estantes e pendências do acervo.",
      "Use os botões rápidos para ir direto ao módulo que deseja atualizar.",
      "Antes de sair, clique em 'Ver como visitante' no topo para conferir o resultado no portal.",
    ],
    tipsAndWarnings: [
      "Alterações feitas nos módulos já ficam visíveis imediatamente no portal público após salvar.",
      "Em ambiente de desenvolvimento, o seletor de perfil no topo permite testar permissões de outros usuários.",
    ],
  },
  {
    id: "aparencia",
    route: "/admin/aparencia",
    title: "Aparência & Imagens",
    subtitle: "Cores sazonais, tema visual, logo e identidade da biblioteca",
    publicImpact:
      "Altera as cores principais, o tema sazonal (Outono, Inverno, Primavera, Verão), a logo da barra superior e os fundos visuais de todo o site público.",
    steps: [
      "Escolha a paleta ou tema sazonal ativo na seção de identidade visual.",
      "Se desejar trocar a logo ou imagem institucional, envie um arquivo novo ou informe a URL.",
      "Clique em salvar configurações para aplicar o novo visual em todas as páginas.",
    ],
    tipsAndWarnings: [
      "Prefira imagens leves (WebP ou PNG com fundo transparente) para manter o carregamento rápido no celular dos alunos.",
      "Evite combinações de cores com baixo contraste para preservar a leitura e acessibilidade.",
    ],
  },
  {
    id: "home-editor",
    route: "/admin/home-editor",
    title: "Editor da Home",
    subtitle: "Textos, seções visíveis, horário de funcionamento e comunicados da página inicial",
    publicImpact:
      "Controla o título principal, subtítulo, avisos rápidos, links úteis e quais blocos aparecem na página inicial (/) do portal.",
    steps: [
      "Edite os textos de boas-vindas, avisos ou horários de atendimento da biblioteca.",
      "Ative ou desative a exibição de blocos opcionais da Home conforme o período letivo.",
      "Salve e abra a Home em nova aba para confirmar o alinhamento dos textos.",
    ],
    tipsAndWarnings: [
      "Mantenha títulos curtos e objetivos para não quebrar o layout no celular.",
      "Sempre revise datas de feriados ou horários especiais antes de publicar.",
    ],
  },
  {
    id: "paginas",
    route: "/admin/paginas",
    title: "Páginas & Vestibular",
    subtitle: "Construtor de páginas personalizadas e curadoria dos livros de vestibular",
    publicImpact:
      "Cria páginas novas no site (/pagina/slug) — com opção de aparecer no menu — e atualiza a lista oficial de obras do Vestibular (FUVEST, UNICAMP, UNESP).",
    steps: [
      "Escolha a aba 'Páginas Personalizadas' para criar páginas livres ou 'Livros do Vestibular' para atualizar leituras obrigatórias.",
      "Preencha título, slug (endereço URL) e adicione blocos de texto, listas ou imagens na ordem desejada.",
      "Marque se a página está publicada e se deve aparecer no menu, depois clique em Salvar.",
    ],
    tipsAndWarnings: [
      "Evite alterar o 'slug' de uma página já divulgada em cartazes ou QR Codes, pois o link antigo deixará de funcionar.",
      "Na aba Vestibular, informe o código Dedalus/CDU exato para que o botão de localização leve o aluno direto à estante certa.",
    ],
    tourSteps: [
      {
        selector: '[data-tour="pages-tabs"]',
        title: "1. Alterne entre Páginas e Vestibular",
        description:
          "Use estas abas para alternar entre o construtor de páginas personalizadas do portal e o catálogo de leituras obrigatórias do vestibular.",
      },
      {
        selector: '[data-tour="pages-form"]',
        title: "2. Configure título, endereço (slug) e visibilidade",
        description:
          "Defina o nome da página, o endereço amigável na URL e se ela deve ficar publicada ou aparecer no menu principal.",
      },
      {
        selector: '[data-tour="pages-blocks"]',
        title: "3. Monte a página com blocos",
        description:
          "Adicione, edite ou remova blocos de conteúdo (texto, destaque, lista ou imagem) para estruturar a página sem precisar programar.",
      },
      {
        selector: '[data-tour="pages-save"]',
        title: "4. Salve para publicar no site",
        description:
          "Ao concluir, clique em salvar para gravar as alterações no portal público imediatamente.",
      },
    ],
  },
  {
    id: "carrossel",
    route: "/admin/carrossel",
    title: "Carrossel Home",
    subtitle: "Banners rotativos de destaque na página inicial",
    publicImpact:
      "Altera os slides principais exibidos no carrossel da Home, incluindo imagem, título, descrição, ordem e link de destino.",
    steps: [
      "Clique em adicionar slide ou selecione um slide existente para editar.",
      "Envie a imagem do banner e preencha título, legenda e link de destino (se houver).",
      "Ajuste a ordem de exibição e salve para atualizar o carrossel público.",
    ],
    tipsAndWarnings: [
      "Use imagens na proporção horizontal 16:9 (ex.: 1600×900px) para evitar cortes indesejados no celular e desktop.",
      "Não deixe texto muito pequeno dentro da imagem; prefira usar o campo de título e descrição do próprio slide.",
    ],
  },
  {
    id: "novidades",
    route: "/admin/novidades",
    title: "Novos no Acervo",
    subtitle: "Vitrine de aquisições recentes e livros em destaque",
    publicImpact:
      "Atualiza a seção de livros recém-chegados exibida aos visitantes para incentivar o empréstimo de novas obras.",
    steps: [
      "Cadastre o título, autor, código de chamada/CDU e capa do livro recém-chegado.",
      "Use a busca automática de metadados/capa quando disponível para agilizar o preenchimento.",
      "Salve o item para que ele apareça na vitrine pública de novidades.",
    ],
    tipsAndWarnings: [
      "Verifique se a sala e a estante estão corretas para que o aluno consiga localizar o livro fisicamente.",
      "Remova ou desative itens muito antigos periodicamente para manter a vitrine atual.",
    ],
  },
  {
    id: "sugestoes",
    route: "/admin/sugestoes",
    title: "Sugestões de Compra",
    subtitle: "Pedidos de novos livros enviados pelos visitantes do portal",
    publicImpact:
      "Não exibe a lista de pedidos publicamente; permite que a equipe da biblioteca acompanhe, aprove ou organize as solicitações feitas pelos usuários.",
    steps: [
      "Analise as sugestões enviadas pelos alunos e professores com título, autor e justificativa.",
      "Atualize o status do pedido conforme a triagem ou aquisição da biblioteca.",
      "Exclua apenas registros duplicados ou inválidos.",
    ],
    tipsAndWarnings: [
      "Ao adquirir um livro sugerido, lembre-se de cadastrá-lo também em 'Livros' e destacá-lo em 'Novos no Acervo'.",
    ],
  },
  {
    id: "exposicoes",
    route: "/admin/exposicoes",
    title: "Exposições",
    subtitle: "Mostras temáticas, eventos culturais e estantes especiais",
    publicImpact:
      "Publica cartões e páginas de exposições temáticas no portal público com datas, resumo e imagens da mostra.",
    steps: [
      "Crie uma nova exposição informando título, período, descrição e imagem de destaque.",
      "Associe livros ou links relacionados à temática da mostra, se aplicável.",
      "Salve e confirme que o status está ativo para exibição ao público.",
    ],
    tipsAndWarnings: [
      "Desative ou atualize exposições encerradas para que visitantes não busquem mostras que já saíram de cartaz.",
    ],
  },
  {
    id: "jogos",
    route: "/admin/jogos",
    title: "Jogos Lúdicos",
    subtitle: "Acervo de jogos de tabuleiro e atividades do Espaço Lúdico",
    publicImpact:
      "Atualiza a página pública do Espaço Lúdico com a lista de jogos disponíveis, faixa etária, número de jogadores, regras e fotos.",
    steps: [
      "Clique para cadastrar um jogo ou edite um jogo existente na lista.",
      "Preencha nome, categoria, quantidade de jogadores, tempo médio, regras resumidas e foto.",
      "Salve para atualizar o catálogo lúdico acessível aos visitantes.",
    ],
    tipsAndWarnings: [
      "Mantenha o campo de disponibilidade atualizado caso algum jogo esteja em manutenção ou com peças faltando.",
      "Fotos bem iluminadas da caixa ou do tabuleiro ajudam os alunos a escolherem o jogo rapidamente.",
    ],
  },
  {
    id: "qrcodes",
    route: "/admin/qrcodes",
    title: "Gerador QR Codes",
    subtitle: "Criação e impressão de QR Codes para estantes, salas e páginas",
    publicImpact:
      "Não modifica dados do site; gera códigos QR prontos para imprimir e colar nas estantes físicas, levando o aluno direto para a página correspondente.",
    steps: [
      "Selecione o destino desejado (estante específica, sala, pesquisa ou página personalizada).",
      "Confira o link de destino e o rótulo que aparecerá na etiqueta impressa.",
      "Baixe ou imprima o QR Code e teste com a câmera do celular antes de plastificar.",
    ],
    tipsAndWarnings: [
      "Sempre teste o QR Code impresso em papel comum antes de colar definitivamente na estante.",
      "Use etiquetas legíveis com o número da estante junto ao QR Code para facilitar a identificação visual.",
    ],
  },
  {
    id: "mapeamento",
    route: "/admin/mapeamento",
    title: "Regras & Mapa 3D",
    subtitle: "Mapeamento visual de prateleiras (Spotlight) e posições das estantes no Mapa 3D",
    publicImpact:
      "Define exatamente onde cada código CDU aparece iluminado na foto da estante (Spotlight) e onde cada estante fica posicionada no Mapa 3D interativo do visitante.",
    steps: [
      "No editor Spotlight, selecione Sala e Estante e envie a foto limpa (sem marcações desenhadas à mão).",
      "Ajuste as linhas divisórias das prateleiras e clique em um código CDU + um Preset (Linha Inteira, Metade, Terço) para marcar a região.",
      "Use 'Testar como Aluno' para conferir o destaque visual e clique em 'Salvar Mapeamento'.",
      "Abaixo, use o Mapa 3D e as regras extras se precisar ajustar pinos da planta ou faixas CDU.",
    ],
    tipsAndWarnings: [
      "Suba sempre a foto LIMPA da estante: o sistema aplica a iluminação automática sobre a prateleira certa.",
      "Formate códigos CDU exatamente como aparecem no catálogo (ex.: 530, 869.3, R) para que a busca encontre o destaque automaticamente.",
    ],
    tourSteps: [
      {
        selector: '[data-tour="mapping-spotlight-progress"]',
        title: "1. Acompanhe o progresso das 42 estantes",
        description:
          "Esta barra mostra quantas estantes já têm foto limpa e quantos códigos CDU estão mapeados. Ative 'Mostrar apenas pendentes' para focar no que falta.",
      },
      {
        selector: '[data-tour="mapping-spotlight-selector"]',
        title: "2. Escolha a estante e suba a foto limpa",
        description:
          "Selecione a Sala e a Estante desejadas e envie uma foto sem marcações. Ela será comprimida automaticamente no navegador.",
      },
      {
        selector: '[data-tour="mapping-spotlight-presets"]',
        title: "3. Selecione o código CDU e aplique em 1 clique",
        description:
          "Clique em um código CDU na lista, escolha a linha da prateleira e use os presets (Linha Inteira, Metade ou Terços) para criar a área instantaneamente.",
      },
      {
        selector: '[data-tour="mapping-spotlight-canvas"]',
        title: "4. Ajuste divisórias e alças na foto",
        description:
          "Arraste as linhas tracejadas entre as prateleiras para acompanhar alturas reais e use as alças nos cantos do retângulo para ajuste fino.",
      },
      {
        selector: '[data-tour="mapping-spotlight-actions"]',
        title: "5. Teste como aluno e salve",
        description:
          "Clique em 'Testar como Aluno' para visualizar exatamente o efeito Spotlight que o visitante verá antes de salvar no banco.",
      },
      {
        selector: '[data-tour="mapping-3d-map"]',
        title: "6. Posicione os pinos no Mapa 3D",
        description:
          "Nesta área você ajusta a posição de cada estante na planta 3D da sala e gerencia regras avançadas de faixas CDU.",
      },
    ],
  },
  {
    id: "livros",
    route: "/admin/livros",
    title: "Livros",
    subtitle: "Catálogo de exemplares, códigos Dedalus/CDU e busca do acervo",
    publicImpact:
      "Alimenta a busca principal do site: os visitantes encontram títulos, autores, códigos de chamada e seguem direto para a estante correspondente.",
    steps: [
      "Use a barra de pesquisa ou filtros por sala/estante para localizar um livro.",
      "Cadastre novos livros ou edite título, autor, código Dedalus, sala, estante e setor.",
      "Use 'Mover' quando trocar livros de estante ou exclua apenas registros inválidos.",
    ],
    tipsAndWarnings: [
      "Excluir um livro remove o registro da busca pública; se ele apenas mudou de lugar, use 'Mover' ou 'Editar'.",
      "Confira o código Dedalus/CDU antes de salvar, pois é ele que conecta o livro ao destaque na foto da estante.",
    ],
  },
  {
    id: "estantes",
    route: "/admin/estantes",
    title: "Estantes",
    subtitle: "Cadastro das estantes por sala, descrições e fotos gerais",
    publicImpact:
      "Atualiza as páginas públicas de estantes e a listagem de corredores/setores exibida ao visitante.",
    steps: [
      "Selecione a sala e confira as estantes cadastradas.",
      "Edite a descrição, dica espacial ou imagem de referência de cada estante.",
      "Salve as alterações para atualizar a página da estante no portal.",
    ],
    tipsAndWarnings: [
      "Mantenha a numeração das estantes alinhada com as placas físicas da biblioteca e com o Mapa 3D.",
    ],
  },
  {
    id: "salas",
    route: "/admin/salas",
    title: "Salas",
    subtitle: "Configuração das salas da biblioteca (Sala 1, Sala 2, Sala 3)",
    publicImpact:
      "Define nomes, descrições e organização geral das salas exibidas na navegação pública e no mapa.",
    steps: [
      "Escolha uma sala para revisar nome, descrição e estantes vinculadas.",
      "Atualize orientações úteis para ajudar o visitante a identificar cada ambiente.",
      "Salve as mudanças para refletir na navegação do portal.",
    ],
    tipsAndWarnings: [
      "Evite alterar identificadores internos de sala sem alinhar com os códigos já impressos nos QR Codes físicos.",
    ],
  },
  {
    id: "setores",
    route: "/admin/setores",
    title: "Setores",
    subtitle: "Áreas temáticas do conhecimento (Exatas, Humanas, Literatura, etc.)",
    publicImpact:
      "Organiza os filtros e agrupamentos de áreas temáticas vistos pelos visitantes ao explorar o acervo.",
    steps: [
      "Revise os setores existentes ou crie um novo agrupamento temático.",
      "Defina nome claro e associe corretamente os livros/estantes correspondentes.",
      "Salve para atualizar os filtros do portal.",
    ],
    tipsAndWarnings: [
      "Antes de excluir um setor, verifique se existem livros ou estantes vinculados a ele para não deixá-los sem categoria.",
    ],
  },
  {
    id: "auditoria",
    route: "/admin/auditoria",
    title: "Auditoria",
    subtitle: "Histórico de ações realizadas no painel administrativo",
    publicImpact:
      "Não altera o site público; registra quem criou, editou ou excluiu informações no Admin para transparência e segurança.",
    steps: [
      "Consulte os registros mais recentes para verificar alterações feitas pela equipe.",
      "Filtre por tipo de ação ou usuário quando precisar investigar uma mudança.",
    ],
    tipsAndWarnings: [
      "Os logs servem para rastreabilidade e segurança da equipe; eles não podem ser editados manualmente.",
    ],
  },
  {
    id: "configuracoes",
    route: "/admin/configuracoes",
    title: "Configurações",
    subtitle: "Preferências técnicas, integrações e manutenção do sistema",
    publicImpact:
      "Controla parâmetros globais do sistema administrativo, backups/importações e integrações que sustentam o portal.",
    steps: [
      "Revise as configurações atuais com atenção antes de alterar qualquer parâmetro.",
      "Faça backup/exportação antes de executar operações em massa ou restaurações.",
      "Salve apenas após validar o impacto da mudança.",
    ],
    tipsAndWarnings: [
      "Alterações incorretas nesta área podem afetar o funcionamento de todo o painel; na dúvida, consulte o responsável técnico.",
    ],
  },
];

export function resolveAdminSectionGuide(pathname: string): AdminSectionGuide {
  const normalized = pathname.replace(/\/+$/, "") || "/admin";
  const exact = ADMIN_SECTION_GUIDES.find((g) => g.route === normalized);
  if (exact) return exact;

  const prefixMatch = ADMIN_SECTION_GUIDES.find(
    (g) => g.route !== "/admin" && normalized.startsWith(g.route),
  );
  return prefixMatch ?? ADMIN_SECTION_GUIDES[0];
}
