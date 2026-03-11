
import styles from "./style.module.css";

import espacoLudico from "../../img/Carrousel/espacoLudico.jpg";
import vestibular from "../../img/Carrousel/vestibular.jpg";
import arvore from "../../img/Carrousel/arvore.jpg";
import guiaManga from "../../img/Carrousel/guia_manga.jpg";
import sala1Espaco from "../../img/Carrousel/sala1Espaco.jpg";

import SegurandoSeta1 from "../../img/Mascote/SegurandoSeta1.png";
import SegurandoSeta2 from "../../img/Mascote/SegurandoSeta2.png";

import { useState } from "react";

export function Home() {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [blinkLeft, setBlinkLeft] = useState(false);
  const [blinkRight, setBlinkRight] = useState(false);
  
  const [animateLeftButton, setAnimateLeftButton] = useState(false);
  const [animateRightButton, setAnimateRightButton] = useState(false);

  const carrouselImages = [
    espacoLudico,
    vestibular,
    arvore,
    guiaManga,
    sala1Espaco
  ];

  function blinkLeftFox() {
    setBlinkLeft(true);

    setTimeout(() => {
      setBlinkLeft(false);
    }, 500);
  }

  function blinkRightFox() {
    setBlinkRight(true);

    setTimeout(() => {
      setBlinkRight(false);
    }, 500);
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carrouselImages.length);
    blinkRightFox();
    setAnimateRightButton(true);
    setTimeout(() => {
      setAnimateRightButton(false);
    }, 600);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + carrouselImages.length) % carrouselImages.length
    );
    blinkLeftFox();
    setAnimateLeftButton(true);
    setTimeout(() => {
      setAnimateLeftButton(false);
    }, 600);
  };

  const getPrev1 = () =>
    (currentImageIndex - 1 + carrouselImages.length) % carrouselImages.length;

  const getNext1 = () =>
    (currentImageIndex + 1) % carrouselImages.length;

  const prev1 = getPrev1();
  const next1 = getNext1();

  return (
   <>
      <h1 className={styles.titulo}>Destaques</h1>
      

      <div className={styles.carrouselBackground}>
        <div className={styles.carrousel}>
          {/* RAPOSA ESQUERDA */}
          <div className={styles.mascoteCorda1}>
            <button
              className={`${styles.botao} ${animateLeftButton ? styles.botaoAnimado : ''}`}
              onClick={prevImage}
            >
              ◀
            </button>
            <img
              src={blinkLeft ? SegurandoSeta2 : SegurandoSeta1}
              alt="Mascote"
              className={`${styles.SegurandoSeta1} ${animateLeftButton ? styles.raposaAnimada : ''}`}
            />
          </div>
          {/* CARROSSEL */}
          <div className={styles.carouselViewport}>
            <div className={styles.CarrouselTrack}>
              {carrouselImages.map((image, index) => {
                let className = styles.carrouselImg;
                if (index === currentImageIndex) {
                  className += ` ${styles.carrouselAtual}`;
                }
                else if (index === prev1) {
                  className += ` ${styles.carrouselPrev1}`;
                }
                else if (index === next1) {
                  className += ` ${styles.carrouselNext1}`;
                }
                else {
                  className += ` ${styles.hidden}`;
                }
                return (
                  <img
                    key={index}
                    src={image}
                    alt={`Slide ${index}`}
                    className={className}
                  />
                );
              })}
            </div>
          </div>
          {/* RAPOSA DIREITA */}
          <div className={styles.mascoteCorda2}>
            <button
              className={`${styles.botao} ${animateRightButton ? styles.botaoAnimado : ''}`}
              onClick={nextImage}
            >
              ▶
            </button>
            <img
              src={blinkRight ? SegurandoSeta2 : SegurandoSeta1}
              alt="Mascote"
              className={`${styles.SegurandoSeta1} ${animateRightButton ? styles.raposaAnimada : ''}`}
            />
          </div>
        </div>
      </div>
      

      <h2>Destaques</h2>
      </>
    
  );
}