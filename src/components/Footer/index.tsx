import { Link } from "react-router-dom";
import styles from "./style.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.copy}>
          © 2026 Kawan da Silva Costa — Biblioteca do CDCC / USP São Carlos
        </p>
        <p className={styles.license}>
          Licenciado sob{" "}
          <a
            href={`${import.meta.env.BASE_URL}LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Apache License 2.0
          </a>{" "}
          ·{" "}
          <Link to="/admin" className={styles.link}>
            Área Administrativa
          </Link>
        </p>
      </div>
    </footer>
  );
}
