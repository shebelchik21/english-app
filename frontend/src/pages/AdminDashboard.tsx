import { useState, useEffect } from 'react';
import { studentsApi, packagesApi, slotsApi, bookingsApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  initialTab?: 'schedule' | 'students' | 'bookings';
}

interface Student {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  telegramId: string;
  packages: Array<{
    id: number;
    name: string;
    lessonsTotal: number;
    lessonsUsed: number;
    expiresAt: string;
    isActive: boolean;
  }>;
}

interface Booking {
  id: number;
  status: string;
  student: { firstName: string; lastName: string | null };
  slot: { date: string; startTime: string; endTime: string };
  package: { name: string };
}

type AdminTab = 'schedule' | 'students' | 'bookings';

export default function AdminDashboard({ initialTab = 'schedule' }: AdminDashboardProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ id: number; date: string; startTime: string; endTime: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Add slot modal
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('10:00');
  const [slotEnd, setSlotEnd] = useState('11:00');
  const [addingSlot, setAddingSlot] = useState(false);

  // Add package modal
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [pkgName, setPkgName] = useState('Пакет 8 уроков');
  const [pkgLessons, setPkgLessons] = useState(8);
  const [pkgExpiry, setPkgExpiry] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [addingPkg, setAddingPkg] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      studentsApi.getAll(),
      bookingsApi.getAll(),
      slotsApi.getAll(),
    ]).then(([studRes, bookRes, slotsRes]) => {
      setStudents(studRes.data);
      setBookings(bookRes.data);
      setAvailableSlots(slotsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddSlot = async () => {
    if (!slotDate || !slotStart || !slotEnd) return;
    setAddingSlot(true);
    try {
      const res = await slotsApi.create({ date: slotDate, startTime: slotStart, endTime: slotEnd });
      setAvailableSlots(prev => [...prev, res.data]);
      showToast('✅ Слот добавлен', 'success');
      setShowAddSlot(false);
    } catch {
      showToast('Ошибка при создании слота', 'error');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await slotsApi.delete(id);
      setAvailableSlots(prev => prev.filter(s => s.id !== id));
      showToast('Слот удалён', 'success');
    } catch {
      showToast('Нельзя удалить забронированный слот', 'error');
    }
  };

  const handleAddPackage = async () => {
    if (!selectedStudentId || !pkgName || !pkgLessons || !pkgExpiry) return;
    setAddingPkg(true);
    try {
      await packagesApi.createPackage({
        name: pkgName,
        lessonsTotal: pkgLessons,
        expiresAt: pkgExpiry,
        studentId: selectedStudentId,
      });
      showToast(`✅ Пакет "${pkgName}" назначен`, 'success');
      setShowAddPackage(false);
      // Refresh students
      const res = await studentsApi.getAll();
      setStudents(res.data);
    } catch {
      showToast('Ошибка при создании пакета', 'error');
    } finally {
      setAddingPkg(false);
    }
  };

  const handleConfirmBooking = async (id: number) => {
    try {
      await bookingsApi.confirm(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b));
      showToast('✅ Бронирование подтверждено', 'success');
    } catch {
      showToast('Ошибка при подтверждении', 'error');
    }
  };

  const handleCancelBooking = async (id: number) => {
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      showToast('Бронирование отменено', 'success');
    } catch {
      showToast('Ошибка', 'error');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const upcomingSlots = availableSlots.filter(s => new Date(s.date) >= new Date());
  const initials = user ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase() : 'A';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-yellow', CONFIRMED: 'badge-green',
      CANCELLED: 'badge-red', COMPLETED: 'badge-blue',
    };
    const labels: Record<string, string> = {
      PENDING: '⏳ Ожидает', CONFIRMED: '✅ Подтверждён',
      CANCELLED: '❌ Отменён', COMPLETED: '🎓 Завершён',
    };
    return <span className={`badge ${map[status] || 'badge-blue'}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="app-container">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page">
        {/* Header */}
        <div className="page-header fade-in">
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Панель учителя</p>
            <h1 style={{ fontSize: '1.4rem' }}>{user?.firstName} 👩‍🏫</h1>
          </div>
          <div className="avatar avatar-lg" style={{ background: 'var(--grad-secondary)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>
            {initials}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-2 fade-in" style={{ marginBottom: 20, animationDelay: '60ms' }}>
          <div className="stat-card">
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Студентов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: pendingBookings.length > 0 ? undefined : 'var(--text-secondary)', WebkitTextFillColor: pendingBookings.length > 0 ? undefined : 'var(--text-secondary)' }}>
              {pendingBookings.length}
            </div>
            <div className="stat-label">Ожидают подтверждения</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs fade-in" style={{ animationDelay: '120ms' }}>
          <button id="admin-tab-schedule" className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>
            Расписание
          </button>
          <button id="admin-tab-students" className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
            Студенты
          </button>
          <button id="admin-tab-bookings" className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
            Брони {pendingBookings.length > 0 && <span style={{ background: 'rgba(245,158,11,0.3)', borderRadius: 999, padding: '1px 6px', fontSize: '0.7rem', marginLeft: 4 }}>{pendingBookings.length}</span>}
          </button>
        </div>

        {/* ===== SCHEDULE TAB ===== */}
        {tab === 'schedule' && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3>Доступные слоты</h3>
              <button id="btn-add-slot" className="btn btn-primary btn-sm" onClick={() => setShowAddSlot(true)}>
                + Добавить
              </button>
            </div>

            {loading ? (
              <div className="scroll-list">
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : upcomingSlots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📆</div>
                <p>Нет доступных слотов</p>
                <button id="btn-add-slot-empty" className="btn btn-primary btn-sm mt-3" onClick={() => setShowAddSlot(true)}>
                  Добавить слот
                </button>
              </div>
            ) : (
              <div className="scroll-list stagger-children">
                {upcomingSlots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(slot => (
                  <div key={slot.id} className="card-flat fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{ fontSize: '1.5rem' }}>🗓️</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {new Date(slot.date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 500 }}>
                            {slot.startTime} — {slot.endTime}
                          </div>
                        </div>
                      </div>
                      <button
                        id={`btn-delete-slot-${slot.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        style={{ color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== STUDENTS TAB ===== */}
        {tab === 'students' && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3>Студенты ({students.length})</h3>
              <button id="btn-add-package" className="btn btn-primary btn-sm" onClick={() => setShowAddPackage(true)}>
                + Пакет
              </button>
            </div>

            {loading ? (
              <div className="scroll-list">
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👨‍🎓</div>
                <p>Нет студентов</p>
              </div>
            ) : (
              <div className="scroll-list stagger-children">
                {students.map(student => {
                  const activePkg = student.packages?.find(p => p.isActive && new Date(p.expiresAt) > new Date());
                  const left = activePkg ? activePkg.lessonsTotal - activePkg.lessonsUsed : 0;
                  return (
                    <div key={student.id} className="card fade-in">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          {(student.firstName[0] + (student.lastName?.[0] || '')).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 className="truncate">{student.firstName} {student.lastName || ''}</h4>
                          <p style={{ fontSize: '0.78rem' }}>@{student.username || student.telegramId}</p>
                        </div>
                        {activePkg ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {left}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>уроков</div>
                          </div>
                        ) : (
                          <span className="badge badge-red">Нет пакета</span>
                        )}
                      </div>
                      {activePkg && (
                        <div style={{ marginTop: 12 }}>
                          <div className="flex items-center justify-between mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>{activePkg.name}</span>
                            <span>{activePkg.lessonsUsed}/{activePkg.lessonsTotal}</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(activePkg.lessonsUsed / activePkg.lessonsTotal) * 100}%` }} />
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            До {new Date(activePkg.expiresAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== BOOKINGS TAB ===== */}
        {tab === 'bookings' && (
          <div className="fade-in">
            <h3 style={{ marginBottom: 12 }}>Все бронирования</h3>
            {loading ? (
              <div className="scroll-list">
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p>Нет бронирований</p>
              </div>
            ) : (
              <div className="scroll-list stagger-children">
                {bookings.map(booking => (
                  <div key={booking.id} className="card fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <h4>{booking.student.firstName} {booking.student.lastName || ''}</h4>
                      {statusBadge(booking.status)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      📅 {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                      {'  '}🕐 {booking.slot.startTime} — {booking.slot.endTime}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      📦 {booking.package.name}
                    </div>
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          id={`btn-confirm-${booking.id}`}
                          className="btn btn-success btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleConfirmBooking(booking.id)}
                        >
                          ✅ Подтвердить
                        </button>
                        <button
                          id={`btn-cancel-booking-${booking.id}`}
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          ✕ Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ADD SLOT MODAL ===== */}
      {showAddSlot && (
        <div className="modal-overlay" onClick={() => setShowAddSlot(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">Добавить слот</h2>

            <div className="form-group">
              <label className="form-label">Дата</label>
              <input
                id="input-slot-date"
                type="date"
                className="form-input"
                value={slotDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSlotDate(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Начало</label>
                <input
                  id="input-slot-start"
                  type="time"
                  className="form-input"
                  value={slotStart}
                  onChange={e => setSlotStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Конец</label>
                <input
                  id="input-slot-end"
                  type="time"
                  className="form-input"
                  value={slotEnd}
                  onChange={e => setSlotEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button id="btn-cancel-add-slot" className="btn btn-ghost btn-full" onClick={() => setShowAddSlot(false)}>
                Отмена
              </button>
              <button
                id="btn-confirm-add-slot"
                className="btn btn-primary btn-full"
                onClick={handleAddSlot}
                disabled={addingSlot || !slotDate}
              >
                {addingSlot ? 'Сохранение...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD PACKAGE MODAL ===== */}
      {showAddPackage && (
        <div className="modal-overlay" onClick={() => setShowAddPackage(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">Назначить пакет</h2>

            <div className="form-group">
              <label className="form-label">Студент</label>
              <select
                id="select-student"
                className="form-input"
                value={selectedStudentId || ''}
                onChange={e => setSelectedStudentId(Number(e.target.value))}
              >
                <option value="">Выберите студента...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName || ''} (@{s.username || s.telegramId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Название пакета</label>
              <input
                id="input-pkg-name"
                type="text"
                className="form-input"
                value={pkgName}
                onChange={e => setPkgName(e.target.value)}
                placeholder="Пакет 8 уроков"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Кол-во уроков</label>
                <input
                  id="input-pkg-lessons"
                  type="number"
                  className="form-input"
                  value={pkgLessons}
                  min={1}
                  max={100}
                  onChange={e => setPkgLessons(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Действует до</label>
                <input
                  id="input-pkg-expiry"
                  type="date"
                  className="form-input"
                  value={pkgExpiry}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setPkgExpiry(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button id="btn-cancel-add-pkg" className="btn btn-ghost btn-full" onClick={() => setShowAddPackage(false)}>
                Отмена
              </button>
              <button
                id="btn-confirm-add-pkg"
                className="btn btn-primary btn-full"
                onClick={handleAddPackage}
                disabled={addingPkg || !selectedStudentId || !pkgName}
              >
                {addingPkg ? 'Сохранение...' : 'Назначить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
