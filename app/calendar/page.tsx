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
