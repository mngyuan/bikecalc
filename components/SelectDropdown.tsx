import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface SelectDropdownProps<T extends string = string> {
  value: T | 'custom';
  onValueChange: (value: T | 'custom') => void;
  options: Record<T, unknown>;
  placeholder: string;
  emptyMessage?: string;
  includeCustomOption?: boolean;
  customLabel?: string;
  className?: string;
}

export function SelectDropdown<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder,
  emptyMessage = 'No results found.',
  includeCustomOption = true,
  customLabel = 'Custom',
  className = '',
}: SelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between h-auto cursor-pointer font-medium text-muted-foreground hover:bg-accent ${className}`}
        >
          {value !== 'custom' ? (
            <div className="truncate">{value}</div>
          ) : (
            <div className="text-muted-foreground">{customLabel}</div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {includeCustomOption && (
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onValueChange('custom');
                }}
                value="custom"
              >
                {customLabel}
              </CommandItem>
            )}
            {Object.keys(options).map((key) => (
              <CommandItem
                key={key}
                onSelect={() => {
                  setOpen(false);
                  onValueChange(key as T);
                }}
                value={key}
              >
                {key}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
