import { useEffect } from 'react';
import Icon from './Icon.jsx';
import Button from './Button.jsx';

function Confirm({ icon = 'alert', tone = 'danger', title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="scrim"
      style={{ alignItems: 'center', padding: 24 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="card card-pad pop-in" style={{ width: '100%', maxWidth: 360, background: 'var(--bg)' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: tone === 'danger' ? 'var(--danger-soft)' : 'var(--accent-soft)',
            color: tone === 'danger' ? 'var(--danger)' : 'var(--primary-deep)',
            marginBottom: 12,
          }}
        >
          <Icon name={icon} size={24} />
        </div>
        <div className="display-lg" style={{ marginBottom: 6 }}>{title}</div>
        <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.5 }}>{body}</div>
        <div className="row gap10" style={{ marginTop: 18 }}>
          <Button variant="soft" className="btn-block" onClick={onCancel}>Cancel</Button>
          {onConfirm && (
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              className="btn-block"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Confirm;
