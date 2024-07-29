'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FormItem, FormLabel } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@radix-ui/react-icons';
import { BandFormType } from '@/types/band';

type BandNameComboboxProps = {
  form: UseFormReturn<BandFormType>;
  bandNames: string[];
};

export const BandNameCombobox = ({
  bandNames,
  form,
}: BandNameComboboxProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const bandOptions = bandNames.map((bandName) => {
    return { value: bandName, label: bandName };
  });

  return (
    <FormItem className="flex flex-col mt-4">
      <FormLabel>Band Name</FormLabel>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger className="mt-3" asChild>
          <Input
            type="text"
            className={cn(
              'w-full justify-between border rounded px-3 py-2',
              !form.watch('name') && 'text-muted-foreground',
            )}
            placeholder="Select or create a band"
            value={form.watch('name')}
            onChange={(e) => form.setValue('name', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsPopoverOpen(true);
              } else if (e.key === ' ') {
                e.stopPropagation();
              }
            }}
            role="combobox"
          />
        </PopoverTrigger>
        <PopoverContent className="popover-content p-0">
          <Command>
            <CommandInput placeholder="Search for a band..." />
            <CommandList>
              <CommandEmpty>No band found.</CommandEmpty>
              <CommandGroup>
                {bandOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      form.setValue('name', option.value);
                      setIsPopoverOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        form.watch('name') === option.value
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
  );
};
