import React, { useState, useEffect } from 'react';

function MyLibraryPage() {
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLibrary = async () => {
        setLoading(true);
        setError(null);
        try {
            // A rota /api/biblioteca exige que o usuário esteja logado (login_required)
            const response = await fetch('/api/biblioteca'); 
            const data = await response.json();

            if (!response.ok) {
                // Se o backend retornar um erro (ex: 401 Unauthorized), ele cairá aqui
                throw new Error(data.erro || 'Falha ao carregar a biblioteca. Talvez você precise fazer login.');
            }

            setLibrary(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, []);

    if (loading) {
        return <div>Carregando sua biblioteca...</div>;
    }

    if (error) {
        return <div>Erro ao carregar: {error}</div>;
    }

    if (library.length === 0) {
        return <div>Sua biblioteca está vazia. Adicione alguns jogos!</div>;
    }

    return (
        <div>
            <h1>Minha Biblioteca de Jogos</h1>
            {library.map(game => (
                <div key={game.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <img src={game.image_url} alt={game.nome_jogo} style={{ width: '100px' }} />
                    <h2>{game.nome_jogo}</h2>
                    <p>Status: <strong>{game.status}</strong></p>
                    <p>Lançamento: {game.ano_lancamento}</p>
                    <p>Plataforma: {game.plataforma}</p>
                    <p>Adicionado em: {new Date(game.data_adicao).toLocaleDateString()}</p>
                    
                    {/* Você pode integrar o GameActionButton aqui para poder mudar o status ou remover o jogo */}
                    {/* Exemplo: */}
                    {/* <GameActionButton 
                        gameId={game.id} 
                        currentStatus={game.status} 
                        onActionSuccess={fetchLibrary} // Recarrega a lista após uma ação
                    /> */}
                </div>
            ))}
        </div>
    );
}

export default MyLibraryPage;
