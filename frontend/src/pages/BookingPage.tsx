import { useState, useEffect } from 'react';
import { slotsApi, bookingsApi, packagesApi } from '../api';
import type { Package } from '../context/AuthContext';

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function BookingPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    Promise.all([slotsApi.getAvailable(), packagesApi.getMyPackages()]).then(([slotsRes, pkgRes]) => {
      setSlots(slotsRes.data);
      const activePkgs = pkgRes.data.filter(
        (p: Package) => p.isActive && new Date(p.expiresAt) > new Date() && p.lessonsUsed < p.lessonsTotal
      );
      setPackages(activePkgs);
      if (activePkgs.length > 0) setSelectedPackageId(activePkgs[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Monday start

  const slotDates = new Set(slots.map(s => s.date.split('T')[0]));

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (slotDates.has(dateStr)) {
      setSelectedDate(dateStr);
      setSelectedSlot(null);
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const slotsForDate = slots.filter(s => s.date.split('T')[0] === selectedDate);

  const handleBook = async () => {
    if (!selectedSlot || !selectedPackageId) return;
    setBooking(true);
    try {
      await bookingsApi.create({ slotId: selectedSlot.id, packageId: selectedPackageId });
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      showToast('✅ Урок забронирован!', 'success');
      // Remove booked slot from list
      setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
      setSelectedSlot(null);
      setSelectedDate(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      showToast(error.response?.data?.error || 'Ошибка при бронировании', 'error');
    } finally {
      setBooking(false);
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  return (
    <div className="app-container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <div className="page">
        <div className="page-header fade-in">
          <h1 className="page-title">Забронировать</h1>
        </div>

        {/* Package Selector */}
        {packages.length > 1 && (
          <div className="form-group fade-in">
            <label className="form-label">Абонемент</label>
            <select
              id="select-package"
              className="form-input"
              value={selectedPackageId || ''}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.lessonsTotal - pkg.lessonsUsed} ур. осталось)
                </option>
              ))}
            </select>
          </div>
        )}

        {packages.length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚫</div>
            <h3 style={{ marginBottom: 8 }}>Нет доступных пакетов</h3>
            <p style={{ fontSize: '0.85rem' }}>Все уроки использованы или пакет истёк</p>
          </div>
        )}

        {/* Calendar */}
        <div className="card fade-in" style={{ marginBottom: 20, animationDelay: '60ms' }}>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button id="btn-prev-month" className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
            <h3 style={{ fontSize: '1rem' }}>{monthNames[month]} {year}</h3>
            <button id="btn-next-month" className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
          </div>

          {/* Day headers */}
          <div className="calendar-grid">
            {dayNames.map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}

            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayDate = new Date(year, month, day);
              const isToday = dayDate.toDateString() === new Date().toDateString();
              const hasSlotsOnDay = slotDates.has(dateStr);
              const isPast = dayDate < today;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  id={`calendar-day-${dateStr}`}
                  className={`calendar-day ${isToday ? 'today' : ''} ${hasSlotsOnDay ? 'has-slots' : ''} ${isSelected ? 'selected' : ''} ${isPast || (!hasSlotsOnDay) ? 'disabled' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Загрузка слотов...
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Есть доступные слоты</span>
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="slide-up">
            <h3 style={{ marginBottom: 12 }}>
              Доступное время — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </h3>

            {slotsForDate.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏰</div>
                <p>Нет доступных слотов на этот день</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
                {slotsForDate.map(slot => (
                  <button
                    key={slot.id}
                    id={`slot-${slot.id}`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                    }}
                    style={{
                      background: selectedSlot?.id === slot.id ? 'var(--grad-primary)' : 'var(--color-surface)',
                      border: `1px solid ${selectedSlot?.id === slot.id ? 'transparent' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      textAlign: 'center',
                      boxShadow: selectedSlot?.id === slot.id ? 'var(--shadow-glow-sm)' : 'none',
                    }}
                  >
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: selectedSlot?.id === slot.id ? 'white' : 'var(--text-primary)',
                      marginBottom: 2,
                    }}>
                      {slot.startTime}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: selectedSlot?.id === slot.id ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
                    }}>
                      до {slot.endTime}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="slide-up" style={{ marginTop: 16 }}>
                <div className="card-flat" style={{ marginBottom: 16 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Выбранный урок</p>
                      <h4>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', fontWeight: 600, marginTop: 2 }}>
                        {selectedSlot.startTime} — {selectedSlot.endTime}
                      </p>
                    </div>
                    <span style={{ fontSize: '2rem' }}>🗓️</span>
                  </div>
                </div>

                <button
                  id="btn-confirm-booking"
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleBook}
                  disabled={booking || !selectedPackageId}
                >
                  {booking ? (
                    <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Бронирование...</>
                  ) : '✅ Подтвердить бронь'}
                </button>
              </div>
            )}
          </div>
        )}

        {!selectedDate && !loading && packages.length > 0 && (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">👆</div>
            <p>Выберите дату со свободными слотами</p>
          </div>
        )}
      </div>
    </div>
  );
}
