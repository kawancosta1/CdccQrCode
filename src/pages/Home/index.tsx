import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import buscarLivros from "../../components/img/Carrousel/buscarLivros.png";
import espacoLudico from "../../components/img/Carrousel/espacoLudico.png";
import vestibular from "../../components/img/Carrousel/vestibular.png";
import dedalus from "../../components/img/Dedalus.png";
import dedalus2 from "../../components/img/Dedalus2.png";
import dedalus3 from "../../components/img/Dedalus3.png";
import dedalus4 from "../../components/img/Dedalus4.png";
import dedalus5 from "../../components/img/Dedalus5.png";
import dedalus6 from "../../components/img/Dedalus6.png";
import BentinhoPuxando2 from "../../components/img/Mascote/bentinhoPuxando.png";
import BentinhoPuxando from "../../components/img/Mascote/bentinhoPuxando2.png";
import BentinhoPuxandoSono from "../../components/img/Mascote/bentinhoPuxandoSono.png";
import BentinhoPuxandoSono2 from "../../components/img/Mascote/bentinhoPuxandoSono2.png";
import BentinhoPensando from "../../components/img/Mascote/pensando.png";
import BentinhoPensando2 from "../../components/img/Mascote/pensando2.png";
import styles from "./style.module.css";

const CARROUSEL_IMAGES = [buscarLivros, espacoLudico, vestibular];

const DEDALUS_STEPS = [
  {
    src: dedalus,
    alt: "Passo 1 Dedalus",
    content: (
      <>
        Primeiro, acesse o{" "}
        <a
          href="https://dedalus.usp.br/"
          className={styles.linkDedalus}
          target="_blank"
          rel="noreferrer"
        >
          Dedalus
        </a>{" "}
        e clique no botão &quot;Catálogo Geral&quot; para selecionar a unidade
      </>
    ),
  },
  {
    src: dedalus2,
    alt: "Passo 2 Dedalus",
    content: "Após selecionar a unidade, pesquise pelo nome do livro ou pelo nome do autor",
  },
  {
    src: dedalus3,
    alt: "Passo 3 Dedalus",
    content: "Nos resultados da busca, selecione o livro desejado e verifique se a unidade é o CDCC",
  },
  {
    src: dedalus4,
    alt: "Passo 4 Dedalus",
    content: "Na página do livro, localize e copie o código de classificação",
  },
  {
    src: dedalus5,
    alt: "Passo 5 Dedalus",
    content: "Cole o código na barra de pesquisa do nosso site e pressione Enter",
  },
  {
    src: dedalus6,
    alt: "Passo 6 Dedalus",
    content: "O resultado mostra a estante e uma foto indicando a porção onde o livro está localizado",
  },
];

export function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blinkLeft, setBlinkLeft] = useState(false);
  const [blinkRight, setBlinkRight] = useState(false);
  const [animateLeftButton, setAnimateLeftButton] = useState(false);
  const [animateRightButton, setAnimateRightButton] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timeoutsRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const scheduleTimeout = (callback: () => void, delayMs: number) => {
    const id = window.setTimeout(callback, delayMs);
    timeoutsRef.current.push(id);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % CARROUSEL_IMAGES.length);
    setBlinkRight(true);
    setAnimateRightButton(true);
    scheduleTimeout(() => setBlinkRight(false), 500);
    scheduleTimeout(() => setAnimateRightButton(false), 600);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + CARROUSEL_IMAGES.length) % CARROUSEL_IMAGES.length,
    );
    setBlinkLeft(true);
    setAnimateLeftButton(true);
    scheduleTimeout(() => setBlinkLeft(false), 500);
    scheduleTimeout(() => setAnimateLeftButton(false), 600);
  };

  const prev1 = (currentImageIndex - 1 + CARROUSEL_IMAGES.length) % CARROUSEL_IMAGES.length;
  const next1 = (currentImageIndex + 1) % CARROUSEL_IMAGES.length;

  return (
    <>
      <h1 className={styles.titulo}>Destaques</h1>

      <div className={styles.carrouselBackground}>
        <div className={styles.carrousel}>
          {/* RAPOSA ESQUERDA */}
          <div className={styles.mascoteCorda1}>
            <button
              className={`${styles.botao} ${animateLeftButton ? styles.botaoAnimado : ""}`}
              onClick={prevImage}
            >
              ◀
            </button>
            <img
              src={blinkLeft ? BentinhoPuxandoSono2 : BentinhoPuxandoSono}
              alt="Mascote Esquerda"
              className={`${styles.BentinhoPuxando} ${animateLeftButton ? styles.raposaAnimada : ""}`}
            />
          </div>

          {/* CARROSSEL */}
          <div className={styles.carouselViewport}>
            <div className={styles.CarrouselTrack}>
              {CARROUSEL_IMAGES.map((image, index) => {
                let positionClass = styles.hidden;

                if (index === currentImageIndex) {
                  positionClass = styles.carrouselAtual;
                } else if (index === prev1) {
                  positionClass = styles.carrouselPrev1;
                } else if (index === next1) {
                  positionClass = styles.carrouselNext1;
                }

                const img = (
                  <img
                    src={image}
                    alt={`Slide ${index}`}
                    className={`${styles.carrouselImg} ${positionClass}`}
                  />
                );

                if (image === espacoLudico) {
                  return (
                    <Link key={index} to="/espacoludico">
                      {img}
                    </Link>
                  );
                }

                if (image === buscarLivros) {
                  return (
                    <a
                      key={index}
                      href="https://dedalus.usp.br/F"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      {img}
                    </a>
                  );
                }

                return <div key={index}>{img}</div>;
              })}
            </div>
          </div>

          {/* RAPOSA DIREITA */}
          <div className={styles.mascoteCorda2}>
            <button
              className={`${styles.botao} ${animateRightButton ? styles.botaoAnimado : ""}`}
              onClick={nextImage}
            >
              ▶
            </button>
            <img
              src={blinkRight ? BentinhoPuxando : BentinhoPuxando2}
              alt="Mascote Direita"
              className={`${styles.BentinhoPuxando} ${animateRightButton ? styles.raposaAnimada : ""}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.comoUsar}>
        <span className={styles.linha}> </span>
        <div className={styles.subtitulo}>
          <div>
            <img src={BentinhoPensando2} alt="" className={styles.BentinhoPensando2} />
          </div>
          <div>
            <h2>Como utilizar o nosso buscador </h2>
          </div>
          <div>
            <img src={BentinhoPensando} alt="" className={styles.BentinhoPensando} />
          </div>
        </div>
        <span className={styles.linha}> </span>

        {DEDALUS_STEPS.map((step) => (
          <div key={step.alt} className={styles.containerDedalus}>
            <p className={styles.texto}>{step.content}</p>
            <img
              src={step.src}
              alt={step.alt}
              className={styles.dedalus}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </>
  );
}
