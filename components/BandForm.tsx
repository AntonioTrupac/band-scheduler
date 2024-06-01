'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { DateTimePicker } from './ui/datetime';
import {
  createBand,
  createOrUpdateBand,
  FetchBandsResponse,
  updateBand,
} from '@/actions/bandActions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { BandFormType, BandZodType, ZodFormSchema } from '@/types/band';

export const BandForm = ({ bands }: { bands: FetchBandsResponse['data'] }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<BandFormType>({
    resolver: zodResolver(ZodFormSchema),
    defaultValues: {
      name: '',
      rehearsal: {
        start: new Date(),
        end: new Date(),
        title: '',
      },
    },
  });

  /* 
    TODO: add validation for rehearsal start and end
    - start must be before end
    - start must be in the future or current date with time

    TODO: add validation for band name or id
    - name must be unique
    - name must be a string

    TODO: check if band name already exists (via name or _id)
    - if it exists add another rehearsal to the band/rehearsal array

    TODO: If the timeslot is already taken, show an error message in the form screen
  */

  // const hasExistingBand =

  // const handleExistingBand = (existingBand: BandZodType)

  const onSubmit = async (data: BandFormType) => {
    const upsertResponse = await createOrUpdateBand({
      ...data,
      rehearsals: [
        {
          start: data.rehearsal.start,
          end: data.rehearsal.end,
          title: data.rehearsal.title,
        },
      ],
    });

    // const existingBand = bands?.find((band) => band.name === data.name);
    // if (existingBand) {
    //   const conflict = hasRehearsalConflict(existingBand, data.rehearsal);
    //   if (conflict) {
    //     console.log('conflict');
    //     toast({
    //       title: 'Error selecting a slot',
    //       description: 'The selected slot is already taken',
    //       variant: 'destructive',
    //     });
    //     return;
    //   }
    //   const updatedBand = await updateBand({
    //     ...existingBand,
    //     rehearsals: [
    //       ...existingBand.rehearsals,
    //       {
    //         start: data.rehearsal.start,
    //         end: data.rehearsal.end,
    //         title: data.rehearsal.title,
    //       },
    //     ],
    //   });
    //   if (updatedBand.success) {
    //     router.push('/rehearsal');
    //   } else {
    //     toast({
    //       title: 'Error updating band',
    //       description: 'Failed to update the band',
    //       variant: 'destructive',
    //     });
    //   }
    // } else {
    //   const createResponse = await createBand({
    //     name: data.name,
    //     rehearsals: [
    //       {
    //         start: data.rehearsal.start,
    //         end: data.rehearsal.end,
    //         title: data.rehearsal.title,
    //       },
    //     ],
    //   });
    //   if (createResponse.success) {
    //     router.push('/rehearsal');
    //   } else {
    //     toast({
    //       title: 'Error creating band',
    //       description:
    //         createResponse.errors?.[0]?.message || 'Failed to create band',
    //       variant: 'destructive',
    //     });
    //   }
    // }
  };

  return (
    <>
      <h2>Register your band</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-2xl w-full"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Band Name</FormLabel>
                <FormControl>
                  <Input placeholder="Band Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <h2 className="mb-4">Rehearsals</h2>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="rehearsal.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Rehearsal Title" {...field} />
                    </FormControl>
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
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
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
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
};
