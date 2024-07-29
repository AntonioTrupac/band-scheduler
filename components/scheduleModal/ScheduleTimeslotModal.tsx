'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScheduleInfo } from './ScheduleTimeslotInfo';

export const ScheduleTimeslotModal = ({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-h-[400px]">
        <DialogHeader>
          <DialogTitle>Schedule a timeslot</DialogTitle>
          <DialogDescription>
            Schedule a timeslot for this band
          </DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

ScheduleTimeslotModal.ScheduleInfo = ScheduleInfo;
