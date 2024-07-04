'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BandZodType, ZodCreateBandSchema } from '@/types/band';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateTimePicker } from './ui/datetime';
// import { deleteSchedule } from '@/actions/bandActions';
import { useParams } from 'next/navigation';
import { deleteSchedule, updateTimeslot } from '@/actions/bandActions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from './ui/use-toast';

const findBandByRehersealStart = (
  bands: BandZodType[],
  rehStartDate: Date | null,
) => {
  if (!rehStartDate) return null;

  const band = bands
    .map((band) => {
      return {
        ...band,
        rehearsals: band.rehearsals.filter((rehearsal) => {
          return rehearsal.start.getTime() === rehStartDate.getTime();
        }),
      };
    })
    .find((band) => band.rehearsals.length > 0);

  // TODO: This needs to be handled higher up in the component tree
  if (!band) return null;

  return band;
};

export const UpdateOrDeleteTimeslotModal = ({
  openUpdateModal,
  handleOpenUpdateModal,
  bands,
  rehearsalStartDate,
}: {
  openUpdateModal: boolean;
  handleOpenUpdateModal: () => void;
  bands: BandZodType[];
  rehearsalStartDate: Date | null;
}) => {
  const band = findBandByRehersealStart(bands, rehearsalStartDate);

  if (!band) {
    // TODO: Handle this case
    return <div></div>;
  }

  return (
    <Dialog open={openUpdateModal} onOpenChange={handleOpenUpdateModal}>
      <DialogContent aria-describedby="blah">
        <DialogHeader>
          <DialogTitle>Current timeslot info</DialogTitle>
        </DialogHeader>

        <TimeslotInfo band={band} />
      </DialogContent>
    </Dialog>
  );
};

const TimeslotInfo = ({ band }: { band: BandZodType }) => {
  const params = useParams<{ _id: string }>();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(ZodCreateBandSchema),
    defaultValues: {
      name: band.name,
      location: band.location,
      rehearsal: {
        title: band.rehearsals[0].title,
        start: band.rehearsals[0].start,
        end: band.rehearsals[0].end,
      },
    },
  });

  return (
    <div>
      <Form {...form}>
        <form>
          <div className="my-2 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Band name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" readOnly {...field} />
                  </FormControl>
                  <FormDescription>This field is readonly</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" readOnly {...field} />
                  </FormControl>
                  <FormDescription>This field is readonly</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rehearsal.start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rehearsal Start</FormLabel>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rehearsal.end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rehearsal End</FormLabel>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full">
              <Button
                type="submit"
                onClick={form.handleSubmit(async () => {
                  await deleteSchedule(
                    band._id,
                    band.rehearsals[0]._id,
                    params._id,
                  );
                })}
                variant="destructive"
              >
                Delete timeslot
              </Button>
              <Button
                onClick={form.handleSubmit(async (data) => {
                  // TODO: create a function for this and call it here
                  const response = await updateTimeslot(
                    band._id,
                    band.rehearsals[0]._id,
                    params._id,
                    data.rehearsal,
                  );

                  if (!response.success && !Array.isArray(response.errors)) {
                    console.error(response.errors);
                    toast({
                      title: 'Error',
                      description: response.errors?.message,
                      variant: 'destructive',
                    });
                    return;
                  }
                })}
                type="submit"
              >
                Update timeslot
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};
