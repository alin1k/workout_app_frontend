import Icon from './Icon.jsx';

function IconButton({ name, size = 22, label, className = '', ...rest }) {
  return (
    <button {...rest} className={'icon-btn ' + className} aria-label={label} title={label}>
      <Icon name={name} size={size} />
    </button>
  );
}

export default IconButton;
