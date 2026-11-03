'use client';

import { useEffect, useState } from 'react';

interface LessonsCountProps {
  telegramId: number;
}

export function LessonsCount({ telegramId }: LessonsCountProps) {
  const [lessonsRemaining, setLessonsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/users/lessons?telegramId=${telegramId}`);

        if (response.ok) {
          const data = await response.json();
          setLessonsRemaining(data.lessonsRemaining);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [telegramId]);

  if (isLoading) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <span>Мои занятия</span>
        </h2>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-center p-10 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 rounded-2xl shadow-inner">
          <div className="text-center">
            <div className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              {lessonsRemaining ?? 0}
            </div>
            <p className="text-lg text-gray-700 font-semibold">
              {lessonsRemaining === 1 ? 'занятие' : lessonsRemaining && lessonsRemaining > 1 && lessonsRemaining < 5 ? 'занятия' : 'занятий'}
            </p>
          </div>
        </div>

        {lessonsRemaining === 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">Занятия закончились</p>
                <p className="text-sm text-amber-800">
                  Свяжитесь с преподавателем для пополнения баланса
                </p>
              </div>
            </div>
          </div>
        )}

        {lessonsRemaining && lessonsRemaining > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-bold text-green-900 mb-1">Всё готово!</p>
                <p className="text-sm text-green-800">
                  Вы можете записаться на занятия через календарь
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
