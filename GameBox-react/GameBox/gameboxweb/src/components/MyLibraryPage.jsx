import React, { useState, useEffect } from 'react';

// Componente responsável por exibir a biblioteca pessoal do usuário.
// Ele busca os jogos adicionados à biblioteca e os exibe de forma simples na tela.
function MyLibraryPage() {
    const [library, setLibrary] = useState([]);// Estado que armazena os jogos da biblioteca
    const [loading, setLoading] = useState(true); // Estado para controle de carregamento da requisição
    const [error, setError] = useState(null);// Estado para armazenar possíveis erros (ex: falha de conexão ou falta de autenticação)

    const fetchLibrary = async () => {// Função responsável por buscar os dados da biblioteca do usuário no backend
        setLoading(true);
        setError(null);
        try {
            // Chamada à API protegida: o backend requer que o usuário esteja logado
            const response = await fetch('/api/biblioteca'); 
            const data = await response.json();

            if (!response.ok) {
                // Se a resposta do backend indicar erro (ex: 401 Unauthorized), lança exceção
                throw new Error(data.erro || 'Falha ao carregar a biblioteca. Talvez você precise fazer login.');
            }

            setLibrary(data);// Atualiza o estado local com os jogos retornados
        } catch (err) {
            setError(err.message);// Armazena a mensagem de erro para exibição
        } finally {
            setLoading(false);// Garante que o "carregando" será desativado independentemente do resultado
        }
    };

    // useEffect executa a busca inicial ao montar o componente
    useEffect(() => {
        fetchLibrary();
    }, []);

    if (loading) {// Exibição condicional com base no estado atual
        return <div>Carregando sua biblioteca...</div>;
    }

    if (error) {
        return <div>Erro ao carregar: {error}</div>;
    }

    if (library.length === 0) {
        return <div>Sua biblioteca está vazia. Adicione alguns jogos!</div>;
    }

    // Renderiza a lista de jogos da biblioteca
    return (
        <div>
            <h1>Minha Biblioteca de Jogos</h1>

            {/* Mapeia cada jogo retornado e o exibe com suas informações básicas */}
            {library.map(game => (
                <div key={game.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <img src={game.image_url} alt={game.nome_jogo} style={{ width: '100px' }} />
                    <h2>{game.nome_jogo}</h2>
                    <p>Status: <strong>{game.status}</strong></p>
                    <p>Lançamento: {game.ano_lancamento}</p>
                    <p>Plataforma: {game.plataforma}</p>
                    <p>Adicionado em: {new Date(game.data_adicao).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}

export default MyLibraryPage;
