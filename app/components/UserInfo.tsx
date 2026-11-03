'use client';

import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export function UserInfo() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const webAppUser = tg.initDataUnsafe?.user;

      if (webAppUser) {
        setUser(webAppUser);
      }

      setPlatform(tg.platform || 'unknown');
    }
  }, []);

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Приложение должно быть открыто в Telegram
        </p>
        <p className="text-xs text-yellow-600 mt-2">
          Для тестирования откройте через Telegram Mini App
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Информация о пользователе
      </h1>

      <div className="space-y-4">
        {user.photo_url && (
          <div className="flex justify-center mb-4">
            <img
              src={user.photo_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-blue-500"
            />
          </div>
        )}

        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">ID</p>
          <p className="text-lg font-semibold text-gray-800">{user.id}</p>
        </div>

        {user.first_name && (
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Имя</p>
            <p className="text-lg font-semibold text-gray-800">{user.first_name}</p>
          </div>
        )}

        {user.last_name && (
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Фамилия</p>
            <p className="text-lg font-semibold text-gray-800">{user.last_name}</p>
          </div>
        )}

        {user.username && (
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-semibold text-gray-800">@{user.username}</p>
          </div>
        )}

        {user.language_code && (
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Язык</p>
            <p className="text-lg font-semibold text-gray-800">{user.language_code}</p>
          </div>
        )}

        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">Premium</p>
          <p className="text-lg font-semibold text-gray-800">
            {user.is_premium ? '✨ Да' : 'Нет'}
          </p>
        </div>

        {platform && (
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Платформа</p>
            <p className="text-lg font-semibold text-gray-800">{platform}</p>
          </div>
        )}
      </div>
    </div>
  );
}
