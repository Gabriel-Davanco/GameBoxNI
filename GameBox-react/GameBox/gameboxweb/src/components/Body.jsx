import '../styles/Body.css'
import personaCapa from '../img/persona.png'

function Body() {
  return (
    <div className="Body">

      {/* 🔹 Weekly Games */}
      <section className="WGamesContainer">
        <h1>Weekly Games</h1>
        <div className="gamesSub">
          <div className="WGames">
          {[...Array(4)].map((_, i) => (
            <img key={i} src={personaCapa} alt="Persona" />
          ))}
          </div>
        </div>


      </section>

      {/* 🔹 Recent Reviews */}
      <section className="RecentReviewsContainer">
        <h1>Recent Reviews</h1>

        <div className="RecentReview">
          <img src={personaCapa} alt="Persona 5" />
          <div className="ReviewText">
            <h2>Persona 5</h2>
            <p className="author">por <strong>Brunão</strong></p>
            <p className="content">
              Esse jogo me enojou. Eu estava esperando uma sequência digna do Watch Dogs 2,
              mas apenas o que eu recebi foi decepção e uma mecânica mal polida. Os personagens
              são chatos, o mundo aberto é vazio, o roteiro pífio e a experiência decepcionante.
            </p>
          </div>
        </div>

        <div className="RecentReview">
          <img src={personaCapa} alt="Minecraft" />
          <div className="ReviewText">
            <h2>Minecraft</h2>
            <p className="author">por <strong>Guigas</strong></p>
            <p className="content">
              Esse jogo me enojou. Não comprem, horrível! Esperava gráficos realistas e me deparo
              com isso — que nojo.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Body
