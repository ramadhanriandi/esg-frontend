import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type EcoComboboxProps<T> = {
  items: T[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;

  getLabel: (item: T) => string;

  getValue: (item: T) => string;

  getSearchText?: (item: T) => string;
};

export function EcoCombobox<T>({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  disabled,
  getLabel,
  getValue,
  getSearchText,
}: EcoComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => getValue(item) === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {selectedItem ? getLabel(selectedItem) : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        avoidCollisions={false}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandList className="max-h-30 overflow-y-auto">
            <CommandGroup>
              {items.map((item) => {
                const label = getLabel(item);
                const val = getValue(item);
                const search = getSearchText?.(item) ?? label;

                return (
                  <CommandItem
                    key={val}
                    value={search}
                    onSelect={() => {
                      onChange(val);
                      setOpen(false);
                    }}
                  >
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
