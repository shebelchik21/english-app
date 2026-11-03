'use client';

import { useRouter } from 'next/navigation';

interface MenuProps {
  isAdmin: boolean;
  telegramId: number;
}

export function Menu({ isAdmin, telegramId }: MenuProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      {/* Приветствие */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isAdmin ? '👨‍🏫 Панель преподавателя' : '👋 Добро пожаловать!'}
        </h1>
        <p className="text-gray-600">
          {isAdmin ? 'Управление учениками и расписанием' : 'Выберите действие'}
        </p>
      </div>

      {/* Карточки меню */}
      <div className="space-y-4">
        <button
          onClick={() => router.push(`/calendar?telegramId=${telegramId}`)}
          className="group w-full p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-3xl">
                📅
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-1">Календарь</h3>
                <p className="text-blue-100 text-sm">
                  {isAdmin ? 'Просмотр расписания' : 'Записаться на занятие'}
                </p>
              </div>
            </div>
            <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {!isAdmin && (
          <button
            onClick={() => router.push(`/lessons?telegramId=${telegramId}`)}
            className="group w-full p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-3xl">
                  📚
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Мои занятия</h3>
                  <p className="text-purple-100 text-sm">Баланс занятий</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => router.push(`/students?telegramId=${telegramId}`)}
            className="group w-full p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-3xl">
                  👥
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Ученики</h3>
                  <p className="text-green-100 text-sm">Управление учениками</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Бейдж админа */}
      {isAdmin && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Режим преподавателя</p>
              <p className="text-xs text-amber-700">Расширенные возможности</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
