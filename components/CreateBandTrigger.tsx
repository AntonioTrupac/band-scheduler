'use client';

import { Button } from '@/components//ui/button';
import { useState } from 'react';
import { CreateBandModal } from './CreateBandModal';
import { BandForm } from './BandForm';

export const CreateBandTrigger = ({ id }: { id: string }) => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenState = () => {
    setOpenModal(true);
  };

  return (
    <div>
      <Button onClick={handleOpenState}>Create a band</Button>

      <CreateBandModal
        openModal={openModal}
        handleOpenModal={() => setOpenModal(false)}
      >
        <BandForm studioId={id} handleCloseModal={() => setOpenModal(false)} />
      </CreateBandModal>
    </div>
  );
};
