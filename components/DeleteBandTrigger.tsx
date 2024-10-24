'use client';

import { deleteBand } from '@/actions/bandActions';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { useToast } from './ui/use-toast';

export const DeleteBandTrigger = ({
  bandId,
  studioId,
}: {
  bandId: string;
  studioId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteBand(bandId, studioId);

        if (result.success) {
          toast({
            title: 'Band deleted',
            description: 'The band has been successfully deleted',
          });
        } else {
          toast({
            title: 'Failed to delete band',
            description: result.errors?.message || 'An error occurred',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Failed to delete band',
          description: 'An error occurred',
          variant: 'destructive',
        });
        console.error(error);
      }
    });
  };
  // TODO: Should maybe add Alert dialog to confirm deletion
  return (
    <Button onClick={handleDelete}>
      {isPending ? <>Deleting...</> : 'Delete band'}
    </Button>
  );
};
