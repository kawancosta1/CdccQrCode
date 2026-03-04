import { Container } from "../../Container";
import { MainTemplate } from "../../template/MainTemplate";
import styles from "./style.module.css"


export function Home(){

    return(
        <MainTemplate>
            <Container>
        <h1 className={styles.titulo}>Como utilizar o nosso buscador</h1>
          <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
            <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
              <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
               <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>

                <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
                 <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
                  <p className = {styles.p}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque labore minus aperiam eligendi, ullam exercitationem veritatis accusantium fugiat facilis molestiae cum accusamus officia quos quia optio iste ipsa. Suscipit, impedit.</p>
        </Container>
        </MainTemplate>

    )

}