import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Clock,
  Gamepad2,
  GraduationCap,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Container } from "../../components/Container";
import { useBookSearchContext } from "../../context/bookSearchStore";
import styles from "./style.module.css";

const IDLE_TIMEOUT_SECONDS = 45;

const THEMATIC_TRACKS = [
  { code: "530", title: "Física" },
  { code: "520", title: "Astronomia" },
  { code: "510", title: "Matemática" },
  { code: "570", title: "Biologia" },
  { code: "540", title: "Química" },
  { code: "869.3", title: "Literatura Brasileira" },
] as const;

const SURPRISE_CODES = ["520", "530", "510", "570", "540", "869.3 C500", "809.89283 A", "R"];

export function Totem() {
  const { searchValue, handleSearchChange, submitSearch, clearSearch } = useBookSearchContext();
  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIMEOUT_SECONDS);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const resetSession = useCallback(() => {
    clearSearch();
    setSecondsLeft(IDLE_TIMEOUT_SECONDS);
  }, [clearSearch]);

  useEffect(() => {
    let active = true;
    const url = window.location.href;
    QRCode.toDataURL(url, { width: 260, margin: 1 })
      .then((data) => {
        if (active) setQrDataUrl(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [searchValue]);

  useEffect(() => {
    const bumpActivity = () => setSecondsLeft(IDLE_TIMEOUT_SECONDS);
    window.addEventListener("pointerdown", bumpActivity, { passive: true });
    window.addEventListener("keydown", bumpActivity);

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearSearch();
          return IDLE_TIMEOUT_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("pointerdown", bumpActivity);
      window.removeEventListener("keydown", bumpActivity);
      window.clearInterval(interval);
    };
  }, [clearSearch]);

  const handleSurprise = () => {
    const pick = SURPRISE_CODES[Math.floor(Math.random() * SURPRISE_CODES.length)];
    submitSearch(pick);
  };

  return (
    <Container>
      <div className={styles.totemShell}>
        <header className={styles.topBar}>
          <div className={styles.brandGroup}>
            <span className={styles.kioskBadge}>
              <Sparkles size={14} aria-hidden="true" />
              Modo Totem • Biblioteca CDCC-USP
            </span>
            <h1 className={styles.heading}>Onde está o livro?</h1>
          </div>

          <div className={styles.controlsGroup}>
            <span className={styles.timerPill} aria-live="off">
              <Clock size={14} aria-hidden="true" />
              Reinício auto: {secondsLeft}s
            </span>
            <button type="button" className={styles.resetBtn} onClick={resetSession}>
              <RotateCcw size={14} aria-hidden="true" />
              Limpar tela
            </button>
            <Link to="/" className={styles.exitBtn}>
              <ArrowLeft size={14} aria-hidden="true" />
              Portal normal
            </Link>
          </div>
        </header>

        <div className={styles.mainGrid}>
          <section className={styles.searchCard} aria-label="Busca rápida no totem">
            <form
              className={styles.searchForm}
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(searchValue);
              }}
            >
              <label htmlFor="totem-search-input" className="sr-only">
                Digite o título, autor ou código CDU
              </label>
              <input
                id="totem-search-input"
                type="search"
                className={styles.bigInput}
                placeholder="Digite título, autor ou código CDU (ex: 530)"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <button type="submit" className={styles.bigSubmitBtn}>
                <Search size={19} aria-hidden="true" />
                Localizar
              </button>
            </form>

            <h2 className={styles.sectionLabel}>Trilhas Temáticas Rápidas</h2>
            <div className={styles.tilesGrid}>
              {THEMATIC_TRACKS.map((track) => (
                <button
                  key={track.code}
                  type="button"
                  className={styles.tileBtn}
                  onClick={() => submitSearch(track.code)}
                >
                  <span className={styles.tileCode}>CDU {track.code}</span>
                  <span className={styles.tileTitle}>{track.title}</span>
                </button>
              ))}
              <Link to="/espacoludico" className={styles.tileBtn}>
                <span className={styles.tileCode}>
                  <Gamepad2 size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Sala 3
                </span>
                <span className={styles.tileTitle}>Espaço Lúdico</span>
              </Link>
              <Link to="/vestibular" className={styles.tileBtn}>
                <span className={styles.tileCode}>
                  <GraduationCap size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  FUVEST / UNICAMP
                </span>
                <span className={styles.tileTitle}>Vestibular</span>
              </Link>
            </div>

            <button type="button" className={styles.surpriseBtn} onClick={handleSurprise}>
              <Shuffle size={17} aria-hidden="true" />
              Me surpreenda com uma estante!
            </button>
          </section>

          <aside className={styles.qrCard} aria-label="Levar rota no celular">
            <h2 className={styles.qrTitle}>Leve a rota no seu celular</h2>
            <p className={styles.qrDesc}>
              Aponte a câmera do seu celular para abrir esta página com o Mapa 3D diretamente no seu aparelho.
            </p>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code para abrir a rota no celular"
                className={styles.qrImage}
              />
            )}
          </aside>
        </div>
      </div>
    </Container>
  );
}
