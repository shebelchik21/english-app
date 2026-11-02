import TelegramBot from 'node-telegram-bot-api';
import { TimeSlot } from '@prisma/client';

let bot: TelegramBot | null = null;

function getBot(): TelegramBot | null {
  if (!process.env.BOT_TOKEN) return null;
  if (!bot) {
    bot = new TelegramBot(process.env.BOT_TOKEN);
  }
  return bot;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export async function sendBookingConfirmation(telegramId: string, slot: TimeSlot): Promise<void> {
  const bot = getBot();
  if (!bot) return;

  const message = `✅ *Урок забронирован!*\n\n` +
    `📅 ${formatDate(slot.date)}\n` +
    `🕐 ${slot.startTime} — ${slot.endTime}\n\n` +
    `Ожидайте подтверждения от учителя.`;

  await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
}

export async function sendBookingReminder(
  telegramId: string,
  slot: TimeSlot,
  isConfirmation = false
): Promise<void> {
  const bot = getBot();
  if (!bot) return;

  if (isConfirmation) {
    const message = `🎉 *Урок подтверждён!*\n\n` +
      `📅 ${formatDate(slot.date)}\n` +
      `🕐 ${slot.startTime} — ${slot.endTime}\n\n` +
      `До встречи на уроке! 📚`;

    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } else {
    const message = `⏰ *Напоминание об уроке*\n\n` +
      `Завтра у вас урок:\n` +
      `📅 ${formatDate(slot.date)}\n` +
      `🕐 ${slot.startTime} — ${slot.endTime}\n\n` +
      `Не забудьте подготовиться! 📖`;

    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  }
}

export async function sendBookingCancellation(telegramId: string, slot: TimeSlot): Promise<void> {
  const bot = getBot();
  if (!bot) return;

  const message = `❌ *Урок отменён*\n\n` +
    `📅 ${formatDate(slot.date)}\n` +
    `🕐 ${slot.startTime} — ${slot.endTime}\n\n` +
    `Урок был возвращён в ваш абонемент.`;

  await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
}

export async function sendPackageAssigned(
  telegramId: string,
  packageName: string,
  lessonsTotal: number,
  expiresAt: Date
): Promise<void> {
  const bot = getBot();
  if (!bot) return;

  const message = `🎁 *Новый пакет уроков!*\n\n` +
    `📦 ${packageName}\n` +
    `📚 Уроков: ${lessonsTotal}\n` +
    `⏳ Действует до: ${formatDate(expiresAt)}\n\n` +
    `Откройте приложение чтобы забронировать занятия!`;

  await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
}
