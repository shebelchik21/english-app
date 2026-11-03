'use client';

import { useRouter } from 'next/navigation';

interface MenuProps {
  isAdmin: boolean;
  telegramId: number;
}

export function Menu({ isAdmin, telegramId }: MenuProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isAdmin ? 'Панель администратора' : 'Меню'}
      </h1>

      <div className="space-y-3">
        <button
          onClick={() => router.push('/calendar')}
          className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-between"
        >
          <span>📅 Календарь</span>
          <span className="text-xl">→</span>
        </button>

        <button
          onClick={() => router.push(`/lessons?telegramId=${telegramId}`)}
          className="w-full p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-between"
        >
          <span>📚 Оставшиеся занятия</span>
          <span className="text-xl">→</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push(`/students?telegramId=${telegramId}`)}
            className="w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-between"
          >
            <span>👥 Ученики</span>
            <span className="text-xl">→</span>
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ✨ Вы вошли как администратор
          </p>
        </div>
      )}
    </div>
  );
}
