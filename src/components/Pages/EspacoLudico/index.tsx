
import styles from './style.module.css'

import xadrez from '../../img/Ludico/xadrez.jpg'
import ludo from '../../img/Ludico/ludo.jpg'
import batalhaNaval from '../../img/Ludico/batalhaNaval.jpg'
import { CardJogo } from '../CardJogo'

const jogos  = [
    {
        titulo: "Xadrez",
        paragrafo: "O xadrez é um jogo de tabuleiro estratégico jogado entre dois jogadores. Cada jogador controla um conjunto de peças, cada uma com movimentos específicos, e o objetivo é capturar o rei do oponente.",
        route: "/espacoludico/xadrez",
        imagem: xadrez

    },{
        titulo: "Ludo",
        paragrafo: "O ludo é um jogo de tabuleiro para crianças, onde os jogadores lançam dados e movem peças ao redor de um tabuleiro.",
        route: "/espacoludico/ludo",
        imagem: ludo

    }
    ,{
        titulo: "Batalha Naval",
        paragrafo: "O batalha naval é um jogo de tabuleiro onde os jogadores tentam afundar os navios do oponente.",
        route: "/espacoludico/batalha",
        imagem: batalhaNaval
    }
]
export function EspacoLudico(){

    return (

        <>

      <div className={styles.container}>
        {jogos.map((jogo) => (
            <CardJogo 
                key={jogo.titulo}
                titulo={jogo.titulo}
                paragrafo={jogo.paragrafo}
                route={jogo.route}
                imagem={jogo.imagem}
            />
        ))}
             
      </div>
        
        </>

    )

}