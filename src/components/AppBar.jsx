import IconButton from './IconButton.jsx';

function AppBar({ onBack, title, subtitle, right }) {
  return (
    <header className="appbar">
      {onBack && <IconButton name="back" label="Back" onClick={onBack} style={{ marginLeft: -8 }} />}
      <div className="grow">
        {subtitle && <div className="label" style={{ marginBottom: 1 }}>{subtitle}</div>}
        {title && <div className="h-md" style={{ fontFamily: 'var(--font-display)' }}>{title}</div>}
      </div>
      {right}
    </header>
  );
}

export default AppBar;
