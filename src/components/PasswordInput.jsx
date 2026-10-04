import { useState } from 'react';
import Icon from './Icon.jsx';

// Password field with a show/hide toggle.
function PasswordInput({ value, onChange, invalid, onEnter, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        placeholder="••••••••"
        {...rest}
        type={show ? 'text' : 'password'}
        className={'input' + (invalid ? ' invalid' : '')}
        style={{ paddingRight: 48 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          borderRadius: 999,
        }}
      >
        <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
}

export default PasswordInput;
