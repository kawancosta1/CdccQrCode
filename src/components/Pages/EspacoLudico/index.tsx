
import styles from './style.module.css'
import xadrez from '../../img/Ludico/xadrez.jpg'
import ludo from '../../img/Ludico/ludo.jpg'
import batalhaNaval from '../../img/Ludico/batalhaNaval.jpg'

export function EspacoLudico(){

    return (

        <>

      <div className={styles.container}>
          
               <div className={styles.xadrez}>
                   <h1 className={styles.title}>Xadrex</h1>
                   <p className={styles.paragrafo}>O xadrez é um jogo de estratégia para dois jogadores, jogado em um tabuleiro de 64 casas. Cada jogador controla peças com movimentos específicos, como torre, bispo e cavalo, com o objetivo de dar “xeque-mate” no rei adversário. Não envolve sorte, apenas planejamento, lógica e antecipação de jogadas.
                          
                   </p>
                    <img src = {xadrez} alt="" className={styles.jogos}/>
               </div>
               <div className={styles.ludo}>
                   <h1 className={styles.title}>Ludo</h1>
                   <p className={styles.paragrafo}>
                      O Ludo é um jogo de tabuleiro para até quatro jogadores, em que cada um tenta levar suas peças do início até o centro do tabuleiro. Os movimentos são determinados pelo lançamento de dados, o que introduz sorte no jogo. Vence quem conseguir levar todas as suas peças ao destino primeiro.
                       
                   </p>
                    <img src = {ludo} alt=""  className={styles.jogos}/>
               </div>
                  <div className={styles.batalhaNaval}>
                   <h1 className={styles.title}>Batalha naval</h1>
                   <p className={styles.paragrafo}>
                     Batalha Naval é um jogo para dois jogadores baseado em dedução e estratégia. Cada jogador posiciona seus navios em um tabuleiro oculto e tenta adivinhar a localização dos navios adversários por meio de coordenadas. O objetivo é afundar toda a frota do oponente antes que ele faça o mesmo.
                       
                   </p>
                    <img src = {batalhaNaval} alt=""  className={styles.jogos}/>
               </div>
             
      </div>
        
        </>

    )

}