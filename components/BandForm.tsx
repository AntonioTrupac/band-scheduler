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
import { createBand, FetchBandsResponse } from '@/actions/bandActions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const ZodFormSchema = z.object({
  _id: z.string().optional(),
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1)
    .max(255),
  rehearsal: z
    .object({
      start: z
        .date({
          invalid_type_error: 'Start must be a date',
          message: 'Start is required',
        })
        .refine((date) => date >= new Date(), {
          message: 'Start date must be in the future',
        }),
      end: z.date({
        invalid_type_error: 'End must be a date',
        message: 'End is required',
      }),
      title: z
        .string({
          invalid_type_error: 'Title must be a string',
          message: 'Title is required',
        })
        .min(1),
    })
    .superRefine(({ start, end }, ctx) => {
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: ['end'],
        });
      }
    }),
});

type BandFormType = z.infer<typeof ZodFormSchema>;

export const BandForm = ({ bands }: { bands: FetchBandsResponse['data'] }) => {
  const { toast } = useToast();

  const [dateTime, setDateTime] = useState<Date>(new Date());
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

  const onSubmit = async (data: BandFormType) => {
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

    const existingBand = bands?.find((band) => band.name === band.name);

    if (existingBand) {
      const conflict = existingBand.rehearsals.some((r) => {
        return (
          (data.rehearsal.start >= r.start && data.rehearsal.start <= r.end) ||
          (data.rehearsal.end >= r.start && data.rehearsal.end <= r.end)
        );
      });

      if (conflict) {
        toast({
          title: 'Error selecting a slot',
          description: 'The selected slot is already taken',
          variant: 'destructive',
        });
        return;
      }

      const updatedBand = await createBand({
        ...existingBand,
        rehearsals: [
          ...existingBand.rehearsals,
          {
            start: data.rehearsal.start,
            end: data.rehearsal.end,
            title: data.rehearsal.title,
          },
        ],
      });

      if (updatedBand.success) {
        router.push('/rehearsal');
      } else {
        toast({
          title: 'Error updating band',
          description: 'Failed to update the band',
          variant: 'destructive',
        });
      }
    } else {
      const createResponse = await createBand({
        name: data.name,
        rehearsals: [
          {
            start: data.rehearsal.start,
            end: data.rehearsal.end,
            title: data.rehearsal.title,
          },
        ],
      });

      if (createResponse.success) {
        router.push('/rehearsal');
      } else {
        toast({
          title: 'Error creating band',
          description:
            createResponse.errors?.[0]?.message || 'Failed to create band',
          variant: 'destructive',
        });
      }
    }

    // form.reset();
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
          <Button suppressHydrationWarning type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
};
