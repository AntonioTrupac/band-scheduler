'use client';

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
import { StudioZodType } from '@/types/studio';
import { Input } from './ui/input';
import { Button } from './ui/button';

export const StudioForm = () => {
  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      createdBy: '',
      bands: [],
    },
  });

  const onSubmit = (data: Pick<StudioZodType, 'name' | 'location'>) => {
    console.log('data', data);
  };

  return (
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
              <FormLabel>Studio name</FormLabel>
              <FormControl>
                <Input placeholder="Studio name" {...field} />
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
                  <Input placeholder="Location of the studio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
