'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type ReactNode } from 'react';

export const CreateBandModal = ({
  children,
  openModal,
  handleOpenModal,
}: {
  children: ReactNode;
  openModal: boolean;
  handleOpenModal: () => void;
}) => {
  return (
    <Dialog open={openModal} onOpenChange={handleOpenModal}>
      {/* TODO: Fix this aria described by */}
      <DialogContent aria-describedby="whatever">
        <DialogHeader>
          <DialogTitle>Create a studio</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
