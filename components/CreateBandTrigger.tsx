'use client';

import { Button } from '@/components//ui/button';
import { useState } from 'react';
import { BandForm } from './BandForm';
import { ModalWrapper } from './ModalWrapper';

export const CreateBandTrigger = ({ id }: { id: string }) => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenState = () => {
    setOpenModal(true);
  };

  return (
    <div>
      <Button onClick={handleOpenState}>Create a band</Button>

      <ModalWrapper
        openModal={openModal}
        handleOpenModal={() => setOpenModal(false)}
        title="Create a band"
      >
        <BandForm studioId={id} handleCloseModal={() => setOpenModal(false)} />
      </ModalWrapper>
    </div>
  );
};
