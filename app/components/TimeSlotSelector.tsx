'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  time: string;
  isBooked: boolean;
  booking: {
    id: number;
    userId: number;
    telegramId: string;
    studentName: string;
    username?: string;
  } | null;
}

interface Student {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  lessonsRemaining: number;
}

interface TimeSlotSelectorProps {
  selectedDate: Date;
  telegramId: number;
  isAdmin: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

export function TimeSlotSelector({ selectedDate, telegramId, isAdmin, onClose, onBookingComplete }: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];
  const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    fetchSlots();
    if (isAdmin) {
      fetchStudents();
    }
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/users/list?telegramId=${telegramId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch(`/api/bookings?date=${dateString}`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (time: string) => {
    if (isAdmin) {
      setSelectedTime(time);
      setShowStudentSelector(true);
    } else {
      handleBookSlot(time);
    }
  };

  const handleBookSlot = async (time: string, studentTelegramId?: string) => {
    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: studentTelegramId || telegramId,
          date: dateString,
          time,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при бронировании');
        return;
      }

      alert('Занятие успешно забронировано!');
      fetchSlots();
      onBookingComplete();
      if (!isAdmin) {
        onClose();
      } else {
        setShowStudentSelector(false);
        setSelectedStudent(null);
        setSelectedTime(null);
      }
    } catch (error) {
      alert('Ошибка при бронировании');
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    if (student.lessonsRemaining <= 0) {
      alert('У этого ученика нет доступных занятий');
      return;
    }
    if (selectedTime) {
      handleBookSlot(selectedTime, student.telegramId);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Отменить это занятие?')) return;

    setIsBooking(true);
    try {
      const response = await fetch(`/api/bookings?bookingId=${bookingId}&telegramId=${telegramId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при отмене');
        return;
      }

      alert('Занятие отменено');
      fetchSlots();
      onBookingComplete();
    } catch (error) {
      alert('Ошибка при отмене');
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-center text-gray-600 font-medium">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  // Модальное окно выбора студента для админа
  if (showStudentSelector && selectedTime) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Забронировать время
            </h2>
            <button
              onClick={() => {
                setShowStudentSelector(false);
                setSelectedTime(null);
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl text-3xl transition-all duration-200 active:scale-95"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">
              📅 {formattedDate} в {selectedTime}
            </p>
          </div>

          {/* Кнопка "Просто занят" */}
          <button
            onClick={() => handleBookSlot(selectedTime, telegramId.toString())}
            disabled={isBooking}
            className="w-full mb-4 p-4 rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400 hover:shadow-md transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Я занят</p>
                <p className="text-sm text-gray-600">Заблокировать время</p>
              </div>
            </div>
          </button>

          <div className="mb-4 text-center">
            <span className="text-sm text-gray-500 font-medium">или выберите ученика</span>
          </div>

          <div className="space-y-3 mb-6">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                disabled={student.lessonsRemaining <= 0 || isBooking}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${student.lessonsRemaining > 0
                    ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer active:scale-98'
                    : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  }
                  ${isBooking ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">
                      {student.firstName} {student.lastName || ''}
                    </p>
                    {student.username && (
                      <p className="text-sm text-gray-600">@{student.username}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    student.lessonsRemaining > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {student.lessonsRemaining} занятий
                  </div>
                </div>
              </button>
            ))}

            {students.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p>Нет учеников</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowStudentSelector(false);
              setSelectedTime(null);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-900 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl text-3xl transition-all duration-200 active:scale-95"
          >
            ×
          </button>
        </div>

        {!isAdmin && (
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl">
            <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
              <span>💡</span>
              <span>Выберите удобное время для занятия</span>
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-100 rounded-xl">
            <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
              <span>👨‍🏫</span>
              <span>Нажмите на свободное время для бронирования</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          {slots.map((slot) => {
            // Проверяем, является ли это бронирование текущего пользователя
            const isMyBooking = slot.booking && slot.booking.telegramId === telegramId.toString();

            // Для студентов: показываем кнопку отмены только для своих бронирований
            // Для админа: показываем кнопку отмены для всех бронирований
            const canCancel = isAdmin ? !!slot.booking : isMyBooking;

            return (
              <div
                key={slot.time}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${slot.isBooked
                    ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-500 hover:shadow-md cursor-pointer active:scale-98'
                  }
                  ${isBooking ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={() => !slot.isBooked && handleSlotClick(slot.time)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slot.isBooked ? 'bg-red-100' : 'bg-green-100'}`}>
                      <span className="text-2xl">
                        {slot.isBooked ? '🔴' : '🟢'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {slot.time}
                      </p>

                      {/* Для админа показываем информацию о студенте */}
                      {isAdmin && slot.booking && (
                        <div className="text-sm mt-1">
                          <p className="text-gray-800 font-semibold">
                            {slot.booking.studentName}
                          </p>
                          {slot.booking.username && (
                            <p className="text-gray-600">
                              @{slot.booking.username}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Для студента показываем только статус */}
                      {!isAdmin && slot.isBooked && !isMyBooking && (
                        <p className="text-sm text-red-700 font-medium">
                          Занято
                        </p>
                      )}

                      {/* Для студента показываем "Моё занятие" если это его бронирование */}
                      {!isAdmin && isMyBooking && (
                        <p className="text-sm text-blue-700 font-medium">
                          Моё занятие
                        </p>
                      )}

                      {!slot.isBooked && (
                        <p className="text-sm text-green-700 font-medium">
                          Свободно
                        </p>
                      )}
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelBooking(slot.booking!.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-900 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
