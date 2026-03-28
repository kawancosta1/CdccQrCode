import styles from "./style.module.css";

import { Link } from 'react-router-dom'
import espacoLudico from "../../img/Carrousel/espacoLudico.png";
import vestibular from "../../img/Carrousel/vestibular.png";
// import arvore from "../../img/Carrousel/arvore.jpg";
// import guiaManga from "../../img/Carrousel/guia_manga.jpg";
import buscarLivros from "../../img/Carrousel/buscarLivros.png";
// import sala1Espaco from "../../img/Carrousel/sala1Espaco.jpg";
import dedalus from "../../img/Dedalus.png"
import dedalus2 from "../../img/Dedalus2.png"
import dedalus3 from "../../img/Dedalus3.png"
import dedalus4 from "../../img/Dedalus4.png"
import dedalus5 from "../../img/Dedalus5.png"
import dedalus6 from "../../img/Dedalus6.png"


import BentinhoPuxando from "../../img/Mascote/bentinhoPuxando2.png";
import BentinhoPuxando2 from "../../img/Mascote/bentinhoPuxando.png";
import BentinhoPensando from "../../img/Mascote/pensando.png";
import BentinhoPensando2 from "../../img/Mascote/pensando2.png";
import BentinhoPuxandoSono from "../../img/Mascote/bentinhoPuxandoSono.png";
import BentinhoPuxandoSono2 from "../../img/Mascote/bentinhoPuxandoSono2.png";


import { useState } from "react";

export function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blinkLeft, setBlinkLeft] = useState(false);
  const [blinkRight, setBlinkRight] = useState(false);
  const [animateLeftButton, setAnimateLeftButton] = useState(false);
  const [animateRightButton, setAnimateRightButton] = useState(false);

  const carrouselImages = [
    buscarLivros,
    espacoLudico,
    vestibular,
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
              src={blinkLeft ? BentinhoPuxandoSono2 : BentinhoPuxandoSono}
              alt="Mascote Esquerda"
              className={`${styles.BentinhoPuxando} ${animateLeftButton ? styles.raposaAnimada : ''}`}
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

                const img = (
                  <img
                    src={image}
                    alt={`Slide ${index}`}
                    className={`${styles.carrouselImg} ${positionClass}`}
                  />
                );

                // Se for buscarLivros, envolva com link
                if (image === espacoLudico) {
                  return (
                   <Link key={index} to = "/EspacoLudico">
                   {img}</Link>
                    
                  );
                }
                if (image === buscarLivros) {
                  return (
                    <a 
                      key={index} 
                      href="https://dedalus.usp.br/F" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      {img}
                    </a>
                  );
                }

                return (
                  <div key={index}>
                    {img}
                  </div>
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
              src={blinkRight ? BentinhoPuxando : BentinhoPuxando2}
              alt="Mascote Direita"
              className={`${styles.BentinhoPuxando} ${animateRightButton ? styles.raposaAnimada : ''}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.comoUsar}>
        <span className={styles.linha}> </span>
        <div className={`${styles.subtitulo}`}>
          <div><img src={BentinhoPensando2} alt="" className={styles.BentinhoPensando2} /></div>
         <div>
           <h2>Como utilizar o nosso buscador </h2>
         </div><div><img src={BentinhoPensando} alt="" className={styles.BentinhoPensando} /> </div></div>
         <span className={styles.linha}> </span>
        <div className={styles.containerDedalus}>
          <p className={styles.texto}>Primeiro, acesse o <a href="https://dedalus.usp.br/" className={styles.linkDedalus} target="_blank" rel="noreferrer">Dedalus</a> e clique no botao "Catalogo Geral" para selecionar a unidade</p>
          <img src={dedalus} alt="Passo 1 Dedalus" className={styles.dedalus}/>
        </div>
       <div className={styles.containerDedalus}>
          <p className={styles.texto}>Apos selecionar a unidade, pesquise pelo nome do livro ou pelo nome do autor</p>
          <img src={dedalus2} alt="Passo 2 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Nos resultados da busca, selecione o livro desejado e verifique se a unidade e o CDCC</p>
          <img src={dedalus3} alt="Passo 3 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Na pagina do livro, localize e copie o codigo de classificacao</p>
          <img src={dedalus4} alt="Passo 4 Dedalus" className={styles.dedalus}/>
        </div>
         <div className={styles.containerDedalus}>
          <p className={styles.texto}>Cole o codigo na barra de pesquisa do nosso site e pressione Enter</p>
          <img src={dedalus5} alt="Passo 5 Dedalus" className={styles.dedalus}/>
         
        </div>

         <div className={styles.containerDedalus}>
          <p className={styles.texto}>O resultado mostra a estante e uma foto indicando a porção onde o livro esta localizado</p>
          <img src={dedalus6} alt="Passo 6 Dedalus" className={styles.dedalus}/>
         
        </div>

        
        
        
        
      </div>
    </>
  );
}