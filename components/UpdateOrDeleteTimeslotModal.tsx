'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BandZodType } from '@/types/band';
import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

const findBandByRehersealStart = (
  bands: BandZodType[],
  rehStartDate: Date | null,
) => {
  if (!rehStartDate) return null;

  const band = bands
    .map((band) => {
      return {
        ...band,
        rehearsals: band.rehearsals.filter((rehearsal) => {
          return rehearsal.start.getTime() === rehStartDate.getTime();
        }),
      };
    })
    .find((band) => band.rehearsals.length > 0);

  // TODO: This needs to be handled higher up in the component tree
  if (!band) return null;

  return band;
};

export const UpdateOrDeleteTimeslotModal = ({
  openUpdateModal,
  handleOpenUpdateModal,
  bands,
  rehearsalStartDate,
}: {
  openUpdateModal: boolean;
  handleOpenUpdateModal: () => void;
  bands: BandZodType[];
  rehearsalStartDate: Date | null;
}) => {
  const [isMainContent, setIsMainContent] = useState(true);
  const handleSwitchContent = () => {
    setIsMainContent((prev) => !prev);
  };

  const band = findBandByRehersealStart(bands, rehearsalStartDate);

  if (!band) {
    // TODO: Handle this case
    return <div></div>;
  }

  return (
    <Dialog open={openUpdateModal} onOpenChange={handleOpenUpdateModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Current timeslot info</DialogTitle>
        </DialogHeader>

        {isMainContent ? (
          <TimeslotInfo handleSwitchContent={handleSwitchContent} band={band} />
        ) : (
          <UpdateForm handleSwitchContent={handleSwitchContent} />
        )}
      </DialogContent>
    </Dialog>
  );
};

const TimeslotInfo = ({
  handleSwitchContent,
  band,
}: {
  handleSwitchContent: () => void;
  band: BandZodType;
}) => {
  // TODO: probably best to import this from utils, maybe need for moment/luxon???? prolly not
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <>
      <div className="my-2 space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Band name</Label>
          <Input type="text" id="name" readOnly value={band.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rehearsal.start">Rehearsal start</Label>
          <Input
            type="text"
            id="rehearsal.start"
            readOnly
            value={formatDateTime(band.rehearsals[0].start)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rehearsal.end">Rehearsal end</Label>
          <Input
            type="text"
            id="rehearsal.end"
            readOnly
            value={formatDateTime(band.rehearsals[0].end)}
          />
        </div>
      </div>

      <DialogFooter>
        <div className="flex justify-between w-full">
          <Button variant="destructive">Delete timeslot</Button>
          <Button onClick={handleSwitchContent}>Update timeslot</Button>
        </div>
      </DialogFooter>
    </>
  );
};

const UpdateForm = ({
  handleSwitchContent,
}: {
  handleSwitchContent: () => void;
}) => {
  return (
    <div>
      <p>Hello update form</p>
      <button onClick={handleSwitchContent}>Switch to timeslot info</button>
    </div>
  );
};
