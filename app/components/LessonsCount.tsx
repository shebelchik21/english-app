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
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Оставшиеся занятия
      </h2>

      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {lessonsRemaining ?? 0}
          </div>
          <p className="text-gray-600">
            {lessonsRemaining === 1 ? 'занятие' : lessonsRemaining && lessonsRemaining > 1 && lessonsRemaining < 5 ? 'занятия' : 'занятий'}
          </p>
        </div>
      </div>

      {lessonsRemaining === 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            У вас закончились занятия. Свяжитесь с преподавателем для пополнения.
          </p>
        </div>
      )}
    </div>
  );
}
