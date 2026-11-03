'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentsList } from '../components/StudentsList';

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">👥</span>
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Список учеников</span>
          </h1>

          <StudentsList telegramId={Number(telegramId)} />
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="p-8 bg-white rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Загрузка...</p>
          </div>
        </div>
      </div>
    }>
      <StudentsContent />
    </Suspense>
  );
}
