import { useState, useEffect, useRef } from 'react';
import '../styles/Carousel.css';

// Imagens do carrossel
import img1 from '../img/background.png';
import img2 from '../img/backgroundMine.png';
import img3 from '../img/hk.jpg';
import img4 from '../img/celeste.webp';
import img5 from '../img/ds.jpg';

function Carousel() {
  const imagens = [img1, img2, img3, img4, img5];//array de imagens do carrossel
  const [indexAtual, setIndexAtual] = useState(0);// Estado que controla qual imagem está sendo exibida no momento
  const intervaloRef = useRef(null);// useRef armazena o ID do intervalo (setInterval), permitindo parar ou reiniciar o timer
  const timeTroca = 5000; // tempo em milissegundos

  // Função para iniciar o timer
  const iniciarIntervalo = () => {
    intervaloRef.current = setInterval(() => {
      // Atualiza o índice atual ciclicamente (volta ao início após a última imagem)
      setIndexAtual(prev => (prev + 1) % imagens.length);
    }, timeTroca);
  };

  // Função para reiniciar o timer
  const reiniciarIntervalo = () => {
    // Serve para reiniciar a contagem quando o usuário navega manualmente
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    iniciarIntervalo();
  };

  useEffect(() => {
    iniciarIntervalo(); // inicia a troca automática de imagens

    return () => clearInterval(intervaloRef.current); // Retorna uma função de limpeza que remove o timer ao desmontar o componente
  }, []);

  // --- Função para ir para a próxima imagem manualmente ---
  const irProximo = () => {
    setIndexAtual((indexAtual + 1) % imagens.length);// avança ciclicamente
    reiniciarIntervalo();// reinicia o timer
  };

  // --- Função para voltar à imagem anterior manualmente ---
  const irAnterior = () => {
    // Usa soma com imagens.length para evitar números negativos
    setIndexAtual((indexAtual - 1 + imagens.length) % imagens.length);
    reiniciarIntervalo();// reinicia o timer
  };

  return (
    <div className="carousel-container">
      {/* Renderiza todas as imagens, aplicando a classe 'atual' apenas na imagem visível */}
      {imagens.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Imagem ${i + 1}`}
          className={`carousel-imagem ${i === indexAtual ? 'atual' : ''}`}
        />
      ))}

      {/* Botões de navegação manual (anterior e próximo) */}
      <button className="btn anterior" onClick={irAnterior}>‹</button>
      <button className="btn proximo" onClick={irProximo}>›</button>
    </div>
  );
}

export default Carousel;