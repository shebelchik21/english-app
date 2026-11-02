import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { packagesApi } from '../api';
import type { Package } from '../context/AuthContext';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export default function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.getMyPackages().then((res) => {
      setPackages(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const activePackage = packages.find(p => p.isActive && new Date(p.expiresAt) > new Date());
  const lessonsLeft = activePackage ? activePackage.lessonsTotal - activePackage.lessonsUsed : 0;
  const progressPct = activePackage
    ? Math.round((activePackage.lessonsUsed / activePackage.lessonsTotal) * 100)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 17) return 'Добрый день';
    return 'Добрый вечер';
  };

  const initials = user ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase() : '?';

  return (
    <div className="app-container">
      <div className="page">
        {/* Header */}
        <div className="page-header fade-in">
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              {getGreeting()} 👋
            </p>
            <h1 style={{ fontSize: '1.5rem' }}>{user?.firstName}</h1>
          </div>
          <div className="avatar avatar-lg" style={{ boxShadow: 'var(--shadow-glow)' }}>
            {initials}
          </div>
        </div>

        {/* Active Package Hero Card */}
        <div className="fade-in" style={{ marginBottom: 20, animationDelay: '60ms' }}>
          {loading ? (
            <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ) : activePackage ? (
            <div style={{
              background: 'var(--grad-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-glow)',
            }}>
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <div style={{
                position: 'absolute', bottom: -20, right: 40,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Активный пакет
                    </p>
                    <h3 style={{ color: 'white', fontSize: '1.1rem' }}>{activePackage.name}</h3>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                      {lessonsLeft}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>
                      осталось
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                      Уроков использовано
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>
                      {activePackage.lessonsUsed}/{activePackage.lessonsTotal}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'white',
                      borderRadius: 999,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                  Действует до {new Date(activePackage.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📦</div>
              <h3 style={{ marginBottom: 8 }}>Нет активного пакета</h3>
              <p style={{ fontSize: '0.85rem' }}>Обратитесь к учителю для назначения пакета уроков</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid-2 fade-in" style={{ marginBottom: 20, animationDelay: '120ms' }}>
          <button
            id="btn-book-lesson"
            className="btn btn-secondary"
            onClick={() => onNavigate('booking')}
            disabled={!activePackage || lessonsLeft === 0}
            style={{ flexDirection: 'column', gap: 8, padding: '20px 16px', height: 'auto' }}
          >
            <span style={{ fontSize: '1.6rem' }}>📅</span>
            <span style={{ fontSize: '0.82rem' }}>Забронировать</span>
          </button>
          <button
            id="btn-my-lessons"
            className="btn btn-secondary"
            onClick={() => onNavigate('history')}
            style={{ flexDirection: 'column', gap: 8, padding: '20px 16px', height: 'auto' }}
          >
            <span style={{ fontSize: '1.6rem' }}>📋</span>
            <span style={{ fontSize: '0.82rem' }}>Мои уроки</span>
          </button>
        </div>

        {/* All Packages */}
        <div className="fade-in" style={{ animationDelay: '180ms' }}>
          <h3 style={{ marginBottom: 12 }}>Мои абонементы</h3>
          {loading ? (
            <div className="scroll-list">
              {[1, 2].map(i => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <p>У вас пока нет абонементов</p>
            </div>
          ) : (
            <div className="scroll-list stagger-children">
              {packages.map((pkg) => {
                const expired = new Date(pkg.expiresAt) < new Date();
                const pct = Math.round((pkg.lessonsUsed / pkg.lessonsTotal) * 100);
                return (
                  <div key={pkg.id} className="card-flat fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 style={{ marginBottom: 2 }}>{pkg.name}</h4>
                        <p style={{ fontSize: '0.78rem' }}>
                          До {new Date(pkg.expiresAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <span className={`badge ${!pkg.isActive || expired ? 'badge-red' : pkg.lessonsUsed >= pkg.lessonsTotal ? 'badge-yellow' : 'badge-green'}`}>
                        {!pkg.isActive || expired ? 'Истёк' : pkg.lessonsUsed >= pkg.lessonsTotal ? 'Исчерпан' : 'Активен'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {pkg.lessonsUsed}/{pkg.lessonsTotal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
