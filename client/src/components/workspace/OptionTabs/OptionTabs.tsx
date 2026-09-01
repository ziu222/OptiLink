import './OptionTabs.css';

interface OptionTabsItem<T extends string> {
  id: T;
  label: string;
}

interface OptionTabsProps<T extends string> {
  items: OptionTabsItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}

// Horizontal strip of flush tabs inside one bordered box, divided by full-height
// vertical separators. Single active tab, rendered filled/inverted.
export function OptionTabs<T extends string>({ items, value, onChange, ariaLabel }: OptionTabsProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="option-tabs">
      {items.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={id === value}
          className={`option-tab${id === value ? ' is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
