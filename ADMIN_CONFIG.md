# Конфигурация администраторов

Добавьте Telegram ID администраторов в переменные окружения:

## Локальная разработка

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
```

## На Vercel

1. Зайдите в настройки проекта на Vercel
2. Settings → Environment Variables
3. Добавьте переменную:
   - Name: `NEXT_PUBLIC_ADMIN_IDS`
   - Value: `123456789,987654321` (ваши Telegram ID через запятую)

## Как узнать свой Telegram ID

1. Напишите боту [@userinfobot](https://t.me/userinfobot)
2. Он пришлет ваш ID
3. Добавьте этот ID в переменную окружения
