import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function WelcomePage() {
  const { loading, error } = useAuth();

  useEffect(() => {
    // Set Telegram header colors
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.setHeaderColor('#0a0b14');
      window.Telegram.WebApp.setBackgroundColor('#0a0b14');
    }
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-glow 2s ease infinite',
            fontSize: '2rem',
          }}>
            📚
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 120, height: 12, marginBottom: 8 }} className="skeleton" />
            <div style={{ width: 80, height: 10 }} className="skeleton" />
          </div>
          <div className="loader" style={{
            width: 28,
            height: 28,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--accent-purple)',
            borderRadius: '50%',
          }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ marginBottom: 8 }}>Ошибка подключения</h2>
          <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>{error}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Откройте приложение через Telegram Bot
          </p>
        </div>
      </div>
    );
  }

  return null; // App.tsx handles routing based on auth
}
