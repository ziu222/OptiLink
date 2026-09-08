import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

// The workspace's primary action button: a filled dark CTA. Passes through every
// native <button> prop; `type` defaults to "button" (pass type="submit" in forms).
export function Button({
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} type={type} className={['button', className].filter(Boolean).join(' ')} />
  );
}
