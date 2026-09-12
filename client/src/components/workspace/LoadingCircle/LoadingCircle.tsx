import './LoadingCircle.css';

export function LoadingCircle({ label = 'Đang tải…', inline = false }: { label?: string; inline?: boolean }) {
  return <span className={`loading-circle${inline ? ' loading-circle--inline' : ''}`} role="status">
    <span className="loading-circle-rings" aria-hidden="true"><span /></span>
    <span>{label}</span>
  </span>;
}
