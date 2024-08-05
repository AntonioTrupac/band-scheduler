import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { BandFormType, ZodCreateScheduleSchema } from '@/types/band';
import { createOrUpdateBand } from '@/actions/bandActions';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BandNameCombobox } from '../inputs/BandNameCombobox';
import { DatePickerTimeInput } from '../inputs/DatePickerTimeInput';
import { SentryServerActionWrapper } from '@/api/sentryError';

export const ScheduleInfo = ({
  bandNames,
  studioId,
  date,
  onClose,
}: {
  bandNames: string[];
  studioId: string;
  date: Date;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(ZodCreateScheduleSchema),
    defaultValues: {
      name: '',
      location: '',
      rehearsal: {
        title: '',
        start: new Date(date),
        end: new Date(date),
      },
      week: 0,
    },
  });

  const onSubmit = async (data: BandFormType) => {
    const response = await SentryServerActionWrapper(
      async () =>
        await createOrUpdateBand(
          {
            ...data,
            rehearsals: [
              {
                start: data.rehearsal.start,
                end: data.rehearsal.end,
                title: data.rehearsal.title,
              },
            ],
            studioId,
          },
          data.week,
        ),
      'createOrUpdateBand',
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
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <BandNameCombobox bandNames={bandNames} form={form} />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-8 mt-4">
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

          <DatePickerTimeInput
            form={form}
            name="rehearsal.start"
            label="Rehearsal Start"
          />

          <DatePickerTimeInput
            form={form}
            name="rehearsal.end"
            label="Rehearsal End"
          />

          <FormField
            control={form.control}
            name="week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Do not repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Do not repeat</SelectItem>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
