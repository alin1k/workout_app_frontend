function Stepper({ value, onChange, step = 1, min = 0, max = 9999, allowEmpty, placeholder, decimals }) {
  const parse = (v) => {
    if (v === '' || v == null) return allowEmpty ? null : min;
    const n = decimals ? parseFloat(v) : parseInt(v, 10);
    return isNaN(n) ? (allowEmpty ? null : min) : n;
  };

  const bump = (d) => {
    const cur = value == null ? (d > 0 ? min - step : min) : value;
    let next = Math.round((cur + d * step) * 100) / 100;
    next = Math.max(min, Math.min(max, next));
    onChange(next);
  };

  return (
    <div className="stepper">
      <button type="button" onClick={() => bump(-1)} aria-label="decrease">–</button>
      <input
        type="text"
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={value == null ? '' : value}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          onChange(raw === '' ? (allowEmpty ? null : null) : parse(raw));
        }}
      />
      <button type="button" onClick={() => bump(1)} aria-label="increase">+</button>
    </div>
  );
}

export default Stepper;
