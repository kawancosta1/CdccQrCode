
import './styles/global.css'
import './styles/theme.css'

// ========================================
// IMPORTAÇÕES DE PÁGINAS
// ========================================
import { Home } from './components/Pages/Home'
import { Estantes } from './components/Pages/Estantes'
import { EstanteSala2 } from './components/Pages/EstanteSala2'


// ========================================
// IMPORTAÇÕES DE LAYOUT
// ========================================
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainTemplate } from './components/template/MainTemplate'


// ========================================
// CATÁLOGO QR CODE
// ========================================
// Sistema de catalogação de estantes com QR codes
// Suporta Sala 1 e Sala 2

export function App(){
  return (
    <BrowserRouter basename="/CdccQrCode">
      <MainTemplate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estantes" element={<Estantes />} />
          <Route path="/estantes/sala2/:numero" element={<EstanteSala2 />} />
        </Routes>
        
        
        
      </MainTemplate>
    </BrowserRouter>
  )
}

