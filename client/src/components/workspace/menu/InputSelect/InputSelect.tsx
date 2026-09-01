import { useCallback, useRef, useState } from 'react';
import { useDismiss } from '../../../../lib/useDismiss';
import '../MenuPopup/MenuPopup.css';
import './InputSelect.css';

interface InputSelectOption<T extends string> {
  value: T;
  label: string;
}

interface InputSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: InputSelectOption<T>[];
  ariaLabel: string;
  id?: string;
}

// Select-style control that opens the shared Menu popup as a listbox. The closed
// trigger is styled to match the .profile-input field frame.
export function InputSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  id,
}: InputSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismiss(
    rootRef,
    open,
    useCallback(() => setOpen(false), []),
  );

  const selected = options.find((option) => option.value === value);

  return (
    <div className="input-select-root" ref={rootRef}>
      <button
        type="button"
        className="input-select"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="input-select-value">{selected?.label ?? ''}</span>
        <svg
          className="input-select-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="menu-popup input-select-popup" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="menu-item"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
