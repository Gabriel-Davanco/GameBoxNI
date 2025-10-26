// Body.jsx
import { useEffect, useState } from 'react'
import CardJogo from './CardJogo'
import GameActionButton from './GameActionButton' // <-- Importe este componente
import '../styles/Body.css'

function Body() {
  const [jogos, setJogos] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/api/jogos" )
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
        <div className="WGames">
          {jogos.map(jogo => (
            // Esta div agrupa o CardJogo e o GameActionButton
            <div key={jogo.id} className="GameItemWrapper"> 
              
              {/* 1. SEU CARD DE JOGO */}
              <CardJogo jogo={jogo} /> 
              
              {/* 2. O BOTÃO DE AÇÃO DA BIBLIOTECA */}
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
