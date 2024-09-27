'use client';

import { Button } from '@/components//ui/button';
import { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { InvitationLinkForm } from './InvitationLinkForm';

export const CreateInvitationModalTrigger = ({
  studioId,
}: {
  studioId: string;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenState = () => {
    setOpenModal(true);
  };

  return (
    <div className="w-full">
      <Button className="mt-4 w-full" onClick={handleOpenState}>
        Invite a band
      </Button>

      <ModalWrapper
        title="Invite a band"
        openModal={openModal}
        handleOpenModal={() => setOpenModal(false)}
      >
        <InvitationLinkForm
          studioId={studioId}
          handleCloseModal={() => setOpenModal(false)}
        />
      </ModalWrapper>
    </div>
  );
};
