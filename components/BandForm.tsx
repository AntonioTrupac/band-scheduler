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

const ZodFormSchema = z.object({
  _id: z.string().optional(),
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1)
    .max(255),
  rehearsal: z.object({
    start: z.date({
      invalid_type_error: 'Start must be a date',
      message: 'Start is required',
    }),
    end: z.date({
      invalid_type_error: 'End must be a date',
      message: 'End is required',
    }),
    title: z.string({
      invalid_type_error: 'Title must be a string',
      message: 'Title is required',
    }),
  }),
});

type BandFormType = z.infer<typeof ZodFormSchema>;

export const BandForm = () => {
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

  const onSubmit = async (data: BandFormType) => {
    console.log(data);
  };
  return (
    <>
      <h2>Register your band</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your band name. This will be used to identify your band.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <h1>Rehearsals</h1>
          <FormField
            control={form.control}
            name="rehearsal.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Rehearsal title" {...field} />
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
                <FormLabel>Reherseal start</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormDescription>
                  Select the start date and time of your rehearsal.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rehearsal.end"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reherseal end</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormDescription>
                  Select the end date and time of your rehearsal.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
};
