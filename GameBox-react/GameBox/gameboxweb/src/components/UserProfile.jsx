import { useEffect, useState } from 'react';
import '../styles/UserProfile.css';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user_profile', {   // ⬅️ URL RELATIVA
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const text = await res.text();
        const ct = res.headers.get('content-type') || '';

        if (!res.ok) throw new Error(`HTTP ${res.status}\n${text || '(sem corpo)'}`);
        if (!ct.includes('application/json')) {
          throw new Error(`Resposta não-JSON (Content-Type: ${ct})\n${text.slice(0, 200)}`);
        }

        const data = text ? JSON.parse(text) : {};
        setUserData(data);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="profile-wrapper"><div className="profile-card">Carregando...</div></div>;
  if (error) return (
    <div className="profile-wrapper">
      <div className="profile-card error">
        <h2>Perfil</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        <p style={{ marginTop: 8 }}>Dica: se aparecer “Resposta não-JSON… text/html”, o proxy do Vite não está ativo.</p>
      </div>
    </div>
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h2>Perfil</h2>
        <div className="profile-field">
          <span className="label">Email:</span>
          <span className="value">{userData?.email ?? 'Não disponível'}</span>
        </div>
        <div className="profile-field">
          <span className="label">Username:</span>
          <span className="value">{userData?.username ?? 'Não disponível'}</span>
        </div>
      </div>
    </div>
  );
}
