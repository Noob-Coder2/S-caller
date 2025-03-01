// Updated utils/dateUtils.ts
import { format, formatDistance } from 'date-fns';

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  if (isToday(date)) return format(date, 'HH:mm');
  if (isThisYear(date)) return format(date, 'MMM d, HH:mm');
  return format(date, 'MMM d, yyyy HH:mm');
};

export const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getRelativeTime = (timestamp: number): string => {
  return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isThisYear = (date: Date): boolean => {
  return date.getFullYear() === new Date().getFullYear();
};