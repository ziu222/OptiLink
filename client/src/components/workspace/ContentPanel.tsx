import type { ReactNode } from 'react';
import './contentPanel.css';

interface ContentPanelProps {
  title?: string;
  className?: string;
  children: ReactNode;
  /** Optional bar pinned below the body, inside the panel border (e.g. a pager). */
  footer?: ReactNode;
}

export function ContentPanel({ title, className = '', children, footer }: ContentPanelProps) {
  return (
    <section className={`content-panel ${className}`.trim()}>
      {title && (
        <div className="content-panel-header">
          <h2>{title}</h2>
        </div>
      )}
      <div className="content-panel-body">{children}</div>
      {footer && <div className="content-panel-footer">{footer}</div>}
    </section>
  );
}
