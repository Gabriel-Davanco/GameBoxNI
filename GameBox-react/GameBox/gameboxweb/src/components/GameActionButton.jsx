import React, { useState } from 'react';
import "../styles/GameActionButton.css";

// Lista de status possíveis para os jogos na biblioteca
const STATUS_OPTIONS = [
    { value: 'na fila', label: 'Na Fila' },
    { value: 'jogando', label: 'Jogando' },
    { value: 'completado', label: 'Completado' },
    { value: 'abandonado', label: 'Abandonado' },
];

function GameActionButton({ gameId, currentStatus, onActionSuccess }) {
    const [status, setStatus] = useState(currentStatus || 'na fila');// Estado atual do status do jogo (ex: "jogando", "na fila"...)
    const [isInLibrary, setIsInLibrary] = useState(!!currentStatus);// Define se o jogo já está ou não na biblioteca
    const [loading, setLoading] = useState(false); // Controla o estado de carregamento para evitar cliques repetidos

    // Função genérica para requisições
    const handleRequest = async (url, method, body = null) => {// Centraliza as operações (POST, PUT, DELETE), evitando repetição de código
        setLoading(true);// Ativa o estado de carregamento
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Se você precisar de um token de autenticação (JWT, por exemplo), adicione aqui
                },
                body: body ? JSON.stringify(body) : null,// Envia dados apenas se houver body
            });

            const data = await response.json();
            setLoading(false);

            // Caso o servidor retorne erro (status != 200)
            if (!response.ok) {
                alert(`Erro: ${data.erro || data.mensagem}`);
                return false;
            }

            // Em caso de sucesso, notifica o componente pai (ex: Body.jsx)
            onActionSuccess(data.mensagem);
            return true;

        } catch (error) {// Caso haja falha na conexão com o servidor
            setLoading(false);
            alert('Erro de conexão com o servidor.');
            console.error('Erro na requisição:', error);
            return false;
        }
    };

    // --- Adiciona o jogo à biblioteca ---
    const handleAddGame = async () => {
        const success = await handleRequest(
            '/api/biblioteca/adicionar',
            'POST',
            { jogo_id: gameId, status: status }
        );
        if (success) {
            setIsInLibrary(true);// Marca o jogo como presente na biblioteca
        }
    };

    // --- Remove o jogo da biblioteca ---
    const handleRemoveGame = async () => {
        const success = await handleRequest(
            `/api/biblioteca/remover/${gameId}`,
            'DELETE'
        );
        if (success) {
            setIsInLibrary(false);// Atualiza o estado para fora da biblioteca
            setStatus('na fila');// Reseta o status
        }
    };

    // --- Atualiza o status do jogo ---
    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        // Se já estiver na biblioteca, atualiza o status
        if (isInLibrary) {
            await handleRequest(
                `/api/biblioteca/status/${gameId}`,
                'PUT',
                { status: newStatus }
            );
        } else {
            // Se não estiver, adiciona com o status selecionado
            await handleAddGame();
        }
    };

    return (
        <div className="game-action-container">
            {isInLibrary ? (
                <>
                    {/* Dropdown para alterar o status do jogo */}
                    <select
                        className="game-select"
                        value={status}
                        onChange={handleStatusChange}
                        disabled={loading}
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Botão para remover o jogo da biblioteca */}
                    <button
                        className="game-button"
                        onClick={handleRemoveGame}
                        disabled={loading}
                    >
                        {loading ? 'Removendo...' : 'Remover da Biblioteca'}
                    </button>
                </>
            ) : (
                <>
                    {/* Dropdown para escolher o status inicial antes de adicionar */}
                    <select
                        className="game-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Botão para adicionar o jogo à biblioteca */}
                    <button
                        className="game-button"
                        onClick={handleAddGame}
                        disabled={loading}
                    >
                        {loading ? 'Adicionando...' : 'Adicionar à Biblioteca'}
                    </button>
                </>
            )}
        </div>
    );
}

export default GameActionButton;
