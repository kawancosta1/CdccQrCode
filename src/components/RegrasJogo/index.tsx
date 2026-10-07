import styles from './style.module.css'

type RegrasJogoProps = {
  titulo: string;
  regras: string;
};


export function RegrasJogo({ titulo, regras }: RegrasJogoProps){

    return (
    <>
    
        <h1 className={styles.title}>{titulo}</h1>
        <p>{regras}</p>
        <p>boa sorte</p>

    
    </>
    )

}