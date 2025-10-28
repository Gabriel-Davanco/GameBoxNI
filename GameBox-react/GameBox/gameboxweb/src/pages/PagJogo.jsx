// src/pages/PagJogo.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PagJogo.css';
import personaCapa from '../img/persona.png';

const DEFAULT_DESCRIPTION = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse maximus nibh aliquam, faucibus elit non, dictum nunc. Nam egestas aliquet nisl, in suscipit lorem dapibus at. Quisque eu gravida libero, sit amet mollis dolor. Nullam iaculis massa gravida mi consequat, et auctor ligula aliquet. Cras lacus urna, tempor ut gravida in, rutrum id nisi. Proin mollis quis nunc a accumsan. Quisque aliquam tempor sodales. Cras dignissim, eros vel posuere tincidunt, metus justo posuere tortor, in tempor enim augue ut odio. Donec venenatis in nisi sit amet tincidunt.

Aenean nec mi nec augue vestibulum ornare. Phasellus augue sapien, convallis et tincidunt eget, congue non nisl. Morbi placerat quam non metus feugiat, quis posuere turpis pretium. Vivamus et vestibulum nibh. Donec posuere nisi non diam scelerisque tempor. Pellentesque arcu ligula, viverra sit amet vestibulum non, viverra vitae nunc. Etiam feugiat lacus velit, eget convallis lacus pellentesque non. Phasellus eget vestibulum eros. Ut porttitor justo eu tellus posuere varius. Nullam in nunc consectetur arcu suscipit tincidunt. Nulla tincidunt imperdiet congue.

Duis ut cursus ligula. Vestibulum faucibus pretium commodo. Morbi arcu est, lacinia at scelerisque eget, lacinia et nisl. Morbi sit amet ante eget leo finibus tincidunt vitae sit amet orci. Aliquam vel tellus ac mi fringilla ultricies. Aenean placerat ultrices leo, tempus venenatis urna sodales et. Nunc pellentesque vitae arcu non iaculis. Fusce tincidunt risus sed purus rhoncus, fringilla vehicula urna fermentum. Aliquam venenatis dui eget purus tristique, at ultrices tortor imperdiet.
`.trim();

function PagJogo() {
  const { id } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/jogos/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Jogo não encontrado');
        return response.json();
      })
      .then(data => {
        setGameData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToLibrary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/biblioteca/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jogo_id: id }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.mensagem || 'Jogo adicionado com sucesso!');
      } else {
        alert(data.erro || 'Erro ao adicionar o jogo.');
      }
    } catch (err) {
      alert('Erro de conexão ao adicionar o jogo.');
    }
  };

  if (loading) return <div className="Body">Carregando...</div>;
  if (error) return <div className="Body">{error}</div>;

  // descrição: usa a do banco se existir; senão, usa a DEFAULT_DESCRIPTION
  const descricaoToShow = (gameData?.descricao && gameData.descricao.trim().length > 0)
    ? gameData.descricao
    : DEFAULT_DESCRIPTION;

  // plataformas (string "PC, PS4" -> array)
  const plataformas = (gameData?.plataforma || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="Body">
      <section className="GameContainer">
        {/* Coluna Principal */}
        <div className="MainContent">
          {/* Imagem e Plataformas */}
          <div className="ImageAndPlatforms">
            <img
              src={gameData.image_url || personaCapa}
              alt={gameData.nome_jogo}
              className="GameCover"
            />

            <div className="PlatformsCard">
              <h3>Plataformas</h3>
              <ul>
                {plataformas.length
                  ? plataformas.map((platform, index) => (
                    <li key={index}>
                      <span className="PlatformEmoji">🎮</span>{platform}
                    </li>
                  ))
                  : <li>—</li>}
              </ul>
            </div>
          </div>

          {/* Texto e Avaliações */}
          <div className="GameText">
            <div className="TitleAndRelease">
              <h2>{gameData.nome_jogo}</h2>
              <p className="release">{gameData.ano_lancamento ?? '—'}</p>
            </div>

            {/* Botão de Adicionar à Biblioteca */}
            <button onClick={handleAddToLibrary} className="btn-add-library">
              ➕ Adicionar à Biblioteca
            </button>

            {/* Descrição (multi-parágrafo) */}
            {descricaoToShow.split('\n\n').map((para, i) => (
              <p key={i} className="content">{para}</p>
            ))}

            {/* Reviews simuladas (mantidas) */}
            <section className="RecentReviewsContainer">
              <h1>Recent Reviews</h1>

              <div className="RecentReview">
                <div className="ReviewText">
                  <p className="author">
                    por <strong>Brunão da Massa</strong> • há 5 horas
                  </p>
                  <p className="content">
                    Esse jogo me surpreendeu positivamente! Jogabilidade fluida e
                    trilha sonora incrível.
                  </p>
                </div>
              </div>

              <div className="RecentReview">
                <div className="ReviewText">
                  <p className="author">
                    por <strong>Guilherme</strong> • há 2 dias
                  </p>
                  <p className="content">
                    Um clássico moderno! Recomendo pra quem curte RPGs bem
                    construídos.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Coluna lateral — Recomendados */}
        <div className="RecommendedContainer">
          <h1>Recommended Games</h1>
          <div className="RecommendedGamesList">
            <img src={personaCapa} alt="Persona" className="RecommendedGameCover" />
            <img src={personaCapa} alt="Outro Jogo" className="RecommendedGameCover" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default PagJogo;
