'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  createBand,
  // createOrUpdateBand,
  // FetchBandsResponse,
  // updateBand,
} from '@/actions/bandActions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { CreateBandFormType, PickedZodCreateBandSchema } from '@/types/band';

export const BandForm = ({ studioId }: { studioId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<CreateBandFormType>({
    resolver: zodResolver(PickedZodCreateBandSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const onSubmit = async (data: CreateBandFormType) => {
    console.log(data);
    const bands = await createBand({
      ...data,
      rehearsals: [],
      studioId,
    });

    if (!bands.success && Array.isArray(bands.errors)) {
      const bandNameError = bands.errors?.find(
        (error) => error.path.includes('name') && error.code === 'custom',
      );

      if (bandNameError) {
        form.setError('name', {
          type: 'manual',
          message: bandNameError.message,
        });
      }
    } else {
      router.replace(`/studio/${studioId}/bands`);
    }
  };

  return (
    <>
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

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
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
