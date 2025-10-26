// Exemplo de CardJogo.jsx (você deve adaptar as classes)
function CardJogo({ jogo }) {
  return (
    <div className="CardJogo">
      <img src={jogo.image_url} alt={jogo.nome_jogo} className="CardImage" />
      <div className="CardInfo">
        <h3 className="CardTitle">{jogo.nome_jogo}</h3>
        <p className="CardPlatform">{jogo.plataforma}</p>
        <div className="CardRating">
          <span>⭐ {jogo.avaliacao_media}</span>
        </div>
      </div>
    </div>
  );
}
export default CardJogo