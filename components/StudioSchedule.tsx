'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { BandZodType } from '@/types/band';
import { EventContentArg } from '@fullcalendar/core/index.js';

import { useRouter } from 'next/navigation';
import { ScheduleTimeslotModal } from './scheduleModal/ScheduleTimeslotModal';
import { UpdateOrDeleteTimeslotModal } from './UpdateOrDeleteTimeslotModal';
import { useBand } from '@/hooks/use-band';
import { adjustToLocalTime } from '@/lib/utils';
import { useStudioSchedule } from '@/hooks/use-studio-schedule';

export const StudioSchedule = ({
  bands,
  studioId,
}: {
  bands: BandZodType[];
  studioId: string;
}) => {
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

  const handleDateClick = (arg: DateClickArg) => openTimeslotModal(arg.date);

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
        eventClick={(args) => openUpdateModal(args.event.start)}
        dateClick={handleDateClick}
        nowIndicator
        editable
        navLinks
        // This will take us to a custom schedule day page
        navLinkDayClick={(date) => {
          const dateString = adjustToLocalTime(date)
            .toISOString()
            .split('T')[0];
          router.push(`/studio/${studioId}/${dateString}/`);
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
  return (
    <div className="w-full mx-3 px-2">
      <p className="text-gray-600 text-xs text-balance">
        {eventInfo.event.extendedProps.name}
      </p>
      <p className="text-blue-950 text-xs">{eventInfo.timeText}</p>
    </div>
  );
};
