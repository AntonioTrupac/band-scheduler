'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReactNode } from 'react';

export const CreateStudioModal = ({
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
