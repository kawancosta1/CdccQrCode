import styles from "./style.module.css";

import espacoLudico from "../../img/Carrousel/espacoLudico.jpg";
import vestibular from "../../img/Carrousel/vestibular.jpg";
import arvore from "../../img/Carrousel/arvore.jpg";
import guiaManga from "../../img/Carrousel/guia_manga.jpg";
import sala1Espaco from "../../img/Carrousel/sala1Espaco.jpg";
import dedalus from "../../img/Dedalus.png"
import dedalus2 from "../../img/Dedalus2.png"
import dedalus3 from "../../img/Dedalus3.png"
import dedalus4 from "../../img/Dedalus4.png"
import dedalus5 from "../../img/Dedalus5.png"
import dedalus6 from "../../img/Dedalus6.png"


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
    setTimeout(() => setBlinkLeft(false), 500);
  }

  function blinkRightFox() {
    setBlinkRight(true);
    setTimeout(() => setBlinkRight(false), 500);
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carrouselImages.length);
    blinkRightFox();
    setAnimateRightButton(true);
    setTimeout(() => setAnimateRightButton(false), 600);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      (prev - 1 + carrouselImages.length) % carrouselImages.length
    );
    blinkLeftFox();
    setAnimateLeftButton(true);
    setTimeout(() => setAnimateLeftButton(false), 600);
  };

  const prev1 = (currentImageIndex - 1 + carrouselImages.length) % carrouselImages.length;
  const next1 = (currentImageIndex + 1) % carrouselImages.length;

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
              alt="Mascote Esquerda"
              className={`${styles.SegurandoSeta1} ${animateLeftButton ? styles.raposaAnimada : ''}`}
            />
          </div>

          {/* CARROSSEL */}
          <div className={styles.carouselViewport}>
            <div className={styles.CarrouselTrack}>
              {carrouselImages.map((image, index) => {
                let positionClass = styles.hidden;
                
                if (index === currentImageIndex) {
                  positionClass = styles.carrouselAtual;
                } else if (index === prev1) {
                  positionClass = styles.carrouselPrev1;
                } else if (index === next1) {
                  positionClass = styles.carrouselNext1;
                }

                return (
                  <img
                    key={index}
                    src={image}
                    alt={`Slide ${index}`}
                    className={`${styles.carrouselImg} ${positionClass}`}
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
              alt="Mascote Direita"
              className={`${styles.SegurandoSeta1} ${animateRightButton ? styles.raposaAnimada : ''}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.comoUsar}>
        <h2 className={styles.subtitulo}>Como usar o nosso buscador</h2>
        <div className={styles.containerDedalus}>
          <p className={styles.texto}>Primeiro, Acesse o <a href="https://dedalus.usp.br/" className={styles.linkDedalus} target="_blank" rel="noreferrer">Dedalus</a> e selecione a unidade no botão "Catálogo Geral"</p>
          <img src={dedalus} alt="Passo 1 Dedalus" className={styles.dedalus}/>
        </div>
       <div className={styles.containerDedalus}>
          <p className={styles.texto}>Após selecionar a unidade, procure o nome do livro ou o autor no campo de busca</p>
          <img src={dedalus2} alt="Passo 2 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Após digitar e apertar o enter na barra de pesquisa, selecione a opção que aparece a unidade que você deseja, como, por exemplo, o CDCC</p>
          <img src={dedalus3} alt="Passo 3 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Após selecionar o livro, copie o código</p>
          <img src={dedalus4} alt="Passo 4 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Logo após copiar o codigo, coloque esse codigo na barra de pesquisa do nosso site de <a href="#">buscas</a></p>
          <img src={dedalus4} alt="Passo 4 Dedalus" className={styles.dedalus}/>
         
        </div>

         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Logo após copiar o codigo, coloque esse codigo na barra de pesquisa do  site de <a href="#">buscas</a></p>
          <img src={dedalus5} alt="Passo 5 Dedalus" className={styles.dedalus}/>
         
        </div>
            <div className={styles.containerDedalus}>
          <p className={styles.texto}>Logo após copiar o codigo, coloque esse codigo na barra de pesquisa do  site de <a href="#">buscas</a></p>
          <img src={dedalus6} alt="Passo 5 Dedalus" className={styles.dedalus}/>
         
        </div>
        
        
        
        
      </div>
    </>
  );
}