'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PickedStudioZodType, ZodStudioSchema } from '@/types/studio';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { createStudio } from '@/actions/studioActions';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogFooter } from './ui/dialog';
import { useToast } from './ui/use-toast';

export const StudioForm = ({
  handleCloseModal,
}: {
  handleCloseModal: () => void;
}) => {
  const { toast } = useToast();
  const form = useForm<PickedStudioZodType>({
    resolver: zodResolver(ZodStudioSchema.pick({ name: true, location: true })),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const onSubmit = async (data: PickedStudioZodType) => {
    console.log('data', data);
    const response = await createStudio(data);

    if (!response.success && !Array.isArray(response.errors)) {
      console.error(response.errors);
      toast({
        title: 'Error',
        description: response.errors?.message,
        variant: 'destructive',
      });
      return;
    }

    handleCloseModal();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl w-full h-full flex flex-col justify-between"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Studio name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Studio name"
                    {...field}
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-8">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Location of the studio"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="mt-6">
            Create a studio
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
