'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InvitationZodType, ZodInvitationFormSchema } from '@/types/invitation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { DateTimePicker } from './ui/datetime';
import { Button } from './ui/button';
import { type Response } from '@/types/band';

export const InvitationLinkForm = ({
  studioId,
  handleCloseModal,
}: {
  studioId: string;
  handleCloseModal: () => void;
}) => {
  const form = useForm<InvitationZodType>({
    resolver: zodResolver(ZodInvitationFormSchema),
    defaultValues: {
      invitationName: '',
      expiresAt: new Date(),
      email: '',
    },
  });

  const onSubmit = async (data: InvitationZodType) => {
    try {
      const response = await fetch('/api/invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationName: data.invitationName,
          expiresAt: data.expiresAt,
          studioId,
          email: data.email,
        }),
      });

      const result: Response<InvitationZodType> = await response.json();

      if (response.ok) {
        handleCloseModal();
      } else {
        console.error('Error:', result.errors);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="invitationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="invitationName">Invitation Name</FormLabel>
                <FormControl>
                  <Input {...field} id="invitationName" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input {...field} id="email" type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expires at</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-red-500">{form.formState.errors.root.message}</p>
          )}

          <div className="flex justify-end">
            <Button suppressHydrationWarning type="submit">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
