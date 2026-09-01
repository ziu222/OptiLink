import { useEffect, useRef, useState } from 'react';
import './pagination.css';

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages (>= 1). */
  pageCount: number;
  onChange: (page: number) => void;
}

// Up to 3 pages: show every number. More than that: collapse to first … last,
// with the … acting as a "jump to page" affordance.
function pageItems(count: number): (number | 'gap')[] {
  if (count <= 3) return Array.from({ length: count }, (_, i) => i + 1);
  return [1, 'gap', count];
}

// Bottom bar for a ContentPanel list: Prev / page numbers / Next, styled to
// match the Toolbar (3rem frame, borderless text buttons, hairline separators).
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const items = pageItems(pageCount);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const openEditor = () => {
    setDraft('');
    setEditing(true);
  };

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isFinite(parsed)) {
      const target = Math.min(pageCount, Math.max(1, parsed));
      if (target !== page) onChange(target);
    }
    setEditing(false);
  };

  return (
    <div className="pagination">
      <div className="pagination-sep" aria-hidden="true" />

      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>

      <div className="pagination-sep" aria-hidden="true" />

      <div className="pagination-pages">
        {items.map((item) => {
          if (item === 'gap') {
            return editing ? (
              <input
                key="gap"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                className="pagination-input"
                aria-label={`Go to page (1–${pageCount})`}
                placeholder="…"
                value={draft}
                onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') commit();
                  else if (event.key === 'Escape') setEditing(false);
                }}
                onBlur={commit}
              />
            ) : (
              <button
                key="gap"
                type="button"
                className="pagination-btn pagination-gap"
                aria-label="Jump to a specific page"
                onClick={openEditor}
              >
                …
              </button>
            );
          }
          return (
            <button
              key={item}
              type="button"
              className={`pagination-btn${item === page ? ' is-current' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="pagination-sep" aria-hidden="true" />

      <button
        type="button"
        className="pagination-btn"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
