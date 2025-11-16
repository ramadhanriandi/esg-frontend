import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MultiSelectOption = {
  label: string;
  value: string;
  group: string;
};

type EcoMultiSelectWithTabsProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function EcoMultiSelectWithTabs({
  options,
  value,
  onChange,
  placeholder = "Select options",
  disabled,
}: EcoMultiSelectWithTabsProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const groups = React.useMemo(
    () => Array.from(new Set(options.map((o) => o.group))),
    [options]
  );
  const [activeGroup, setActiveGroup] = React.useState("all");

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const clearValue = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const clearAll = () => {
    onChange([]);
  };

  const filteredOptions = options.filter((o) => {
    const matchesGroup = activeGroup === "all" ? true : o.group === activeGroup;
    const matchesSearch = search
      ? `${o.label} ${o.value}`.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between gap-2"
          >
            <div className="flex min-h-[1.5rem] flex-1 flex-wrap items-center gap-1 overflow-hidden text-left">
              {selectedOptions.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  {placeholder}
                </span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="outline"
                    className="flex items-center gap-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="max-w-[120px] truncate">
                      {option.label}
                    </span>
                    <Button
                      variant="ghost"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearValue(option.value);
                      }}
                      className="ml-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          avoidCollisions={false}
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search..." onValueChange={setSearch} />
            <div className="border-b px-3 py-2">
              <Tabs
                value={activeGroup}
                onValueChange={setActiveGroup}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {groups.map((group) => (
                    <TabsTrigger key={group} value={group}>
                      {group}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandList className="max-h-64 overflow-y-auto">
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => toggleValue(option.value)}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="flex-1">{option.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {option.group}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {value.length} selected
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
