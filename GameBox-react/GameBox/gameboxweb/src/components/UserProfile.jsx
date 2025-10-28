import { useState, useEffect } from 'react';
import '../styles/UserProfile.css';

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Função para buscar o perfil do usuário
        const fetchUserProfile = fetch('/api/user_profile', {
            method: 'GET',
            credentials: 'include',
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
                    // Se a biblioteca falhar, não é um erro fatal para o perfil
                    console.error("Erro ao buscar biblioteca:", response.statusText);
                    return [];
                }
                return response.json();
            })
            .then((data) => {
                setLibrary(data);
            });

        // Executa as duas requisições em paralelo
        Promise.all([fetchUserProfile, fetchUserLibrary])
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

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

    return (
        <div className="UserProfile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {userData?.username
                            ? userData.username.charAt(0).toUpperCase()
                            : 'U'}
                    </div>
                    <h1>Perfil do Usuário</h1>
                </div>

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