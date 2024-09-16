'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { BandZodType } from '@/types/band';
import {
  DayCellContentArg,
  EventContentArg,
} from '@fullcalendar/core/index.js';
import { format } from 'date-fns';

import { useRouter } from 'next/navigation';
import { ScheduleTimeslotModal } from './scheduleModal/ScheduleTimeslotModal';
import { UpdateOrDeleteTimeslotModal } from './UpdateOrDeleteTimeslotModal';
import { useBand } from '@/hooks/use-band';
import { adjustToLocalTime } from '@/lib/utils';
import { useStudioSchedule } from '@/hooks/use-studio-schedule';
import { useEffect, useRef, useState } from 'react';

export const StudioSchedule = ({
  bands,
  studioId,
}: {
  bands: BandZodType[];
  studioId: string;
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    // Update the date once at midnight
    const timeUntilMidnight =
      new Date(currentDate).setHours(24, 0, 0, 0) - Date.now();
    const timeout = setTimeout(() => {
      setCurrentDate(new Date());
    }, timeUntilMidnight);

    // Resize handling
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);

      // Check if we've crossed the mobile breakpoint
      if (
        (windowWidth < 768 && newWidth >= 768) ||
        (windowWidth >= 768 && newWidth < 768)
      ) {
        // Force FullCalendar to redraw
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.changeView(
            newWidth < 768 ? 'timeGridDay' : 'dayGridMonth',
          );
          calendarApi.updateSize();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentDate, windowWidth]);

  const router = useRouter();
  const { getRehearsals, getBandNames } = useBand();
  const {
    isCreateModalOpen,
    isUpdateModalOpen,
    selectedDate,
    rehearsalStartDate,
    openTimeslotModal,
    openUpdateModal,
    closeTimeslotModal,
    closeUpdateModal,
  } = useStudioSchedule();

  const rehearsals = getRehearsals(bands, studioId);
  const bandNames = getBandNames(bands, studioId);

  const handleDateClick = (arg: DateClickArg) => {
    if (arg.date >= currentDate) {
      openTimeslotModal(arg.date);
    }
  };

  const dayCellClassNames = (arg: DayCellContentArg) => {
    const isDisabled = arg.date < currentDate;
    return isDisabled ? 'disabled-day' : 'bg-white';
  };

  const isMobile = windowWidth < 768;

  return (
    <div className="p-4 md:p-12 overflow-hidden bg-gray-50 min-h-dvh">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: isMobile ? 'timeGridDay,timeGridWeek' : '',
        }}
        height={isMobile ? 'auto' : undefined}
        aspectRatio={isMobile ? 0.5 : 1.35}
        views={{
          timeGridDay: {
            type: 'timeGrid',
            duration: { days: 1 },
            buttonText: 'day',
          },
          timeGridWeek: {
            type: 'timeGrid',
            duration: { weeks: 1 },
            buttonText: 'week',
          },
          dayGridMonth: {
            type: 'dayGrid',
            duration: { months: 1 },
            buttonText: 'month',
          },
        }}
        events={rehearsals}
        displayEventEnd
        eventContent={renderSchedule}
        eventClick={(args) => {
          if (args.event.start && args.event.start >= currentDate) {
            openUpdateModal(args.event.start);
          }
        }}
        dateClick={handleDateClick}
        nowIndicator
        editable
        navLinks
        // This will take us to a custom schedule day page
        navLinkDayClick={(date) => {
          if (date >= currentDate) {
            const dateString = adjustToLocalTime(date)
              .toISOString()
              .split('T')[0];
            router.push(`/studio/${studioId}/${dateString}/`);
          }
        }}
        validRange={{ start: '1970-01-01' }}
        selectConstraint={{ start: currentDate }}
        dayCellContent={(arg) => <DayCell arg={arg} today={currentDate} />}
        initialDate={currentDate}
        dayCellClassNames={dayCellClassNames}
        slotLabelInterval={'02:00'}
        allDaySlot={false}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: true,
          meridiem: 'short',
        }}
      />

      <ScheduleTimeslotModal
        isOpen={isCreateModalOpen}
        onClose={closeTimeslotModal}
      >
        <ScheduleTimeslotModal.ScheduleInfo
          bandNames={bandNames}
          studioId={studioId}
          date={selectedDate}
          onClose={closeTimeslotModal}
        />
      </ScheduleTimeslotModal>

      <UpdateOrDeleteTimeslotModal
        openUpdateModal={isUpdateModalOpen}
        handleOpenUpdateModal={closeUpdateModal}
        bands={bands}
        rehearsalStartDate={rehearsalStartDate}
      />
    </div>
  );
};

const renderSchedule = (eventInfo: EventContentArg) => {
  const { event } = eventInfo;
  const isMobile = window.innerWidth < 768;
  const startTime = format(event.start!, isMobile ? 'HH:mm' : 'HH:mm');
  const endTime = event.end
    ? format(event.end, isMobile ? 'HH:mm' : 'HH:mm')
    : '';

  return (
    <div className="event-content text-xs md:text-sm">
      <div className="event-time font-semibold">
        {startTime}
        {endTime && ` - ${endTime}`}
      </div>
      <div className="event-title truncate">{event.title}</div>
    </div>
  );
};

type DayCellProps = {
  arg: DayCellContentArg;
  today: Date;
};

const DayCell = ({ arg, today }: DayCellProps) => {
  const isDisabled = arg.date < today;
  return (
    <div className={`fc-daygrid-day-top ${isDisabled ? 'opacity-90' : ''}`}>
      <span
        className={`fc-daygrid-day-number ${isDisabled ? 'text-gray-500 hover:no-underline' : ''}`}
      >
        {arg.dayNumberText}
      </span>
    </div>
  );
};
