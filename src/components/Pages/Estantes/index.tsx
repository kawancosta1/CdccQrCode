import { Link } from "react-router-dom"
import { Container } from "../../Container"
import style from './styles.module.css'

export function Estantes(){
  return (
    <Container>           
      <h1>Sala 2 - Estantes</h1>
      <p>Selecione uma estante para visualizar as classificações:</p>
      
      <div className={style.gridEstantes}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((numero) => (
          <Link key={numero} to={`/estantes/sala2/${numero}`} className={style.linkEstante}>
            <div className={style.buttonEstante}>
              Estante {numero}
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}