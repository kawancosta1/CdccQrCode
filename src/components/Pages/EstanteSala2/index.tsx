import { useParams } from 'react-router-dom'

import style from './style.module.css'

import mapaSala2 from '../../img/MapaSala2.png'

// ========================================
// IMPORTAÇÕES DE IMAGENS - ESTANTES SALA 2
// ========================================
import estante1 from '../../img/EstanteSala2/1.png'
import estante2 from '../../img/EstanteSala2/2.png'
import estante3 from '../../img/EstanteSala2/3.png'
import estante4 from '../../img/EstanteSala2/4.png'
import estante5 from '../../img/EstanteSala2/5.png'
import estante6 from '../../img/EstanteSala2/6.png'
import estante7 from '../../img/EstanteSala2/7.png'
import estante8 from '../../img/EstanteSala2/8.png'
import estante9 from '../../img/EstanteSala2/9.png'
import estante10 from '../../img/EstanteSala2/10.png'
import estante11 from '../../img/EstanteSala2/11.png'
import estante12 from '../../img/EstanteSala2/12.png'

// ========================================
// COMPONENTE - ESTANTE SALA 2
// ========================================
// Componente que exibe a imagem de uma estante específica da Sala 2
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
}

export function EstanteSala2() {
  const { numero } = useParams<{ numero: string }>()
  const imagem = numero ? ESTANTES_IMAGENS[numero] : null

  if (!imagem) {
    return (
     
        <div className={style.error}>
          <h2>Estante não encontrada</h2>
          <p>A estante número {numero} não existe na Sala 2.</p>
          <p>Estantes disponíveis: 1 a 12</p>
        </div>
      
    )
  }

  return (
    
    <div className={style.contentWrapper}>
  {/* Imagem da estante */}
  <div className={style.ContainerTitulo}>
    <h1 className={style.title}>Sala 2 </h1>
    <h2 className={style.title}>Estante {numero}</h2>
  </div>
  <div className={style.imagens}>
     <img src={mapaSala2} alt="Mapa Sala 2" className={style.mapImage} />
        <div className={`${style.mapArrow} ${style[`arrow-estante-${numero}`]}`}>
      </div>
      <img src={imagem} alt={`Estante ${numero}`} className={style.image} />
    
      {/* Mapa com indicador */}
    
       
  </div>
</div>
    
  )
}
