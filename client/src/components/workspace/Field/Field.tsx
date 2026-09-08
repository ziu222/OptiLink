import type { ReactNode } from 'react';
import './Field.css';

interface FieldProps {
  label: ReactNode;
  /** Description shown in the "?" hint tooltip beside the label. */
  hint?: string;
  /** Validation / helper message shown under the control. */
  error?: ReactNode;
  /** Span every column of a parent grid. */
  full?: boolean;
  className?: string;
  /** The control: an `.field-input`, an InputSelect, or a custom frame. */
  children: ReactNode;
}

// Label + control + error, stacked. Pair a bare text control with the
// `.field-input` class; selects and custom frames just drop in as children.
// `hint` adds a "?" icon that reveals on panel hover and shows its text on hover.
export function Field({ label, hint, error, full, className, children }: FieldProps) {
  return (
    <div className={['field', full && 'field--full', className].filter(Boolean).join(' ')}>
      <span className="field-label">
        {label}
        {hint ? (
          <span className="field-hint" role="img" aria-label={hint} title={hint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.6 9.4a2.4 2.4 0 0 1 4.66.8c0 1.6-2.26 2-2.26 3.6"
              />
              <path strokeLinecap="round" d="M12 17.25h.01" />
            </svg>
          </span>
        ) : null}
      </span>
      {children}
      {error ? <em className="field-error">{error}</em> : null}
    </div>
  );
}
