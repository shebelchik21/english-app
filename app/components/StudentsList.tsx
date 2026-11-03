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
  createdAt: string;
  lastVisitAt: string;
}

interface StudentsListProps {
  telegramId: number;
}

export function StudentsList({ telegramId }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(`Ошибка при загрузке данных: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [telegramId]);

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

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Всего учеников: {students.length}
        </h2>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
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

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                  <div>
                    <span className="font-medium">ID:</span> {student.telegramId}
                  </div>
                  {student.languageCode && (
                    <div>
                      <span className="font-medium">Язык:</span> {student.languageCode.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Регистрация:</span>{' '}
                    {formatDate(student.createdAt)}
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <span className="text-gray-500">Последний визит: </span>
                  <span className="font-medium text-gray-700">
                    {getTimeSinceLastVisit(student.lastVisitAt)}
                  </span>
                </div>
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
