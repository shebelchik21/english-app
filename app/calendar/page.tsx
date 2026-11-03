'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarWidget } from '../components/CalendarWidget';

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const telegramId = searchParams.get('telegramId');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!telegramId) {
      router.push('/');
      return;
    }

    // Проверяем, является ли пользователь админом
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',').map(id => Number(id.trim())) || [];
    setIsAdmin(adminIds.includes(Number(telegramId)));
  }, [telegramId, router]);

  if (!telegramId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 font-medium"
          >
            <span className="text-xl">←</span>
            <span>Назад в меню</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-100">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📅</span>
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Календарь</span>
          </h1>

          <CalendarWidget telegramId={Number(telegramId)} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}
