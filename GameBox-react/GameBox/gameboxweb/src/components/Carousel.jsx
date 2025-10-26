import { useState, useEffect, useRef } from 'react';
import '../styles/Carousel.css';

import img1 from '../img/background.png';
import img2 from '../img/backgroundMine.png';
import img3 from '../img/bgHK.png';

function Carousel() {
  const imagens = [img1, img2, img3];
  const [indexAtual, setIndexAtual] = useState(0);
  const intervaloRef = useRef(null);
  const timeTroca = 5000; // tempo em milissegundos

  // Função para iniciar o timer
  const iniciarIntervalo = () => {
    intervaloRef.current = setInterval(() => {
      setIndexAtual(prev => (prev + 1) % imagens.length);
    }, timeTroca);
  };

  // Função para reiniciar o timer
  const reiniciarIntervalo = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    iniciarIntervalo();
  };

  useEffect(() => {
    iniciarIntervalo();

    return () => clearInterval(intervaloRef.current); // limpa ao desmontar
  }, []);

  const irProximo = () => {
    setIndexAtual((indexAtual + 1) % imagens.length);
    reiniciarIntervalo();
  };

  const irAnterior = () => {
    setIndexAtual((indexAtual - 1 + imagens.length) % imagens.length);
    reiniciarIntervalo();
  };

  return (
    <div className="carousel-container">
      {imagens.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Imagem ${i + 1}`}
          className={`carousel-imagem ${i === indexAtual ? 'atual' : ''}`}
        />
      ))}

      <button className="btn anterior" onClick={irAnterior}>‹</button>
      <button className="btn proximo" onClick={irProximo}>›</button>
    </div>
  );
}

export default Carousel;