import { useEffect } from 'react';
import IconButton from './IconButton.jsx';

function Sheet({ title, subtitle, onClose, children, footer, headRight }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-grip" />
        <div className="sheet-head">
          <div className="grow">
            {subtitle && <div className="label" style={{ marginBottom: 2 }}>{subtitle}</div>}
            <div className="display-lg">{title}</div>
          </div>
          {headRight}
          <IconButton name="x" label="Close" onClick={onClose} style={{ marginRight: -6 }} />
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export default Sheet;
