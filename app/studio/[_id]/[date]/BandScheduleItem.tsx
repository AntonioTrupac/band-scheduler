'use client';

import { ScheduleFormType } from '@/types/band';

type BandScheduleItemProps = {
  rehearsal: ScheduleFormType['rehearsal'] & { name: string };
  studioId: string;
};

const formatTime = (date: Date | string) => {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(date).toLocaleTimeString('en-US', {
    timeZone: localTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDateComponents = (date: Date) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dateObj = new Date(date);

  const dayNumber = dateObj.getDate();
  const dayName = daysOfWeek[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];

  return { dayNumber, dayName, monthName };
};

export const BandScheduleItem = ({ rehearsal }: BandScheduleItemProps) => {
  const fromTime = formatTime(rehearsal.start);
  const toTime = formatTime(rehearsal.end);

  const { dayNumber, dayName, monthName } = getDateComponents(rehearsal.start);

  return (
    <div className="flex items-center bg-white border-b-[1px] last:rounded-b-sm">
      <div className="border-r-[1px] p-8 flex-grow">{rehearsal.name}</div>
      <div className="border-r-[1px] p-8 min-w-[250px]">{`${dayName}-${dayNumber}-${monthName}`}</div>
      <div className="border-r-[1px] p-8 min-w-[150px]">{fromTime}</div>
      <div className="p-8 min-w-[150px]">{toTime}</div>
    </div>
  );
};
