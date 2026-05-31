import Icon from './Icon.jsx';

function Field({ label, hint, error, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {error ? (
        <div className="err"><Icon name="alert" size={14} /> {error}</div>
      ) : hint ? (
        <div className="hint">{hint}</div>
      ) : null}
    </div>
  );
}

export default Field;
