import { Children, isValidElement, useId, useLayoutEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import './FormSelect.css';

interface Props {
  value?: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  'aria-label': string;
  className?: string;
  disabled?: boolean;
}

/** A labelled select whose popup escapes the editor's scroll container. */
export function FormSelect({ value, onValueChange, children, 'aria-label': label, disabled, className = '' }: Props) {
  const options = Children.toArray(children).flatMap(child =>
    isValidElement<{ value: string; children: ReactNode; disabled?: boolean }>(child)
      ? [{ value: child.props.value, label: child.props.children, disabled: child.props.disabled }] : []);
  const selected = options.findIndex(option => option.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 280 });
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef({ text: '', time: 0 });
  const id = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const box = trigger.current!.getBoundingClientRect();
      const below = window.innerHeight - box.bottom - 16;
      const above = box.top - 16;
      const height = Math.min(280, Math.max(80, below >= 160 ? below : above));
      const width = Math.min(box.width, window.innerWidth - 24);
      setPosition({ left: Math.max(12, Math.min(box.left, window.innerWidth - width - 12)),
        top: below >= 160 ? box.bottom + 6 : Math.max(8, box.top - Math.min(height, options.length * 40 + 12) - 6),
        width, maxHeight: height });
    };
    const dismiss = (event: Event) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) setOpen(false);
    };
    place();
    window.addEventListener('resize', place);
    document.addEventListener('scroll', dismiss, true);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', dismiss, true);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [open, options.length]);

  useLayoutEffect(() => {
    const menu = popup.current;
    const item = menu?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!open || !menu || !item) return;
    if (item.offsetTop < menu.scrollTop) menu.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > menu.scrollTop + menu.clientHeight) {
      menu.scrollTop = item.offsetTop + item.offsetHeight - menu.clientHeight;
    }
  }, [active, open]);

  const show = () => {
    search.current = { text: '', time: 0 };
    setActive(selected >= 0 && !options[selected].disabled ? selected : Math.max(0, options.findIndex(option => !option.disabled)));
    setOpen(true);
  };
  const choose = (index: number) => {
    if (!options[index] || options[index].disabled) return;
    onValueChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab' || event.key === 'Escape') { setOpen(false); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { show(); return; }
      const direction = event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1;
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : active + direction;
      for (let i = 0; i < options.length; i++, next += direction) {
        next = (next + options.length) % options.length;
        if (!options[next].disabled) { setActive(next); break; }
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else show();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      search.current = { text: (now - search.current.time < 600 ? search.current.text : '') + event.key.toLocaleLowerCase(), time: now };
      const found = options.findIndex(option => !option.disabled && String(option.label).toLocaleLowerCase().startsWith(search.current.text));
      if (found >= 0) { setActive(found); setOpen(true); }
    }
  };

  return <div className={`form-select-root ${className}`}>
    <button ref={trigger} type="button" className="form-select-trigger" role="combobox" aria-label={label}
      aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="listbox" disabled={disabled || !options.length}
      aria-activedescendant={open ? `${id}-${active}` : undefined} onKeyDown={keyDown}
      onBlur={() => setOpen(false)} onClick={() => open ? setOpen(false) : show()}>
      <span>{options[selected]?.label ?? 'Chọn một lựa chọn'}</span><span aria-hidden="true" className="form-select-arrow" />
    </button>
    {open && createPortal(<div ref={popup} id={id} role="listbox" aria-label={label} className="form-select-popup" style={position}>
      {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-selected={option.value === value}
        aria-disabled={option.disabled || undefined} data-index={index} className={`form-select-option${active === index ? ' is-active' : ''}`}
        onPointerDown={event => event.preventDefault()} onPointerMove={() => !option.disabled && setActive(index)} onClick={() => choose(index)}>
        {option.label}
      </div>)}
    </div>, document.body)}
  </div>;
}
