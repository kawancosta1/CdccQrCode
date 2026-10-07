import "./styles/global.css";
import "./styles/theme.css";

// ========================================
// IMPORTAÇÕES DE PÁGINAS
// ========================================
import { Home } from "./components/Pages/Home";
import { Estantes } from "./components/Pages/Estantes";
import { Estante } from "./components/Pages/Estante";
import { EspacoLudico } from "./components/Pages/EspacoLudico";
import { RegrasJogo } from "./components/RegrasJogo";

// ========================================
// IMPORTAÇÕES DE DADOS
// ========================================
import { sala1, sala2 } from "./data/salas";

// ========================================
// IMPORTAÇÕES DE LAYOUT
// ========================================
import { HashRouter, Routes, Route } from "react-router-dom";
import { MainTemplate } from "./components/template/MainTemplate";

// ========================================
// CATÁLOGO QR CODE
// ========================================
// Sistema de catalogação de estantes com QR codes
// Suporta Sala 1 e Sala 2

export function App() {
  return (
    <HashRouter>
      <MainTemplate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/espacoludico" element={<EspacoLudico />} />
          <Route path="/estantes" element={<Estantes />} />
          <Route path="/estantes/sala1/:numero" element={<Estante sala={sala1} />} />
          <Route path="/estantes/sala2/:numero" element={<Estante sala={sala2} />} />
          <Route path="/espacoludico/xadrez" element={<RegrasJogo titulo="Xadrez" regras="Em breve" />} />
          <Route path="/espacoludico/batalha" element={<RegrasJogo titulo="Batalha Naval" regras="Em breve" />} />
          <Route path="/espacoludico/ludo" element={<RegrasJogo titulo="Ludo" regras="Em breve" />} />
        </Routes>
      </MainTemplate>
    </HashRouter>
  );
}
