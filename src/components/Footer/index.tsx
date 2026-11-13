import { useSiteConfig } from "../../context/siteConfigStore";
import { HighlighterLink } from "../editorial";
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
              <HighlighterLink
                href={config.footerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {config.footerLinkLabel || "Portal Oficial"}
              </HighlighterLink>{" "}
              ·{" "}
            </>
          )}
          <HighlighterLink
            href={`${import.meta.env.BASE_URL}LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            tone="mint"
            className={styles.link}
          >
            Apache License 2.0
          </HighlighterLink>{" "}
          ·{" "}
          <HighlighterLink to="/admin" tone="pink" className={styles.link}>
            Área Administrativa
          </HighlighterLink>
        </p>
      </div>
    </footer>
  );
}
