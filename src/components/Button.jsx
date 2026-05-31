function Button({ variant = 'primary', size, className = '', children, ...rest }) {
  const cls = ['btn', 'btn-' + variant, size === 'lg' ? 'btn-lg' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button {...rest} className={cls}>
      {children}
    </button>
  );
}

export default Button;
