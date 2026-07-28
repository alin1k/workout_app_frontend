import { useState } from 'react';

function Stepper({ value, onChange, step = 1, min = 0, max = 9999, allowEmpty, placeholder, decimals }) {
  // What the user is currently typing. Kept separate from `value` so
  // in-between states survive a render: "80." would otherwise parse back
  // to 80 and swallow the dot before the decimals can be typed.
  const [draft, setDraft] = useState(null);

  const parse = (v) => {
    if (v === '' || v == null) return allowEmpty ? null : min;
    const n = decimals ? parseFloat(v) : parseInt(v, 10);
    return isNaN(n) ? (allowEmpty ? null : min) : n;
  };

  const clean = (v) => {
    // Many mobile keyboards only offer "," as the decimal separator.
    let raw = v.replace(/,/g, '.').replace(decimals ? /[^0-9.]/g : /[^0-9]/g, '');
    if (decimals) {
      const dot = raw.indexOf('.');
      if (dot !== -1) raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, '');
    }
    return raw;
  };

  const bump = (d) => {
    setDraft(null);
    const cur = value == null ? (d > 0 ? min - step : min) : value;
    let next = Math.round((cur + d * step) * 100) / 100;
    next = Math.max(min, Math.min(max, next));
    onChange(next);
  };

  // Drop the draft once it no longer describes the value we're handed —
  // that means the value changed from the outside (prefill, bump, reset).
  const stale = draft != null && parse(draft) !== (value == null ? null : value);
  const shown = draft != null && !stale ? draft : value == null ? '' : String(value);

  return (
    <div className="stepper">
      <button type="button" onClick={() => bump(-1)} aria-label="decrease">–</button>
      <input
        type="text"
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={shown}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = clean(e.target.value);
          setDraft(raw);
          onChange(raw === '' ? null : parse(raw));
        }}
        onBlur={() => setDraft(null)}
      />
      <button type="button" onClick={() => bump(1)} aria-label="increase">+</button>
    </div>
  );
}

export default Stepper;
