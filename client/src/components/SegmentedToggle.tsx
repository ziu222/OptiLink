import './darkmode.css';

interface Option<T> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T> {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

// Two-option segmented toggle with a sliding highlight between slots.
export function SegmentedToggle<T>({ options, value, onChange, ariaLabel }: SegmentedToggleProps<T>) {
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="segmented-toggle">
      <span
        aria-hidden="true"
        className="segmented-toggle__highlight"
        style={{ transform: activeIndex === 1 ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`segmented-toggle__option${opt.value === value ? ' is-active' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
