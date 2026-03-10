import { Container } from "../../Container";
import styles from "./style.module.css";

import espacoLudico from "../../img/Carrousel/espacoLudico.jpg";
import vestibular from "../../img/Carrousel/vestibular.jpg";
import arvore from "../../img/Carrousel/arvore.jpg";
import guiaManga from "../../img/Carrousel/guia_manga.jpg";
import sala1Espaco from "../../img/Carrousel/sala1Espaco.jpg";

import { useState } from "react";

export function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carrouselImages = [
    espacoLudico,
    vestibular,
    arvore,
    guiaManga,
    sala1Espaco,
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carrouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + carrouselImages.length) % carrouselImages.length
    );
  };

  const getPrev1 = () =>
    (currentImageIndex - 1 + carrouselImages.length) % carrouselImages.length;

  const getNext1 = () =>
    (currentImageIndex + 1) % carrouselImages.length;

  const prev1 = getPrev1();
  const next1 = getNext1();

  return (
    <Container>
      <h1 className={styles.titulo}>Biblioteca CDCC</h1>
      <h2>Destaques</h2>

      <div className={styles.carrousel}>
        <button className={styles.botao} onClick={prevImage}>◀</button>

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

        <button className={styles.botao} onClick={nextImage}>▶</button>
      </div>
       <h2>Destaques</h2>
    </Container>
  );
}