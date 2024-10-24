import { BandZodType, ScheduleFormType } from '@/types/band';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const addMinutes = (date: Date, minutes: number) => {
  const newDate = new Date(date.getTime());
  newDate.setMinutes(date.getMinutes() + minutes);

  return newDate;
};

export const subMinutes = (date: Date, minutes: number) => {
  const newDate = new Date(date.getTime());
  newDate.setMinutes(date.getMinutes() - minutes);

  return newDate;
};

export const hasTimeslotConflict = (
  existingBands: BandZodType[],
  rehearsal: ScheduleFormType['rehearsal'],
): boolean => {
  const dateStart = subMinutes(new Date(rehearsal.start), 15);
  const dateEnd = addMinutes(new Date(rehearsal.end), 15);

  return existingBands.some((band) => {
    return band.rehearsals.some((existingRehearsal) => {
      const existingStart = new Date(existingRehearsal.start);
      const existingEnd = new Date(existingRehearsal.end);

      return (
        (dateStart >= existingStart && dateStart <= existingEnd) ||
        (dateEnd >= existingStart && dateEnd <= existingEnd) ||
        (existingStart >= dateStart && existingStart <= dateEnd) ||
        (existingEnd >= dateStart && existingEnd <= dateEnd)
      );
    });
  });
};

export const isStartBeforeEnd = (start: Date | string, end: Date | string) => {
  return new Date(start) < new Date(end);
};

export const adjustToLocalTime = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - timezoneOffset);

  return localTime;
};

export const addWeeks = (date: Date, weeks: number) => {
  const newDate = new Date(date.getTime());
  newDate.setDate(date.getDate() + weeks * 7);

  return newDate;
};

export type PublicMetadata = {
  role: 'admin' | 'band';
  studioId: string;
};
