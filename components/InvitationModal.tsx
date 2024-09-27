'use client';

import { type ReactNode } from 'react';
import { ModalWrapper } from './ModalWrapper';

export const InvitationModal = ({
  children,
  openModal,
  handleOpenModal,
}: {
  children: ReactNode;
  openModal: boolean;
  handleOpenModal: () => void;
}) => {
  return (
    <ModalWrapper
      openModal={openModal}
      handleOpenModal={handleOpenModal}
      title="Invite a band"
    >
      {children}
    </ModalWrapper>
  );
};
