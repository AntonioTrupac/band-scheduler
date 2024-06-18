'use client';

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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateTimePicker } from './ui/datetime';
import {
  CreateScheduleFormType,
  PickedZodCreateScheduleSchema,
} from '@/types/band';
import { Input } from '@/components/ui/input';
import { createBandSchedule } from '@/actions/bandActions';
import { Button } from './ui/button';

export const ScheduleForm = ({
  studioId,
  bandId,
}: {
  studioId: string;
  bandId: string;
}) => {
  const form = useForm<CreateScheduleFormType>({
    resolver: zodResolver(PickedZodCreateScheduleSchema),
    defaultValues: {
      rehearsal: {
        title: '',
        start: new Date(),
        end: new Date(),
      },
    },
  });

  const onSubmit = async (data: CreateScheduleFormType) => {
    console.log('STUFF IN FORM', data.rehearsal);

    const response = await createBandSchedule(data, studioId, bandId);
    // console.log('RESOPONSE IN CLIENT', response);
    if (!response.success) {
      console.error(response.errors);
      return;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-2xl w-full"
      >
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

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
