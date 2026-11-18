# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Localizador de livros da Biblioteca CDCC (USP São Carlos): o usuário digita um código Dedalus/CDU (ou lê um QR Code na estante) e o site mostra a sala, a estante e o caminho no mapa 2D/3D. React 19 + TypeScript + Vite 7. Textos e comentários do código são em português (pt-BR).

## Comandos

```bash
npm install
npm run dev          # Vite em http://localhost:5173/CdccQrCode/  (o /CdccQrCode/ é obrigatório: base do Vite)
npm run typecheck    # tsc -b
npm run lint         # eslint .
npm test             # node --experimental-strip-types --test tests/*.test.ts
node --experimental-strip-types --test tests/roomPathfinding.test.ts   # um arquivo de teste
node --experimental-strip-types --test --test-name-pattern="desvia" tests/*.test.ts   # um teste por nome
npm run build        # tsc -b && vite build
npm run preview
```

- Os testes usam o runner nativo do Node (`node:test`), sem Vitest/Jest. Precisam de Node 22+ (Vite 7 exige 20.19+).
- Por isso, código importado pelos testes (`src/domain`, `src/services`, `src/admin/services`, `src/repositories`, etc.) deve usar imports relativos **com extensão** (`"../x.ts"`) e evitar sintaxe que o strip-types não suporta (enums, parameter properties, namespaces).
- `server/express-spa-server.mjs` serve `dist/` em `/CdccQrCode` (usa `express`, que não está no package.json); `deploy/nginx.conf` é a alternativa. O deploy do site é GitHub Pages (`gh-pages`).

## Arquitetura

**Roteamento e shell.** `src/App.tsx` usa `HashRouter` (links são `/#/rota`) com páginas em `lazy`. Rotas: `/`, `/estantes`, `/estantes/:sala/:numero` (destino dos QR Codes, aceita `?origem=`), `/espacoludico[/:jogo]`, `/vestibular`, `/novidades`, `/sugerir`, `/totem`, `/p/:slug` (páginas dinâmicas), `/admin/*`. Providers globais: SiteConfig → Accessibility → VisitRoute → BookSearch; `MainTemplate` contém o link "Pular para o conteúdo" e `#main-content`.

**Busca de livros (fluxo principal).** `hooks/useBookSearch` + `context/BookSearchContext` usam `domain/searchParser` (normaliza e interpreta códigos CDU/Dedalus), `domain/nameSearch` e `services/catalogSearchIndex` (busca por nome/assunto). A resolução código → sala/estante passa pelo `repositories/bookCatalogRepository` (interface `BookCatalogRepository` em `types/catalog.ts`; implementação padrão sobre os bancos estáticos). O resultado da Home vai para a URL como `?q=...&sala=N`.

**Catálogo estático + sobreposições dinâmicas.** Os dados-base ficam em `src/data/imageDatabaseSala{1,2,3}.ts` (faixas de código → estante/foto; chunk separado `catalog-images` no build) e `src/config/` (`rooms`, `roomConstants`, `shelfImages`, `games`). `tests/catalogIntegrity.test.ts` valida a consistência desses dados — rode-o após editar o catálogo. Em cima disso, o admin cria mapeamentos, marcadores e fotos dinâmicos (`services/mappingService.ts`, `types/content.ts`).

**Firebase opcional com fallback local.** `lib/firebase.ts` só inicializa Firebase se `VITE_FIREBASE_API_KEY` e `VITE_FIREBASE_PROJECT_ID` estiverem definidos (`isFirebaseConfigured()`); veja `.env.example` e `docs/FIREBASE_SETUP.md`. Sem isso, todos os `services/*` (mapeamentos, carrossel, jogos, páginas, exposições, sugestões, etc.) e o painel admin gravam em `localStorage` (chaves `qrcodecdcc_*`, ex.: `qrcodecdcc_dynamic_mappings_v1`) e `admin/data/mockCatalogStore.ts`. Novos serviços devem seguir o mesmo padrão Firestore + fallback local. Regras de segurança em `firestore.rules` e `storage.rules` (escrita só para administradores).

**Admin (`src/admin/`).** Rotas, contexto de auth, serviços (`authService`, `permissionService` com papéis, `adminServices`) e páginas próprias. Login de demonstração `admin` / `cdcc-admin-dev` (vindo de `VITE_ADMIN_DEV_USER/PASSWORD`) só vale em `npm run dev` ou quando o Firebase NÃO está configurado; com Firebase ativo é login por e-mail/senha do Firebase Auth.

**Mapas.** Mapa 2D (`components/RoomMap`, posições das estantes em percentual) e mapa 3D com three.js (`components/LibraryMap3D`, chunk `three-vendor`). A rota do visitante é calculada por A* nos corredores em `domain/roomPathfinding.ts` (testada em `tests/roomPathfinding.test.ts`). As pegadas/posições 3D das estantes precisam coincidir com a planta 2D — commits recentes corrigiram desalinhamentos nas salas 1 e 2, então mexa nas duas representações juntas.

**Outros.** Acessibilidade (`AccessibilityContext/Drawer`, VLibras carregado em `index.html`, `useSpeechGuide`); `domain/seasonEngine.ts` (tema sazonal); capas de livros via Google Books/OpenLibrary (`services/bookMetadataService.ts`) — o Google Books responde 429 nas páginas Vestibular/Novidades se houver muitas requisições seguidas.

## Observações

- Vite está com `server.watch.usePolling: true` e `manualChunks` customizado em `vite.config.ts`.
- Não há CLAUDE/Cursor/Copilot rules anteriores no repositório.
