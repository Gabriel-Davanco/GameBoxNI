import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // Certifique-se de que o caminho está correto
import logo from '../img/logo.png';

function Header() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Estados do login
  const [login, setLogin] = useState('');  // Usado para email no login
  const [senha, setSenha] = useState('');

  // Estados do cadastro
  const [novoLogin, setNovoLogin] = useState('');  // Se você ainda quiser usar isso, mas não está no envio
  const [novaSenha, setNovaSenha] = useState('');
  const [email, setEmail] = useState('');  // Usado para o email no cadastro

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: login, senha }),
    });

    // Verifica se há corpo antes de tentar converter em JSON
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (data && data.success) {
      alert('Login bem-sucedido!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowLogin(false);
      window.location.reload(); // Atualiza para "entrar" na conta
    } else {
      alert(data?.message || 'Erro ao fazer login.');
    }

  } catch (error) {
    alert('Erro ao conectar: ' + error.message);
  }
};


  const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/registro', {
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
          <img
          className="logo"
          src={logo}
          alt="Logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
      />
          <ul>
  {user ? (
    <>
      <li>Bem-vindo, {user.username || user.email}</li>
      <li onClick={() => {
        localStorage.removeItem('user');
        window.location.reload();
      }}>
        Sair
      </li>
    </>
  ) : (
    <>
      <li onClick={() => setShowRegister(true)}>Criar conta</li>
      <li onClick={() => setShowLogin(true)}>Entrar</li>
    </>
  )}
  <li onClick={() => navigate('/catalogo')}>Jogos</li>
  <li>Listas</li>
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

      {/* Modal de Criar Conta */}
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