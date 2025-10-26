import React, { useState, useEffect } from 'react';
import '../styles/Catalogo.css';
import personaCapa from '../img/persona.png';

function Catalogo() {
  const [jogos, setJogos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [novoJogo, setNovoJogo] = useState({
    nome_jogo: '',
    ano_lancamento: '',
    plataforma: '',
    avaliacao_media: '',
    image_url: ''
  });
  const [imgInfo, setImgInfo] = useState({ width: 0, height: 0, type: '' });

  const buscarJogos = async () => {
    const res = await fetch('http://localhost:5000/api/jogos');
    const data = await res.json();
    setJogos(data);
  };

  useEffect(() => {
    buscarJogos();
  }, []);

  const handleSearch = async () => {
    const res = await fetch(`http://localhost:5000/api/jogos/pesquisa?q=${searchTerm}`);
    const data = await res.json();
    setJogos(data);
  };

  const handleAddJogo = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/jogos', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_jogo: novoJogo.nome_jogo,
        ano_lancamento: parseInt(novoJogo.ano_lancamento),
        plataforma: novoJogo.plataforma,
        avaliacao_media: parseFloat(novoJogo.avaliacao_media),
        image_url: novoJogo.image_url || null
      })
    });
    const data = await res.json();
    alert(data.message);
    setNovoJogo({nome_jogo: '', ano_lancamento: '', plataforma: '', avaliacao_media: '', image_url: ''});
    setImgInfo({ width: 0, height: 0, type: '' });
    buscarJogos();
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setNovoJogo({ ...novoJogo, image_url: url });

    if (!url) {
      setImgInfo({ width: 0, height: 0, type: '' });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const typeMatch = url.match(/\.(\w+)$/);
      setImgInfo({
        width: img.width,
        height: img.height,
        type: typeMatch ? typeMatch[1] : 'desconhecido'
      });
    };
    img.onerror = () => {
      setImgInfo({ width: 0, height: 0, type: 'Inválido' });
    };
    img.src = url;
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
        <input
          type="text"
          placeholder="URL da Imagem (opcional)"
          value={novoJogo.image_url}
          onChange={handleImageChange}
        />
        {imgInfo.width > 0 && (
          <p>Proporção: {imgInfo.width}x{imgInfo.height} | Tipo: {imgInfo.type}</p>
        )}
        <button type="submit">Adicionar Jogo</button>
      </form>

      {/* Barra de pesquisa */}
      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Pesquisar jogos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>Buscar</button>
      </div>

      {/* Grade de jogos */}
      <div className="grid-jogos">
        {jogos.map((jogo) => (
          <div className="card-jogo" key={jogo.id}>
            <img src={jogo.image_url || personaCapa} alt={jogo.nome_jogo} />
            <h3>{jogo.nome_jogo}</h3>
            <p>{jogo.plataforma} - {jogo.ano_lancamento}</p>
            <p>Avaliação: {jogo.avaliacao_media}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
