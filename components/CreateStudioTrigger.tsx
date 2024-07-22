'use client';

import { Button } from '@/components//ui/button';
import { CreateStudioModal } from './CreateStudioModal';
import { useState } from 'react';
import { StudioForm } from './StudioForm';

export const CreateStudioTrigger = () => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenState = () => {
    console.log('openModal', openModal);
    setOpenModal(true);
  };

  return (
    <div className="mr-4">
      <Button onClick={handleOpenState}>Create studio</Button>

      <CreateStudioModal
        openModal={openModal}
        handleOpenModal={() => setOpenModal(false)}
      >
        <StudioForm handleCloseModal={() => setOpenModal(false)} />
      </CreateStudioModal>
    </div>
  );
};
