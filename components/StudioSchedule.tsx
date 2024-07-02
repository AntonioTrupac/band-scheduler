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

  const rehearsals = bands
    .filter((band) => {
      return band.studioId === studioId;
    })
    .flatMap((band) => {
      return band.rehearsals;
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
    <div className="p-12 overflow-hidden">
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
          // Just for testing
          router.push(`/studio/`);
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
    <div className="w-full px-3">
      <p className="text-slate-800">{eventInfo.timeText}</p>
      <p className="text-gray-600 text-wrap">Band: {eventInfo.event.title}</p>
    </div>
  );
};
