'use client';

import { BandFormType } from '@/types/band';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateTimePicker } from '@/components/ui/datetime';

type DatePickerFieldName = 'rehearsal.start' | 'rehearsal.end';

type DatePickerTimeInputProps = {
  form: UseFormReturn<BandFormType>;
  name: DatePickerFieldName;
  label: string;
};

export const DatePickerTimeInput = ({
  form,
  label,
  name,
}: DatePickerTimeInputProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <DateTimePicker date={field.value} setDate={field.onChange} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
