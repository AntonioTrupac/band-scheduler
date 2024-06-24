'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { BandZodType } from '@/types/band';
import { EventContentArg } from '@fullcalendar/core/index.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export const StudioSchedule = ({
  rehearsals,
}: {
  rehearsals: BandZodType['rehearsals'];
}) => {
  const [openTimeslot, setOpenTimeslot] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDateClick = (arg: DateClickArg) => {
    console.log('CLICKING HERE');
    setOpenTimeslot(true);
    // alert('Day', arg.dayEl.getAttribute('data-date'));
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
        eventClick={(info) => {
          setOpen(true);
        }}
        dateClick={handleDateClick}
        // select={(info) => {
        //   console.log(info);
        // }}
        nowIndicator
        editable
        navLinks
        navLinkDayClick={(date, jsEvent) => {
          router.push(`/studio/`);
        }}
        // selectable={true}
        // selectMirror={true}
      />

      <Dialog open={openTimeslot} onOpenChange={setOpenTimeslot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a timeslot</DialogTitle>
            <DialogDescription>
              Schedule a timeslot for this band
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update timeslot</DialogTitle>
            <DialogDescription>Lets update the timeslot</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
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
