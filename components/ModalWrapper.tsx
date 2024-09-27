'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type ReactNode } from 'react';

export const ModalWrapper = ({
  children,
  openModal,
  handleOpenModal,
  title,
}: {
  children: ReactNode;
  openModal: boolean;
  handleOpenModal: () => void;
  title: string;
}) => {
  return (
    <Dialog open={openModal} onOpenChange={handleOpenModal}>
      {/* TODO: Fix this aria described by */}
      <DialogContent aria-describedby={title}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
