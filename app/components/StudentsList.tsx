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
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  // Модальное окно для управления занятиями
  if (selectedStudent) {
    return (
      <div className="w-full">
        <button
          onClick={() => setSelectedStudent(null)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span className="text-xl">←</span>
          <span>Назад к списку</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            {selectedStudent.photoUrl ? (
              <img
                src={selectedStudent.photoUrl}
                alt={selectedStudent.firstName}
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-2xl">
                {selectedStudent.firstName[0]}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {selectedStudent.firstName} {selectedStudent.lastName || ''}
              </h2>
              {selectedStudent.username && (
                <p className="text-gray-500">@{selectedStudent.username}</p>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Оставшиеся занятия:</p>
            <p className="text-4xl font-bold text-gray-900">
              {selectedStudent.lessonsRemaining}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Добавить/удалить занятия:
              </label>
              <input
                type="number"
                value={lessonsToAdd}
                onChange={(e) => setLessonsToAdd(e.target.value)}
                placeholder="Введите количество (например, 5 или -2)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-500 mt-2 mb-3">
                Положительное число для добавления, отрицательное для удаления
              </p>
              <button
                onClick={handleAddLessons}
                disabled={isUpdating || !lessonsToAdd}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Сохранение...' : 'Применить'}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">ID:</span> {selectedStudent.telegramId}
            </div>
            {selectedStudent.languageCode && (
              <div>
                <span className="font-medium">Язык:</span> {selectedStudent.languageCode.toUpperCase()}
              </div>
            )}
            <div>
              <span className="font-medium">Регистрация:</span> {formatDate(selectedStudent.createdAt)}
            </div>
            <div>
              <span className="font-medium">Последний визит:</span> {getTimeSinceLastVisit(selectedStudent.lastVisitAt)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          Всего учеников: {students.length}
        </h2>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Поиск по имени или нику..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredStudents.length === 0 && searchQuery && (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          Ничего не найдено
        </div>
      )}

      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.firstName}
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                  {student.firstName[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {student.firstName} {student.lastName || ''}
                  </h3>
                  {student.isAdmin && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                      Админ
                    </span>
                  )}
                  {student.isPremium && (
                    <span className="text-amber-500 text-sm">✨</span>
                  )}
                </div>

                {student.username && (
                  <p className="text-sm text-gray-500 mb-1">@{student.username}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Занятий:</span>
                    <span className={`font-bold ${student.lessonsRemaining === 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {student.lessonsRemaining}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Последний визит:</span>{' '}
                    {getTimeSinceLastVisit(student.lastVisitAt)}
                  </div>
                </div>
              </div>

              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">📚</p>
            <p>Пока нет зарегистрированных учеников</p>
          </div>
        )}
      </div>
    </div>
  );
}
