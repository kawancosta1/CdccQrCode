
import styles from './style.module.css'
import { Link } from 'react-router-dom'
type Props = {
titulo: string;
paragrafo: string;
route: string;
imagem: string;

}

export function CardJogo({titulo, paragrafo,route,imagem}: Props){


    return (
<>
  <div className={styles.jogos}>
                   <h1 className={styles.title}>{titulo}</h1>
                   <p className={styles.paragrafo}>{paragrafo}
                         
                   </p>
                    <Link to = {route}><img src = {imagem} className ={styles.foto} alt=""/></Link>
               </div>


</>
)

}