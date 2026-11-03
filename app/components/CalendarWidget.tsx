'use client';

import { useState, useEffect } from 'react';

interface CalendarProps {
  currentDate: Date;
}

function Calendar({ currentDate }: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Получаем первый день месяца
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // День недели первого дня (0 = воскресенье, нужно сдвинуть для понедельника)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Количество дней в месяце
  const daysInMonth = lastDayOfMonth.getDate();

  // Создаем массив дней
  const days = [];

  // Пустые ячейки до первого дня месяца
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {monthNames[month]} {year}
        </h2>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = isCurrentMonth && day === todayDate;

          return (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                ${day === null
                  ? 'bg-transparent'
                  : isToday
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-900'
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Инициализируем дату только на клиенте
  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  const goToPreviousMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Показываем календарь только после монтирования
  if (!mounted || !currentDate) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Навигация */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Сегодня
        </button>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Календарь */}
      <Calendar currentDate={currentDate} />

      {/* Подсказка */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Здесь будет отображаться расписание занятий
        </p>
      </div>
    </div>
  );
}
