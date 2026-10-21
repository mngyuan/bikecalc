import * as Popover from '@radix-ui/react-popover';
import {Command} from 'cmdk';
import {type ReactNode, useState} from 'react';

// Number input that lets the field be empty or mid-edit without snapping
// back; onChange only fires with finite numbers.
export function NumberField({
  value,
  onChange,
  id,
  min,
  max,
  step,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}) {
  const [text, setText] = useState(fmt(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    if (parseFloat(text) !== value) setText(fmt(value));
  }
  return (
    <input
      type="number"
      inputMode="decimal"
      id={id}
      className={className}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) onChange(v);
      }}
      onBlur={() => {
        if (!Number.isFinite(parseFloat(text))) setText(fmt(value));
      }}
    />
  );
}

const fmt = (n: number) => (Number.isFinite(n) ? String(n) : '');

// <details> section whose open state survives re-renders
export function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details className="sec" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{title}</summary>
      <div className="rows">{children}</div>
    </details>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

// Searchable select for long catalogs (tires, cassettes, bikes)
export function Combobox<T extends string>({
  value,
  options,
  onChange,
  label,
  placeholder,
  emptyMessage = 'No results found.',
  customLabel = 'Custom',
}: {
  value: T | 'custom';
  options: Option<T>[];
  onChange: (v: T | 'custom') => void;
  label: string;
  placeholder: string;
  emptyMessage?: string;
  customLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const pick = (v: T | 'custom') => {
    setOpen(false);
    onChange(v);
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="combo" role="combobox" aria-expanded={open} aria-label={label}>
          <span className={current ? '' : 'placeholder'}>{current?.label ?? customLabel}</span>
          <Chevron />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="combo-pop" align="start" sideOffset={6} collisionPadding={16}>
          <Command loop label={label}>
            <Command.Input placeholder={placeholder} />
            <Command.List>
              <Command.Empty>{emptyMessage}</Command.Empty>
              <Command.Item value={`__custom ${customLabel}`} data-current={value === 'custom'} onSelect={() => pick('custom')}>
                {customLabel}
              </Command.Item>
              {options.map((o) => (
                <Command.Item key={o.value} value={o.label} data-current={o.value === value} onSelect={() => pick(o.value)}>
                  {o.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
