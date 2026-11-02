import { useState, useEffect } from 'react';
import { bookingsApi } from '../api';

interface Booking {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  slot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  package: {
    name: string;
  };
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    bookingsApi.getMyBookings().then((res) => {
      setBookings(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      if (window.Telegram?.WebApp?.showConfirm) {
        window.Telegram.WebApp.showConfirm('Отменить бронирование? Урок будет возвращён в абонемент.', resolve);
      } else {
        resolve(window.confirm('Отменить бронирование?'));
      }
    });

    if (!confirmed) return;
    setCancellingId(id);
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b));
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => {
    const slotDate = new Date(b.slot.date);
    return slotDate >= now && b.status !== 'CANCELLED';
  });
  const past = bookings.filter(b => {
    const slotDate = new Date(b.slot.date);
    return slotDate < now || b.status === 'CANCELLED';
  });

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const statusConfig = {
    PENDING:   { label: 'Ожидает', className: 'badge-yellow', icon: '⏳' },
    CONFIRMED: { label: 'Подтверждён', className: 'badge-green', icon: '✅' },
    CANCELLED: { label: 'Отменён', className: 'badge-red', icon: '❌' },
    COMPLETED: { label: 'Завершён', className: 'badge-blue', icon: '🎓' },
  };

  return (
    <div className="app-container">
      <div className="page">
        <div className="page-header fade-in">
          <h1 className="page-title">Мои уроки</h1>
        </div>

        <div className="tabs fade-in">
          <button
            id="tab-upcoming"
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Предстоящие {upcoming.length > 0 && `(${upcoming.length})`}
          </button>
          <button
            id="tab-past"
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            История
          </button>
        </div>

        {loading ? (
          <div className="scroll-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">
              {activeTab === 'upcoming' ? '📅' : '📖'}
            </div>
            <h3>{activeTab === 'upcoming' ? 'Нет предстоящих уроков' : 'История пуста'}</h3>
            <p style={{ fontSize: '0.85rem' }}>
              {activeTab === 'upcoming' ? 'Забронируйте урок в разделе «Забронировать»' : 'Завершённые уроки появятся здесь'}
            </p>
          </div>
        ) : (
          <div className="scroll-list stagger-children">
            {displayed.map((booking) => {
              const cfg = statusConfig[booking.status];
              const slotDate = new Date(booking.slot.date + 'T00:00:00');
              const isUpcoming = slotDate >= now && booking.status !== 'CANCELLED';

              return (
                <div key={booking.id} className="card fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {booking.package.name}
                      </div>
                      <h4 style={{ fontSize: '1rem' }}>
                        {slotDate.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                      </h4>
                    </div>
                    <span className={`badge ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: isUpcoming ? 12 : 0,
                  }}>
                    <span style={{ fontSize: '1.4rem' }}>🕐</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {booking.slot.startTime} — {booking.slot.endTime}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Продолжительность 60 мин
                      </div>
                    </div>
                  </div>

                  {isUpcoming && (
                    <button
                      id={`btn-cancel-${booking.id}`}
                      className="btn btn-ghost btn-sm btn-full"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? 'Отмена...' : '✕ Отменить бронь'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
