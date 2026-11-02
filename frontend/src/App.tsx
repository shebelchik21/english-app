import './App.css'

function App() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        📚 English School
      </h1>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '400px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          ✅ Telegram Mini App работает!
        </p>

        {user ? (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              👋 Привет, <strong>{user.first_name}</strong>!
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '10px' }}>
              ID: {user.id}
            </p>
            {user.username && (
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                @{user.username}
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '10px' }}>
            Откройте через Telegram Bot
          </p>
        )}

        <div style={{ marginTop: '30px', fontSize: '0.85rem', opacity: 0.6 }}>
          <p>Версия Telegram WebApp: {tg?.version || 'N/A'}</p>
          <p>Платформа: {tg?.platform || 'N/A'}</p>
        </div>
      </div>

      <p style={{ marginTop: '30px', fontSize: '0.9rem', opacity: 0.8 }}>
        🚀 Приложение готово к разработке
      </p>
    </div>
  )
}

export default App
