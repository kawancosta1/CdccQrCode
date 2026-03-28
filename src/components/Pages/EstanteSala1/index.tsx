import { useParams } from 'react-router-dom'

import style from './style.module.css'

import { useState } from 'react'

import mapaSala1 from '../../img/MapaSala1.png'

// ========================================
// IMPORTAÇÕES DE IMAGENS - ESTANTES SALA 1
// ========================================
import estante1 from '../../img/EstanteSala1/1.png'
import estante2 from '../../img/EstanteSala1/2.png'
import estante3 from '../../img/EstanteSala1/3.png'
import estante4 from '../../img/EstanteSala1/4.png'
import estante5 from '../../img/EstanteSala1/5.png'
import estante6 from '../../img/EstanteSala1/6.png'
import estante7 from '../../img/EstanteSala1/7.png'
import estante8 from '../../img/EstanteSala1/8.png'
import estante9 from '../../img/EstanteSala1/9.png'
import estante10 from '../../img/EstanteSala1/10.png'
import estante11 from '../../img/EstanteSala1/11.png'
import estante12 from '../../img/EstanteSala1/12.png'
import estante13 from '../../img/EstanteSala1/13.png'
import estante14 from '../../img/EstanteSala1/14.png'
import estante15 from '../../img/EstanteSala1/15.png'
import estante16 from '../../img/EstanteSala1/16.png'
import estante17 from '../../img/EstanteSala1/17.png'
import estante18 from '../../img/EstanteSala1/18.png'
import estante19 from '../../img/EstanteSala1/19.png'
import estante20 from '../../img/EstanteSala1/20.png'
import estante21 from '../../img/EstanteSala1/21.png'
import estante22 from '../../img/EstanteSala1/22.png'
import estante23 from '../../img/EstanteSala1/23.png'
import estante24 from '../../img/EstanteSala1/24.png'
import estante25 from '../../img/EstanteSala1/25.png'

// ========================================
// COMPONENTE - ESTANTE SALA 1
// ========================================
// Componente que exibe a imagem de uma estante específica da Sala 1
// Recebe o número da estante como parâmetro de rota

const ESTANTES_IMAGENS: { [key: string]: string } = {
  '1': estante1,
  '2': estante2,
  '3': estante3,
  '4': estante4,
  '5': estante5,
  '6': estante6,
  '7': estante7,
  '8': estante8,
  '9': estante9,
  '10': estante10,
  '11': estante11,
  '12': estante12,
  '13': estante13,
  '14': estante14,
  '15': estante15,
  '16': estante16,
  '17': estante17,
  '18': estante18,
  '19': estante19,
  '20': estante20,
  '21': estante21,
  '22': estante22,
  '23': estante23,
  '24': estante24,
  '25': estante25,
}

export function EstanteSala1() {

  const [viewMode, setViewMode] = useState<'estante' | 'mapa'>('estante');



  const { numero } = useParams<{ numero: string }>()
  const imagem = numero ? ESTANTES_IMAGENS[numero] : null

  if (!imagem) {
    return (
     
        <div className={style.error}>
          <h2>Estante não encontrada</h2>
          <p>A estante número {numero} não existe na Sala 1.</p>
          <p>Estantes disponíveis: 1 a 25</p>
        </div>
      
    )
  }

  return (
    
    <div className={style.contentWrapper}>
  {/* Imagem da estante */}
  <div className={style.ContainerTitulo}>
    <h1 className={style.title}>Sala 1 </h1>
    <h2 className={style.title}>Estante {numero}</h2>
    <div className={style.tabButtons}>
  <button 
    onClick={() => setViewMode('estante')}
    className={` ${viewMode === 'estante' ? style.activeTab : ''}`}
  >
    📷 Estante
  </button>
  <button 
    onClick={() => setViewMode('mapa')}
    className={viewMode === 'mapa' ? style.activeTab : ''}
  >
    🗺️ Mapa
  </button>
</div>
  </div>
  {/* renderização CONDICIONAL  */}
 {viewMode === 'estante' ? (
  <img src={imagem} alt={`Estante ${numero}`} className={style.image} />
) : (
  <div className={style.mapContainer}>
    <img src={mapaSala1} alt="Mapa Sala 1" className={style.mapImage} />
    <div className={`${style.mapArrow} ${style[`arrow-estante-${numero}`]}`}></div>
  </div>
)}
    
       

</div>
    
  )
}
