# Конфигурация администраторов и базы данных

## Переменные окружения

### Локальная разработка

Создайте файл `.env.local`:

```env
# Telegram ID администраторов (через запятую)
NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
```

Файл `.env` уже создан с connection string к Neon Postgres.

### На Vercel

1. Зайдите в настройки проекта на Vercel
2. Settings → Environment Variables
3. Добавьте переменные:

   **DATABASE_URL:**
   ```
   postgresql://neondb_owner:npg_KgaX1DsT5uVk@ep-solitary-base-b9igdobu-pooler.c-7.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

   **NEXT_PUBLIC_ADMIN_IDS:**
   ```
   123456789,987654321
   ```
   (замените на ваши реальные Telegram ID)

## Как узнать свой Telegram ID

1. Напишите боту [@userinfobot](https://t.me/userinfobot)
2. Он пришлет ваш ID
3. Добавьте этот ID в переменную окружения

## База данных

Проект использует **Neon Postgres** (serverless PostgreSQL).

### Схема БД

Таблица `users`:
- `id` - автоинкремент ID
- `telegramId` - уникальный Telegram ID пользователя
- `firstName` - имя
- `lastName` - фамилия (опционально)
- `username` - username (опционально)
- `languageCode` - код языка
- `isPremium` - статус Premium
- `photoUrl` - URL фото профиля
- `isAdmin` - флаг администратора
- `createdAt` - дата регистрации
- `updatedAt` - дата последнего обновления
- `lastVisitAt` - дата последнего визита

### API Endpoints

**POST /api/users/register**
- Регистрирует нового пользователя или обновляет существующего
- Автоматически вызывается при входе пользователя в приложение

**GET /api/users/list?telegramId=YOUR_ID**
- Возвращает список всех пользователей
- Доступен только администраторам
