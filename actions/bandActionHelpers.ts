import { addMinutes, addWeeks, subMinutes } from '@/lib/utils';
import { ScheduleFormType } from '@/types/band';

export const createRehearsals = (
  rehearsal: ScheduleFormType['rehearsal'],
  weeks: number,
) => {
  const rehearsals = [];

  // this means that 'do not repeat' is selected
  if (weeks === 0) {
    rehearsals.push({
      ...rehearsal,
      start: subMinutes(rehearsal.start, 15),
      end: addMinutes(rehearsal.end, 15),
    });
  } else {
    for (let i = 0; i < weeks; i++) {
      const start = addWeeks(rehearsal.start, i);
      const end = addWeeks(rehearsal.end, i);

      rehearsals.push({
        ...rehearsal,
        start: subMinutes(start, 15),
        end: addMinutes(end, 15),
      });
    }
  }

  return rehearsals;
};
