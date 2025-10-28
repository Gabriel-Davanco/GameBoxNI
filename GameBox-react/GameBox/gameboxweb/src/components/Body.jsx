// Body.jsx
import { useEffect, useState } from 'react'
import CardJogo from './CardJogo'
import '../styles/Catalogo.css'
import GameActionButton from './GameActionButton' // <-- Importe este componente
import '../styles/Body.css'

function Body() {
  const [jogos, setJogos] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/api/jogos/recentes")
      .then(res => res.json())
      .then(data => setJogos(data))
      .catch(err => console.error("Erro ao buscar jogos:", err))
  }, [])

  const handleActionSuccess = (message) => {
    // Lógica para mostrar notificação de sucesso
    console.log("Sucesso:", message);
    alert(message); 
  };

  return (
    <div className="Body">
      <section className="WGamesContainer">
        <h1>Weekly Games</h1>

        {/* Usa o mesmo layout da página de catálogo */}
        <div className="grid-jogos">
          {jogos.map((jogo) => (
            <div key={jogo.id} className="card-jogo">
              <img
                src={jogo.image_url || '/default-capa.jpg'}
                alt={jogo.nome_jogo}
              />
              <h3>{jogo.nome_jogo}</h3>
              <p>{jogo.plataforma} - {jogo.ano_lancamento}</p>
              <p>Avaliação: {jogo.avaliacao_media}</p>

              {/* Botão de ação (biblioteca, favoritos, etc.) */}
              <div style={{ marginTop: '10px' }}>
                <GameActionButton
                  gameId={jogo.id}
                  onActionSuccess={handleActionSuccess}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Body
