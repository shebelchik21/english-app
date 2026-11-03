'use client';

import { useState, useEffect } from 'react';
import { TimeSlotSelector } from './TimeSlotSelector';

interface CalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  bookedDates: Set<string>;
}

function Calendar({ currentDate, onDateClick, bookedDates }: CalendarProps) {
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

  const isDateBooked = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    return bookedDates.has(dateString);
  };

  const isPastDate = (day: number) => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {monthNames[month]} {year}
        </h2>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square"></div>;
          }

          const isToday = isCurrentMonth && day === todayDate;
          const hasBooking = isDateBooked(day);
          const isPast = isPastDate(day);

          return (
            <div
              key={index}
              onClick={() => !isPast && onDateClick(new Date(year, month, day))}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-base font-semibold relative
                transition-all duration-200
                ${isPast
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isToday
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold cursor-pointer hover:shadow-lg hover:scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer text-gray-900 hover:scale-105'
                }
              `}
            >
              {day}
              {hasBooking && !isPast && (
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CalendarWidgetProps {
  telegramId: number;
  isAdmin: boolean;
}

export function CalendarWidget({ telegramId, isAdmin }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [lessonsRemaining, setLessonsRemaining] = useState<number>(0);

  // Инициализируем дату только на клиенте
  useEffect(() => {
    setCurrentDate(new Date());
    if (!isAdmin) {
      fetchLessonsRemaining();
    }
  }, []);

  // Загружаем забронированные даты при изменении месяца
  useEffect(() => {
    if (currentDate) {
      fetchBookedDates();
    }
  }, [currentDate]);

  const fetchBookedDates = async () => {
    if (!currentDate) return;

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const response = await fetch(
        `/api/bookings/dates?year=${year}&month=${month}&telegramId=${telegramId}`
      );

      if (response.ok) {
        const data = await response.json();
        setBookedDates(new Set(data.dates));
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
    }
  };

  const fetchLessonsRemaining = async () => {
    try {
      const response = await fetch(`/api/users/lessons?telegramId=${telegramId}`);
      if (response.ok) {
        const data = await response.json();
        setLessonsRemaining(data.lessonsRemaining);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

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

  const handleDateClick = (date: Date) => {
    if (!isAdmin && lessonsRemaining <= 0) {
      alert('У вас не осталось занятий. Обратитесь к администратору.');
      return;
    }
    setSelectedDate(date);
  };

  const handleBookingComplete = () => {
    fetchBookedDates();
    if (!isAdmin) {
      fetchLessonsRemaining();
    }
  };

  // Показываем скелетон пока не загрузилось
  if (!currentDate) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Информация о занятиях для студента */}
      {!isAdmin && (
        <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Доступно занятий</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{lessonsRemaining}</p>
            </div>
          </div>
        </div>
      )}

      {/* Навигация */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          Сегодня
        </button>

        <button
          onClick={goToNextMonth}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Календарь */}
      <Calendar
        currentDate={currentDate}
        onDateClick={handleDateClick}
        bookedDates={bookedDates}
      />

      {/* Легенда */}
      <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl">
        <p className="text-sm text-gray-700 mb-3 font-bold">Обозначения:</p>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm"></div>
            <span className="text-gray-800 font-medium">Сегодня</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg relative shadow-sm">
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-800 font-medium">Есть занятие</span>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора времени */}
      {selectedDate && (
        <TimeSlotSelector
          selectedDate={selectedDate}
          telegramId={telegramId}
          isAdmin={isAdmin}
          onClose={() => setSelectedDate(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
