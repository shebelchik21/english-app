'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  time: string;
  isBooked: boolean;
  booking: {
    id: number;
    studentName: string;
    username?: string;
  } | null;
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

  const dateString = selectedDate.toISOString().split('T')[0];
  const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

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

  const handleBookSlot = async (time: string) => {
    if (isAdmin) return; // Админ не может бронировать

    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
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
      onBookingComplete();
      onClose();
    } catch (error) {
      alert('Ошибка при бронировании');
      console.error(error);
    } finally {
      setIsBooking(false);
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <p className="text-center text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!isAdmin && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Выберите удобное время для занятия
            </p>
          </div>
        )}

        <div className="space-y-2">
          {slots.map((slot) => {
            const isMyBooking = slot.booking && !isAdmin;
            const canCancel = isMyBooking;

            return (
              <div
                key={slot.time}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${slot.isBooked
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200 hover:border-green-400 cursor-pointer'
                  }
                  ${isBooking ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={() => !slot.isBooked && !isAdmin && handleBookSlot(slot.time)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {slot.isBooked ? '🔴' : '🟢'}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {slot.time}
                      </p>
                      {slot.booking && (
                        <div className="text-sm">
                          <p className="text-gray-700 font-medium">
                            {slot.booking.studentName}
                          </p>
                          {slot.booking.username && (
                            <p className="text-gray-500">
                              @{slot.booking.username}
                            </p>
                          )}
                        </div>
                      )}
                      {!slot.isBooked && !isAdmin && (
                        <p className="text-sm text-green-600">
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
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
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
          className="mt-6 w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
