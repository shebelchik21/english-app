'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium: boolean;
  photoUrl?: string;
  isAdmin: boolean;
  lessonsRemaining: number;
  createdAt: string;
  lastVisitAt: string;
}

interface StudentsListProps {
  telegramId: number;
}

export function StudentsList({ telegramId }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lessonsToAdd, setLessonsToAdd] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/users/list?telegramId=${telegramId}`);

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 403) {
            setError('Доступ запрещен. Только для администраторов.');
          } else {
            setError(`Ошибка при загрузке списка учеников: ${errorData.details || errorData.error || 'Unknown error'}`);
          }
          return;
        }

        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        setError(`Ошибка при загрузке данных: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [telegramId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query) ||
        student.username?.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleAddLessons = async () => {
    if (!selectedStudent || !lessonsToAdd) return;

    const amount = parseInt(lessonsToAdd);
    if (isNaN(amount) || amount === 0) {
      alert('Введите корректное число');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/update-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminTelegramId: telegramId,
          studentTelegramId: selectedStudent.telegramId,
          lessonsToAdd: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lessons');
      }

      const data = await response.json();

      // Обновляем локальное состояние
      setStudents(prev => prev.map(s =>
        s.telegramId === selectedStudent.telegramId
          ? { ...s, lessonsRemaining: data.lessonsRemaining }
          : s
      ));

      setSelectedStudent({
        ...selectedStudent,
        lessonsRemaining: data.lessonsRemaining,
      });

      setLessonsToAdd('');
      alert(`Успешно ${amount > 0 ? 'добавлено' : 'удалено'} ${Math.abs(amount)} занятий`);
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSinceLastVisit = (dateString: string) => {
    const now = new Date();
    const lastVisit = new Date(dateString);
    const diffMs = now.getTime() - lastVisit.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    return `${diffDays} дн. назад`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }

  // Модальное окно для управления занятиями
  if (selectedStudent) {
    return (
      <div className="w-full">
        <button
          onClick={() => setSelectedStudent(null)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Назад к списку</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            {selectedStudent.photoUrl ? (
              <img
                src={selectedStudent.photoUrl}
                alt={selectedStudent.firstName}
                className="w-20 h-20 rounded-2xl border-4 border-purple-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-md">
                {selectedStudent.firstName[0]}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedStudent.firstName} {selectedStudent.lastName || ''}
              </h2>
              {selectedStudent.username && (
                <p className="text-gray-600 font-medium">@{selectedStudent.username}</p>
              )}
            </div>
          </div>

          <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Оставшиеся занятия</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {selectedStudent.lessonsRemaining}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Добавить/удалить занятия:
              </label>
              <input
                type="number"
                value={lessonsToAdd}
                onChange={(e) => setLessonsToAdd(e.target.value)}
                placeholder="Введите количество (например, 5 или -2)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all"
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-600 mt-2 mb-3 font-medium">
                💡 Положительное число для добавления, отрицательное для удаления
              </p>
              <button
                onClick={handleAddLessons}
                disabled={isUpdating || !lessonsToAdd}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-95"
              >
                {isUpdating ? 'Сохранение...' : 'Применить'}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">ID:</span>
              <span className="text-gray-600">{selectedStudent.telegramId}</span>
            </div>
            {selectedStudent.languageCode && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Язык:</span>
                <span className="text-gray-600">{selectedStudent.languageCode.toUpperCase()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Регистрация:</span>
              <span className="text-gray-600">{formatDate(selectedStudent.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Последний визит:</span>
              <span className="text-gray-600">{getTimeSinceLastVisit(selectedStudent.lastVisitAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">Всего учеников</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {students.length}
            </p>
          </div>
        </div>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Поиск по имени или нику..."
          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all text-gray-900"
        />
      </div>

      {filteredStudents.length === 0 && searchQuery && (
        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl text-center">
          <p className="text-gray-600 font-medium">Ничего не найдено</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
          >
            <div className="flex items-start gap-3">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.firstName}
                  className="w-14 h-14 rounded-xl border-3 border-purple-500 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {student.firstName[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate text-base">
                    {student.firstName} {student.lastName || ''}
                  </h3>
                  {student.isAdmin && (
                    <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-bold rounded-lg">
                      Админ
                    </span>
                  )}
                  {student.isPremium && (
                    <span className="text-amber-500">✨</span>
                  )}
                </div>

                {student.username && (
                  <p className="text-sm text-gray-600 font-medium mb-2">@{student.username}</p>
                )}

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-700">Занятий:</span>
                    <span className={`font-bold ${student.lessonsRemaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {student.lessonsRemaining}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium">
                    {getTimeSinceLastVisit(student.lastVisitAt)}
                  </div>
                </div>
              </div>

              <div className="text-gray-400 self-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="p-10 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-gray-600 font-medium">Пока нет зарегистрированных учеников</p>
          </div>
        )}
      </div>
    </div>
  );
}
