'use client';

import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Назад в меню</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>📅</span>
            <span>Календарь</span>
          </h1>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl text-gray-600 mb-2">Страница в разработке</p>
            <p className="text-sm text-gray-500">
              Здесь будет календарь занятий
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
