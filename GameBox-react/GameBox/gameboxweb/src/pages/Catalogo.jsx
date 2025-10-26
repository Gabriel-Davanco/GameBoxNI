import React, { useState, useEffect } from 'react';
import '../styles/Catalogo.css';
import personaCapa from '../img/persona.png'

function Catalogo() {
  const [jogos, setJogos] = useState([]);
  const [novoJogo, setNovoJogo] = useState({
    nome_jogo: '',
    ano_lancamento: '',
    plataforma: '',
    avaliacao_media: ''
  });

const buscarJogos = async () => {
  const res = await fetch('http://localhost:5000/api/jogos');
  const data = await res.json();
  setJogos(data);
};

useEffect(() => {
  buscarJogos();
}, []);

const handleAddJogo = async (e) => {
  e.preventDefault();
  const res = await fetch('http://localhost:5000/api/jogos', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome_jogo: novoJogo.nome_jogo,
      ano_lancamento: parseInt(novoJogo.ano_lancamento),
      platforma: novoJogo.plataforma,
      avaliacao_media: parseFloat(novoJogo.avaliacao_media)
    })
  });
  const data = await res.json();
  alert(data.message);
  setNovoJogo({nome_jogo: '', ano_lancamento: '', plataforma: '', avaliacao_media: ''});
  buscarJogos();
};

  return (
    <div className="catalogo-container">
      <h1>Catálogo de Jogos</h1>

      {/* Formulário para adicionar novo jogo */}
      <form className="barra-pesquisa" onSubmit={handleAddJogo}>
        <input
          type="text"
          placeholder="Nome do Jogo"
          value={novoJogo.nome_jogo}
          onChange={(e) => setNovoJogo({ ...novoJogo, nome_jogo: e.target.value })}
          required
        />
        <input
        type="number"
        placeholder="Ano de Lançamento"
        value={novoJogo.ano_lancamento}
        onChange={(e) => setNovoJogo({ ...novoJogo, ano_lancamento: e.target.value })}
        required
        />
        <input
        type="text"
        placeholder="Plataforma"
        value={novoJogo.plataforma}
        onChange={(e) => setNovoJogo({ ...novoJogo, plataforma: e.target.value })}
        required
        />
        <input
        type="number"
        step="0.1"
        placeholder="Avaliação Média"
        value={novoJogo.avaliacao_media}
        onChange={(e) => setNovoJogo({ ...novoJogo, avaliacao_media: e.target.value })}
        required
        />
        <button type="submit">Adicionar Jogo</button>
      </form>

      {/* Barra de pesquisa */}
      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Pesquisar jogos..."
        />
        <button>Buscar</button>
      </div>

      {/* Grade de jogos */}
      <div className="grid-jogos">
        {/* Temporário — depois puxaremos do banco */}
        {[1, 2, 3, 4, 5, 6].map((jogo) => (
          <div className="card-jogo" key={jogo}>
            <img
              src={personaCapa}
              alt={`Jogo ${jogo}`}
            />
            <h3>Título do Jogo {jogo}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
