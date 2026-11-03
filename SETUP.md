# Настройка проекта

## Переменные окружения

### Локальная разработка

Создайте файл `.env.local`:

```env
# Telegram ID администраторов (через запятую)
NEXT_PUBLIC_ADMIN_IDS=YOUR_TELEGRAM_ID

# Database connection string (получите из Neon Dashboard)
DATABASE_URL=postgresql://user:password@host.neon.tech/database
```

⚠️ **ВАЖНО:** Никогда не коммитьте файлы с реальными паролями в Git!

### На Vercel

1. Зайдите в Settings → Environment Variables
2. Добавьте:
   - `DATABASE_URL` - строка подключения из Neon Dashboard
   - `NEXT_PUBLIC_ADMIN_IDS` - ваш Telegram ID

## Как узнать свой Telegram ID

1. Напишите боту [@userinfobot](https://t.me/userinfobot)
2. Он пришлет ваш ID
3. Добавьте этот ID в переменную окружения

## База данных

Проект использует **Neon Postgres** (serverless PostgreSQL).

### Как получить DATABASE_URL

1. Зайдите в [Neon Console](https://console.neon.tech)
2. Выберите свой проект
3. Скопируйте Connection String
4. Добавьте его в переменные окружения

### Схема БД

Используется Prisma ORM. Схема находится в `prisma/schema.prisma`.

Основные таблицы:
- `users` - пользователи и администраторы
- `bookings` - бронирования занятий

### API Endpoints

**POST /api/users/register**
- Регистрирует или обновляет пользователя
- Вызывается автоматически при входе в приложение

**GET /api/users/list?telegramId=YOUR_ID**
- Список всех учеников (только для админа)

**POST /api/bookings**
- Создать бронирование

**DELETE /api/bookings**
- Отменить бронирование
