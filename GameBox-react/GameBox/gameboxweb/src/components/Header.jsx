import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // Certifique-se de que o caminho está correto
import logo from '../img/logo.png';

function Header() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('user');// Recupera informações do usuário armazenadas localmente (login persistido)
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [showLogin, setShowLogin] = useState(false);// Estados que controlam a exibição dos modais de login e registro
  const [showRegister, setShowRegister] = useState(false);

  // Estados do login
  const [login, setLogin] = useState('');  // Usado para email no login
  const [senha, setSenha] = useState('');

  // Estados do cadastro
  const [novoLogin, setNovoLogin] = useState('');  // Nome de usuário no cadastro
  const [novaSenha, setNovaSenha] = useState('');
  const [email, setEmail] = useState('');  // Email usado no cadastro

  // --- Função de Logout ---
  // Remove o usuário do localStorage e encerra a sessão no backend
  const handleLogout = async () => {
    try {
      // Chama a API de logout no backend para limpar a sessão
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    } finally {
      // Limpa o estado local e redireciona para a página inicial
      localStorage.removeItem('user');
      navigate('/'); // Redireciona para a home após o logout
      window.location.reload(); // Recarrega para atualizar o estado do componente
    }
  };

  // --- Função de Login ---
  // Envia os dados do formulário de login para o backend
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: login, senha }),
      });

      // Lida com o caso de o backend não retornar JSON válido
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data && data.success) {
        alert('Login bem-sucedido!');
        localStorage.setItem('user', JSON.stringify(data.user));// Armazena usuário logado
        setShowLogin(false);
        window.location.reload(); // Atualiza para refletir o login
      } else {
        alert(data?.message || 'Erro ao fazer login.');
      }

    } catch (error) {
      alert('Erro ao conectar: ' + error.message);
    }
  };


  // --- Função de Cadastro ---
  // Envia os dados do formulário de registro para o backend
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: novaSenha, username: novoLogin }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Cadastro bem-sucedido!');
        setShowRegister(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao conectar: ' + error.message);
    }
  };


  return (
    <>
      <div className="Header">
        <div className="navBar">
          {/* Logo clicável que redireciona para a página inicial */}
          <img
            className="logo"
            src={logo}
            alt="Logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          {/* Menu de navegação */}
          <ul>
            {user ? (
              <>
                <li>Bem-vindo, {user.username || user.email}</li>{/* Exibe o nome do usuário logado e opção de sair */}

                <li onClick={handleLogout}>
                  Sair
                </li>
              </>
            ) : (
              <>
                {/* Opções para criar conta ou fazer login */}
                <li onClick={() => setShowRegister(true)}>Criar conta</li>
                <li onClick={() => setShowLogin(true)}>Entrar</li>
              </>
            )}
            {/* Links de navegação para outras páginas */}
            <li onClick={() => navigate('/catalogo')}>Jogos</li>
            {/*<li>Listas</li>*/}
            <li onClick={() => navigate('/perfil')}>Perfil</li>
          </ul>

        </div>
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                placeholder="Email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="submit">Entrar</button>
            </form>
            <button onClick={() => setShowLogin(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Conta</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="text"
                placeholder="Nome de usuário"
                value={novoLogin}
                onChange={(e) => setNovoLogin(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
              <button type="submit">Cadastrar</button>
            </form>

            <button onClick={() => setShowRegister(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;