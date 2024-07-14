'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
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
import { DateTimePicker } from './ui/datetime';
import { BandFormType, ZodCreateBandSchema } from '@/types/band';
import { createOrUpdateBand } from '@/actions/bandActions';
import { useToast } from './ui/use-toast';

export const ScheduleTimeslotModal = ({
  children,
  openTimeslot,
  handleOpenState,
}: {
  children: React.ReactNode;
  openTimeslot: boolean;
  handleOpenState: () => void;
}) => {
  return (
    <Dialog open={openTimeslot} onOpenChange={handleOpenState}>
      <DialogContent className="min-h-[400px]">
        <DialogHeader>
          <DialogTitle>Schedule a timeslot</DialogTitle>
          <DialogDescription>
            Schedule a timeslot for this band
          </DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const ScheduleInfo = ({
  bandNames,
  studioId,
  date,
  handleOpenState,
}: {
  bandNames: string[];
  studioId: string;
  date: Date;
  handleOpenState: () => void;
}) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(ZodCreateBandSchema),
    defaultValues: {
      name: '',
      location: '',
      rehearsal: {
        title: '',
        start: new Date(date),
        end: new Date(date),
      },
    },
  });
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: BandFormType) => {
    const response = await createOrUpdateBand({
      ...data,
      rehearsals: [
        {
          start: data.rehearsal.start,
          end: data.rehearsal.end,
          title: data.rehearsal.title,
        },
      ],
      studioId,
    });

    if (!response.success && !Array.isArray(response.errors)) {
      console.error(response.errors);
      toast({
        title: 'Error',
        description: response.errors?.message,
        variant: 'destructive',
      });
      return;
    }
    handleOpenState();
  };

  const bandOptions = bandNames.map((bandName) => {
    return { value: bandName, label: bandName };
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel>Band Name</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="mt-3" asChild>
                  <Input
                    type="text"
                    className={cn(
                      'w-full justify-between border rounded px-3 py-2',
                      !field.value && 'text-muted-foreground',
                    )}
                    placeholder="Select or create a band"
                    value={field.value}
                    onChange={(e) => form.setValue('name', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setOpen(true);
                      } else if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    role="combobox"
                  />
                </PopoverTrigger>
                <PopoverContent className="popover-content p-0">
                  <Command>
                    <CommandInput placeholder="Search band..." />
                    <CommandList>
                      <CommandEmpty>No band found.</CommandEmpty>
                      <CommandGroup>
                        {bandOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              form.setValue('name', option.value);
                              setOpen(false);
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === option.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

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
          <Button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

ScheduleTimeslotModal.ScheduleInfo = ScheduleInfo;
