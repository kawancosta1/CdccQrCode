import { useParams } from 'react-router-dom'
import { useState } from 'react'
import style from './style.module.css'
import type { Sala } from '../../../data/salas'

type EstanteSalaProps = {
  sala: Sala;
};

export function Estante({ sala }: EstanteSalaProps) {
  const [viewMode, setViewMode] = useState<'estante' | 'mapa'>('estante')

  const { numero } = useParams<{ numero: string }>()
  const imagem = numero ? sala.estantes[numero] : null
  const seta = numero ? sala.setas[numero] : undefined
  const totalEstantes = Object.keys(sala.estantes).length

  if (!imagem) {
    return (
      <div className={style.error}>
        <h2>Estante não encontrada</h2>
        <p>A estante número {numero} não existe na {sala.nome}.</p>
        <p>Estantes disponíveis: 1 a {totalEstantes}</p>
      </div>
    )
  }

  return (
    <div className={style.contentWrapper}>
      <div className={style.ContainerTitulo}>
        <h1 className={style.title}>{sala.nome}</h1>
        <h2 className={style.title}>Estante {numero}</h2>
        <div className={style.tabButtons}>
          <button
            onClick={() => setViewMode('estante')}
            className={viewMode === 'estante' ? style.activeTab : ''}
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

      {viewMode === 'estante' ? (
        <img src={imagem} alt={`Estante ${numero}`} className={style.image} />
      ) : (
        <div className={style.mapContainer}>
          <img src={sala.mapa} alt={`Mapa ${sala.nome}`} className={style.mapImage} />
          {seta && <div className={style.mapArrow} style={seta}></div>}
        </div>
      )}
    </div>
  )
}
