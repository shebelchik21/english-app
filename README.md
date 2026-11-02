# 📚 English School — Telegram Mini App

Платформа для студентов онлайн школы английского языка, работающая как Telegram Mini App.

## 🏗️ Структура проекта

```
telegram-app/
├── frontend/          # React + Vite (Telegram Mini App)
├── backend/           # Node.js + Express + Prisma
└── docker-compose.yml # PostgreSQL
```

## 🚀 Запуск

### 1. База данных (PostgreSQL через Docker)
```bash
docker-compose up -d
```

### 2. Бэкенд
```bash
cd backend
cp .env.example .env
# Отредактируй .env: добавь BOT_TOKEN и свой ADMIN_TELEGRAM_IDS
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed   # (опционально) тестовые данные
npm run dev
```

### 3. Фронтенд
```bash
cd frontend
npm run dev
```

## ⚙️ Настройка

### `.env` (backend)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/english_school"
PORT=3001
BOT_TOKEN="ваш_токен_от_@BotFather"
ADMIN_TELEGRAM_IDS="ваш_telegram_id"
NODE_ENV=development
```

### Получить Telegram ID
Напишите боту [@userinfobot](https://t.me/userinfobot) — он вернёт ваш числовой ID.

### Создать бота
1. Откройте [@BotFather](https://t.me/BotFather)
2. `/newbot` → введите имя и username
3. Скопируйте токен в `.env`
4. `/newapp` → укажите URL вашего задеплоенного фронтенда

## 👥 Роли

| Роль | Функции |
|------|---------|
| **Студент** | Просмотр абонементов, бронирование слотов, история уроков |
| **Администратор** | Управление студентами, назначение пакетов, добавление слотов, подтверждение броней |

## 📱 Деплой на продакшен

### Фронтенд (Vercel / Netlify)
```bash
cd frontend
npm run build
# Задеплой папку dist/
```

### Бэкенд (Railway / Render / VPS)
```bash
cd backend
npm run build
npm start
```

### Prisma схема
Файл `backend/src/prisma/schema.prisma` → для стандартного пути нужно обновить в `package.json`:
```json
"prisma": { "schema": "src/prisma/schema.prisma" }
