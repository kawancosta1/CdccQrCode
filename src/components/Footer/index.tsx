import styles from "./style.module.css"


export function Footer(){
    return (
        <div className={styles.footer}>
            <p>© 2026 Kawan da Silva Costa - CDCC/USP</p>
            <p>Licenciado sob <a href="/LICENSE" target="_blank" rel="noopener noreferrer">Apache License 2.0</a></p>
        </div>
    )
}