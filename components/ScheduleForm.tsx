'use client';

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
import { ScheduleFormType, PickedZodCreateScheduleSchema } from '@/types/band';
import { Input } from '@/components/ui/input';
import { createBandSchedule } from '@/actions/bandActions';
import { Button } from './ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SentryServerActionWrapper } from '@/api/sentryError';

export const ScheduleForm = ({
  studioId,
  bandId,
}: {
  studioId: string;
  bandId: string;
}) => {
  const { toast } = useToast();
  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(PickedZodCreateScheduleSchema),
    defaultValues: {
      rehearsal: {
        title: '',
        start: new Date(),
        end: new Date(),
      },
    },
  });

  const onSubmit = async (data: ScheduleFormType) => {
    const response = await SentryServerActionWrapper(
      async () => await createBandSchedule(data, studioId, bandId),
      'createBandSchedule',
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
