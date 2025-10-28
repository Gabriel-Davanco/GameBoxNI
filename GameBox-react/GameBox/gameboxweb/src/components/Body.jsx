// Body.jsx
import { useEffect, useState } from 'react'
import CardJogo from './CardJogo'
import '../styles/Catalogo.css'
import GameActionButton from './GameActionButton' // botão de adicionar à biblioteca, favoritos, etc.
import '../styles/Body.css'

function Body() {// Estado local que armazena a lista de jogos retornada pela API
  const [jogos, setJogos] = useState([])

  // useEffect é executado assim que o componente é montado
  useEffect(() => {
    // Faz uma requisição para a API Flask que retorna os jogos recentes
    fetch("http://localhost:5000/api/jogos/recentes")
      .then(res => res.json())
      .then(data => setJogos(data))// Atualiza o estado com a lista de jogos
      .catch(err => console.error("Erro ao buscar jogos:", err))
  }, [])

  // Função chamada quando uma ação do GameActionButton é concluída com sucesso
  const handleActionSuccess = (message) => {
    // Lógica para mostrar notificação de sucesso
    console.log("Sucesso:", message);
    alert(message); 
  };

  return (
    <div className="Body">
      <section className="WGamesContainer">
        <h1>Weekly Games</h1>

        {/* Grid que exibe os jogos no mesmo layout da página de catálogo */}
        <div className="grid-jogos">
          {jogos.map((jogo) => (
            <div key={jogo.id} className="card-jogo">
              {/* Exibe a capa do jogo; se não houver imagem, usa uma padrão */}
              <img
                src={jogo.image_url || '/../img/default.png'}
                alt={jogo.nome_jogo}
              />
              {/* Informações básicas do jogo para o card */}
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
