import type { ReactNode } from 'react';
import './contentPanel.css';

interface ContentPanelProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function ContentPanel({ title, className = '', children }: ContentPanelProps) {
  return (
    <section className={`content-panel ${className}`.trim()}>
      {title && (
        <div className="content-panel-header">
          <h2>{title}</h2>
        </div>
      )}
      <div className="content-panel-body">{children}</div>
    </section>
  );
}
