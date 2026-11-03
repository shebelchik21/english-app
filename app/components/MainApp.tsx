'use client';

import { useEffect, useState } from 'react';
import { Menu } from './Menu';

export function MainApp() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const registerUser = async (user: any) => {
      try {
        await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            languageCode: user.language_code,
            isPremium: user.is_premium,
            photoUrl: user.photo_url,
          }),
        });
      } catch (error) {
        console.error('Failed to register user:', error);
      }
    };

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const webAppUser = tg.initDataUnsafe?.user;

      if (webAppUser) {
        setUserId(webAppUser.id);

        // Получаем список админов из переменной окружения
        const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',').map(id => Number(id.trim())) || [];
        setIsAdmin(adminIds.includes(webAppUser.id));

        // Регистрируем/обновляем пользователя в БД
        registerUser(webAppUser);
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!userId) {
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

  return <Menu isAdmin={isAdmin} telegramId={userId} />;
}
