'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LessonsCount } from '../components/LessonsCount';

function LessonsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
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

        <LessonsCount telegramId={Number(telegramId)} />
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="p-8 bg-white rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Загрузка...</p>
          </div>
        </div>
      </div>
    }>
      <LessonsContent />
    </Suspense>
  );
}
