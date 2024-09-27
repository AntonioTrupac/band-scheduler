'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InvitationZodType, ZodInvitationSchema } from '@/types/invitation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { DateTimePicker } from './ui/datetime';
import { Button } from './ui/button';

export const InvitationLinkForm = ({
  studioId,
  handleCloseModal,
}: {
  studioId: string;
  handleCloseModal: () => void;
}) => {
  const form = useForm<InvitationZodType>({
    resolver: zodResolver(ZodInvitationSchema),
    defaultValues: {
      token: crypto.randomUUID(),
      invitationName: '',
      studioId: '',
      expiresAt: new Date(),
    },
  });

  const onSubmit = (data: InvitationZodType) => {
    console.log(data);
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
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Rehearsal End</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
