import { useState, useEffect } from 'react';
import '../styles/UserProfile.css';

// Componente responsável por exibir o perfil do usuário logado.
// Mostra informações básicas (nickname e email) e também a lista de jogos da biblioteca.
function UserProfile() {
    const [userData, setUserData] = useState(null);// Estado para armazenar os dados do usuário (username, email, etc.)
    const [library, setLibrary] = useState([]); // Estado para armazenar os jogos da biblioteca do usuário
    const [loading, setLoading] = useState(true);// Controle de carregamento (evita renderizar antes das requisições terminarem)
    const [error, setError] = useState(null);// Armazena possíveis erros (como falha na autenticação)

    // useEffect roda ao montar o componente — responsável por buscar os dados iniciais
    useEffect(() => {
        const fetchUserProfile = fetch('/api/user_profile', {// --- Requisição 1: Buscar informações do perfil ---
            method: 'GET',
            credentials: 'include',// Inclui cookies de sessão, se houver
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Usuário não autenticado ou erro ao buscar dados');
                }
                return response.json();
            })
            .then((data) => {
                setUserData(data);
            });

        // Função para buscar a biblioteca do usuário
        const fetchUserLibrary = fetch('/api/biblioteca', {
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => {
                if (!response.ok) {
                    // A falha na biblioteca não impede o carregamento do perfil
                    console.error("Erro ao buscar biblioteca:", response.statusText);
                    return [];
                }
                return response.json();
            })
            .then((data) => {
                setLibrary(data);
            });

        // Executa ambas as requisições em paralelo e trata resultados
        Promise.all([fetchUserProfile, fetchUserLibrary])
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // --- Exibições condicionais de status ---
    if (loading) {
        return (
            <div className="UserProfile">
                <div className="loading">Carregando perfil...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="UserProfile">
                <div className="error">
                    <h2>Erro ao carregar perfil</h2>
                    <p>{error}</p>
                    <p>Por favor, faça login para acessar seu perfil.</p>
                </div>
            </div>
        );
    }

    // --- Renderização principal ---
    return (
        <div className="UserProfile">
            <div className="profile-container">
                {/* Cabeçalho do perfil com avatar e título */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {/* Gera um avatar simples com a inicial do nome do usuário */}
                        {userData?.username
                            ? userData.username.charAt(0).toUpperCase()
                            : 'U'}
                    </div>
                    <h1>Perfil do Usuário</h1>
                </div>

                {/* Informações básicas do usuário */}
                <div className="profile-info">
                    <div className="info-item">
                        <label>Nickname:</label>
                        <p>{userData?.username || 'Não definido'}</p>
                    </div>

                    <div className="info-item">
                        <label>Email:</label>
                        <p>{userData?.email || 'Não disponível'}</p>
                    </div>
                </div>

                {/* Seção Meus Jogos */}
                <div className="my-games-section">
                    <h2>Meus Jogos ({library.length})</h2>
                    <div className="my-games-list">
                        {library.length > 0 ? (
                            library.map((game) => (
                                <div key={game.id} className="game-card">
                                    <img src={game.image_url || '/path/to/default/image.png'} alt={game.nome_jogo} className="game-image" />
                                    <div className="game-details">
                                        <h3>{game.nome_jogo}</h3>
                                        <p>Status: {game.status}</p>
                                        <p>Adicionado em: {new Date(game.data_adicao).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Você ainda não adicionou jogos à sua biblioteca.</p>
                        )}
                    </div>
                </div>
                {/* Fim Seção Meus Jogos */}


            </div>
        </div>
    );
}

export default UserProfile;