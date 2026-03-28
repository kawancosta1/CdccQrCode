
import './styles/global.css'
import './styles/theme.css'

// ========================================
// IMPORTAÇÕES DE PÁGINAS
// ========================================
import { Home } from './components/Pages/Home'
import { Estantes } from './components/Pages/Estantes'
import { EstanteSala1 } from './components/Pages/EstanteSala1'
import { EstanteSala2 } from './components/Pages/EstanteSala2'
import { EspacoLudico} from './components/Pages/EspacoLudico'

// ========================================
// IMPORTAÇÕES DE LAYOUT
// ========================================
import { HashRouter, Routes, Route } from 'react-router-dom'
import { MainTemplate } from './components/template/MainTemplate'


// ========================================
// CATÁLOGO QR CODE
// ========================================
// Sistema de catalogação de estantes com QR codes
// Suporta Sala 1 e Sala 2

export function App(){
  return (
    <HashRouter>
      <MainTemplate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/EspacoLudico" element={<EspacoLudico />} />
          <Route path="/estantes" element={<Estantes />} />
          <Route path="/estantes/sala1/:numero" element={<EstanteSala1 />} />
          <Route path="/estantes/sala2/:numero" element={<EstanteSala2 />} />
        </Routes>
        
        
        
      </MainTemplate>
    </HashRouter>
  )
}

