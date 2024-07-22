'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { BandZodType } from '@/types/band';
import { EventContentArg } from '@fullcalendar/core/index.js';

import { useRouter } from 'next/navigation';
import { ScheduleTimeslotModal } from './ScheduleTimeslotModal';
import { UpdateOrDeleteTimeslotModal } from './UpdateOrDeleteTimeslotModal';

const adjustToLocalTime = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - timezoneOffset);

  return localTime;
};

export const StudioSchedule = ({
  bands,
  studioId,
}: {
  bands: BandZodType[];
  studioId: string;
}) => {
  // TODO: Refactor this shit component
  const [openTimeslot, setOpenTimeslot] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rehStartDate, setRehStartDate] = useState<Date | null>(null);
  const router = useRouter();

  // create a hook and return these 2 values from there
  const rehearsals = bands
    .filter((band) => {
      return band.studioId === studioId;
    })
    .flatMap((band) => {
      return band.rehearsals.map((rehearsal) => ({
        ...rehearsal,
        name: band.name,
      }));
    });

  const bandNames = bands
    .filter((band) => {
      return band.studioId === studioId;
    })
    .map((band) => {
      return band.name;
    });

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.date);
    setOpenTimeslot(true);
  };

  return (
    <div className="p-12 overflow-hidden bg-gray-50 min-h-dvh">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        events={rehearsals}
        displayEventEnd={true}
        eventContent={renderSchedule}
        eventClick={(args) => {
          setRehStartDate(args.event.start);
          setOpen(true);
        }}
        dateClick={handleDateClick}
        nowIndicator
        editable
        navLinks
        // This will take us to a custom schedule day page
        navLinkDayClick={(date, jsEvent) => {
          console.log('data', date, jsEvent);

          const dateString = adjustToLocalTime(date)
            .toISOString()
            .split('T')[0];
          router.push(`/studio/${studioId}/${dateString}/`);
        }}
      />

      <ScheduleTimeslotModal
        openTimeslot={openTimeslot}
        handleOpenState={() => {
          setOpenTimeslot(false);
        }}
      >
        <ScheduleTimeslotModal.ScheduleInfo
          bandNames={bandNames}
          studioId={studioId}
          date={selectedDate}
          handleOpenState={() => {
            setOpenTimeslot(false);
          }}
        />
      </ScheduleTimeslotModal>

      <UpdateOrDeleteTimeslotModal
        openUpdateModal={open}
        handleOpenUpdateModal={() => {
          setOpen(false);
        }}
        bands={bands}
        rehearsalStartDate={rehStartDate}
      />
    </div>
  );
};

const renderSchedule = (eventInfo: EventContentArg) => {
  return (
    <div className="w-full mx-3 px-2">
      <p className="text-gray-600 text-xs text-balance">
        {eventInfo.event.extendedProps.name}
      </p>
      <p className="text-blue-950 text-xs">{eventInfo.timeText}</p>
    </div>
  );
};
