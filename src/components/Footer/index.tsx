import { Link } from "react-router-dom";
import { useSiteConfig } from "../../context/siteConfigStore";
import styles from "./style.module.css";

export function Footer() {
  const { config } = useSiteConfig();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.copy}>
          © 2026 {config.footerText}
        </p>
        <p className={styles.license}>
          {config.footerLinkUrl && (
            <>
              <a
                href={config.footerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {config.footerLinkLabel || "Portal Oficial"}
              </a>{" "}
              ·{" "}
            </>
          )}
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
